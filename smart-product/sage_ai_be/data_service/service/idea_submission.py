"""
Submission Service Module
Contains business logic for handling idea submissions
"""

import asyncio
import json
import logging
from typing import List, Dict, Any, Optional
from uuid import uuid4

from data_service.clients.s3_client import s3_client
from data_service.constants.constants import (
    ProcessingStatus,
    SubmissionStatus,
    FormStatus,
    UploadStatus,
)
from data_service.models.categories import Categories
from data_service.models.form_schemas import FormSchemas
from data_service.models.submission_forms import SubmissionForms
from data_service.models.submissions import Submissions
from data_service.models.uploaded_documents import UploadedDocuments
from data_service.models.users import Users
from data_service.service import background_document_processor
from data_service.exceptions.service_errors import DocumentExtractionServiceError
from data_service.utils.processing_status_utils import update_processing_status
from fastapi import HTTPException, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

logger = logging.getLogger(__name__)


class SubmissionService:
    """
    Service class for handling submission-related business logic
    """

    def __init__(self, db: AsyncSession):
        """
        Initialize the submission service

        Args:
            db (AsyncSession): Database session
        """
        self.db = db

    async def create_idea_submission(
        self,
        submission_journey_str: str,
        files: Optional[List[UploadFile]],
        current_user: Users,
    ) -> Dict[str, Any]:
        """
        Create a new idea submission with all related data

        Args:
            submission_journey_str (str): JSON string containing form data
            files (Optional[List[UploadFile]]): List of uploaded files
            current_user (Users): Current authenticated user

        Returns:
            Dict[str, Any]: Response containing submission details
        """
        try:
            journey_data = self._parse_submission_journey(submission_journey_str)

            category_id = await self.get_category_id_by_name(
                "Innovative"
            )  # Added dummy category name here

            submission = await self._create_submission_record(
                journey_data, category_id, current_user
            )

            form_schemas = await self._get_all_form_schemas_by_category(category_id)

            submission_forms = await self._create_submission_form_records(
                submission, form_schemas
            )

            uploaded_files = await self._handle_file_uploads(files, submission)

            file_metadata = {
                f["file_name"]: {
                    "s3_key": f["s3_key"],
                    "presigned_url": f["presigned_url"],
                    "upload_status": f["upload_status"],
                }
                for f in uploaded_files
            }

            await self._queue_document_extraction(
                files=files,
                file_metadata=file_metadata,
                submission=submission,
                form_schemas=form_schemas,
                submission_forms=submission_forms,
            )

            await self.db.commit()
            logger.info(f"Submission {submission.id} committed successfully")

            return self._build_response(submission, category_id)

        except HTTPException as e:
            await self.db.rollback()
            logger.error(f"HTTPException caught, rolling back: {e.detail}")
            raise
        except DocumentExtractionServiceError as e:
            await self.db.rollback()
            logger.error(
                f"DocumentExtractionServiceError caught, rolling back: {e.message}"
            )
            raise
        except Exception as e:
            await self.db.rollback()
            logger.exception("Exception caught, rolling back")
            raise DocumentExtractionServiceError(
                error="Internal Server Error",
                message=f"Failed to create submission: {str(e)}",
                status_code=500,
            )

    def _parse_submission_journey(self, submission_journey_str: str) -> Dict[str, Any]:
        """
        Parse and validate the submission journey JSON string

        Args:
            submission_journey_str (str): JSON string to parse

        Returns:
            Dict[str, Any]: Parsed journey data

        """
        try:
            return json.loads(submission_journey_str)
        except json.JSONDecodeError as e:
            raise DocumentExtractionServiceError(
                error="Validation Error",
                message=f"Invalid JSON format in submission_journey: {str(e)}",
                status_code=400,
            )

    def _extract_submission_details(self, journey_data: Dict[str, Any]) -> tuple:
        """
        Extract title and description from journey data

        Args:
            journey_data (Dict[str, Any]): Parsed journey data

        Returns:
            tuple: (title, description)
        """
        # Title will be populated later when idea-sub-form is submitted
        title = ""
        description = ""

        form_data = journey_data
        # if form_data and len(form_data) > 0:
        #     first_answer = form_data[0].get("answer", [""])
        #     if first_answer:
        #         description = first_answer[0]

        return title, description

    async def _create_submission_record(
        self, journey_data: Dict[str, Any], category_id: str, current_user: Users
    ) -> Submissions:
        """
        Create and save a new submission record

        Args:
            journey_data (Dict[str, Any]): Parsed journey data
            category_id (str): Category ID
            current_user (Users): Current user

        Returns:
            Submissions: Created submission record
        """
        title, description = self._extract_submission_details(journey_data)

        new_submission = Submissions(
            id=uuid4(),
            title=title,
            description=description,
            status=SubmissionStatus.SUBMITTED,
            submission_journey=journey_data,
            submitter_id=current_user.id,
            category_id=category_id,
        )

        self.db.add(new_submission)
        await self.db.flush()
        await self.db.refresh(new_submission)

        return new_submission

    async def _get_all_form_schemas_by_category(
        self, category_id: str
    ) -> List[FormSchemas]:
        """
        Retrieve ALL form schemas for a category ID

        Args:
            category_id (str): Category ID to search for

        Returns:
            List[FormSchemas]: List of all form schemas for the category

        """
        result = await self.db.execute(
            select(FormSchemas)
            .where(FormSchemas.category_id == category_id)
            .where(FormSchemas.is_active == True)
        )
        form_schemas = result.scalars().all()

        if not form_schemas:
            raise DocumentExtractionServiceError(
                error="Not Found",
                message=f"No active form schemas found for category: {category_id}",
                status_code=404,
            )

        return form_schemas

    async def _create_submission_form_records(
        self, submission: Submissions, form_schemas: List[FormSchemas]
    ) -> List[SubmissionForms]:
        """
        Create submission form linking records for ALL form schemas

        Args:
            submission (Submissions): Created submission
            form_schemas (List[FormSchemas]): List of form schemas for the category
            journey_data (Dict[str, Any]): Journey data

        Returns:
            List[SubmissionForms]: List of created submission form records
        """
        submission_forms = []

        for form_schema in form_schemas:
            form_type = getattr(form_schema, "form_type", "default")

            submission_form = SubmissionForms(
                id=uuid4(),
                submission_id=submission.id,
                form_schema_id=form_schema.id,
                form_type=form_type,
                form_data=form_schema.schema_json,
                status=FormStatus.PENDING,
                ai_metadata={},
                submitted_at=submission.created_at,
            )

            self.db.add(submission_form)
            submission_forms.append(submission_form)

        await self.db.flush()

        for submission_form in submission_forms:
            await self.db.refresh(submission_form)

        return submission_forms

    async def _handle_file_uploads(
        self, files: Optional[List[UploadFile]], submission: Submissions
    ) -> List[Dict[str, str]]:
        """
        Handle file uploads to S3 and create document records

        Args:
            files (Optional[List[UploadFile]]): Files to upload
            submission (Submissions): Associated submission

        Returns:
            List[Dict[str, str]]: List of uploaded file information
        """
        uploaded_files = []

        if not files:
            return uploaded_files

        for file in files:
            file_info = await self._upload_single_file(file, submission)

            if file_info["upload_status"] == UploadStatus.FAILED:
                raise DocumentExtractionServiceError(
                    error="Upload Failed",
                    message="Unable to upload your documents at this time. Please try again later.",
                    status_code=500,
                )

            uploaded_files.append(file_info)

        return uploaded_files

    async def _upload_single_file(
        self, file: UploadFile, submission: Submissions
    ) -> Dict[str, Any]:
        """
        Upload file to S3 with retries, graceful degradation on failure

        Returns file metadata even if S3 upload fails (presigned_url will be None)
        """
        max_retries = 3
        base_delay = 1
        s3_key = None
        presigned_url = None
        upload_status = UploadStatus.FAILED

        # Create structured S3 path: {userId}/{submissionId}/archetype
        custom_path = f"{submission.submitter_id}/{submission.id}/archetype"
        original_filename = file.filename
        new_s3_path = f"{custom_path}/{original_filename}"

        logger.info(
            f"Uploading file - Original: {original_filename}, New S3 path: {new_s3_path}"
        )

        for attempt in range(max_retries):
            try:
                # S3Client raises boto3 exceptions on failure
                upload_result = await s3_client.upload_file(
                    file, custom_key=custom_path
                )
                s3_key = upload_result["s3_key"]

                # Generate presigned URL - raises boto3 exceptions on failure
                presigned_url = s3_client.generate_presigned_url(
                    s3_key=s3_key, expiration=3600
                )

                upload_status = UploadStatus.SUCCESS
                logger.info(f"S3 upload successful: {file.filename}")
                break

            except Exception as e:
                # Catch boto3 exceptions and other exceptions for retry logic
                logger.warning(
                    f"S3 upload attempt {attempt + 1}/{max_retries} failed: {str(e)}"
                )

            if attempt < max_retries - 1:
                delay = base_delay * (2**attempt)
                await asyncio.sleep(delay)

        if upload_status == UploadStatus.FAILED:
            logger.warning(
                f"S3 upload failed after {max_retries} attempts: {file.filename}. Continuing with extraction."
            )

        # Use placeholder path when S3 upload fails (DB constraint requires non-null)
        file_path = s3_key if s3_key else f"upload-failed/{file.filename}"

        file_meta = UploadedDocuments(
            id=uuid4(),
            submission_id=submission.id,
            file_name=file.filename,
            file_path=file_path,
            document_metadata={
                "archetype_id": str(submission.category_id),
                "submitter_id": str(submission.submitter_id),
                "upload_status": upload_status,
                "retry_attempts": max_retries,
                "file_size": file.size if hasattr(file, "size") else None,
                "content_type": (
                    file.content_type if hasattr(file, "content_type") else None
                ),
            },
            uploaded_at=submission.created_at,
        )
        self.db.add(file_meta)

        return {
            "file_name": file.filename,
            "s3_key": s3_key,
            "presigned_url": presigned_url,
            "upload_status": upload_status,
        }

    async def _queue_document_extraction(
        self,
        files: Optional[List[UploadFile]],
        file_metadata: Dict[str, Dict[str, Any]],
        submission: Submissions,
        form_schemas: List[FormSchemas],
        submission_forms: List[SubmissionForms],
    ) -> None:
        """
        Queue document extraction for background processing

        Args:
            files: List of uploaded files
            file_metadata: S3 metadata for uploaded files
            submission: Created submission record
            form_schemas: Form schemas for the category
            submission_forms: Created submission form records
        """
        if files:
            logger.info("Queueing document extraction for background processing")

            files_data = []
            for file in files:
                await file.seek(0)
                content = await file.read()
                files_data.append(
                    {
                        "filename": file.filename,
                        "content": content,
                        "content_type": file.content_type,
                    }
                )

            await update_processing_status(
                db=self.db,
                submission_id=submission.id,
                status=ProcessingStatus.PENDING,
                message="Your documents are being prepared for processing...",
            )

            asyncio.create_task(
                background_document_processor.process_documents_in_background(
                    submission_id=submission.id,
                    files_data=files_data,
                    file_metadata=file_metadata,
                    form_schemas=form_schemas,
                    submission_forms=submission_forms,
                )
            )

            logger.info(
                f"Background extraction task started for submission {submission.id}"
            )
        else:
            # No documents uploaded
            logger.info(
                f"No documents uploaded for submission {submission.id}, skipping extraction"
            )

    def _build_response(
        self, submission: Submissions, category_id: str
    ) -> Dict[str, Any]:
        """
        Build the final API response

        Args:
            submission (Submissions): Created submission
            category_id (str): Category ID

        Returns:
            Dict[str, Any]: API response
        """
        return {
            "message": "Submission created",
            "data": {"id": str(submission.id), "category-id": str(category_id)},
        }

    async def get_category_id_by_name(self, category_name: str) -> str:
        """
        Get category ID by category name

        Args:
            category_name (str): Name of the category to look up

        Returns:
            str: Category ID

        """
        try:
            result = await self.db.execute(
                select(Categories)
                .where(Categories.name == category_name)
                .where(Categories.is_active == True)
            )
            category = result.scalars().first()

            if not category:
                raise DocumentExtractionServiceError(
                    error="category_not_found",
                    message=f"Active category with name '{category_name}' not found",
                    status_code=404,
                )

            return str(category.id)

        except DocumentExtractionServiceError:
            raise
        except Exception as e:
            logger.exception("Failed to retrieve category")
            raise DocumentExtractionServiceError(
                error="category_retrieval_failed",
                message=f"Failed to retrieve category: {str(e)}",
                status_code=500,
            ) from e
