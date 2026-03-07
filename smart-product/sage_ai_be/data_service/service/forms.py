"""
Business logic for form-related operations in the data service.

This module contains service-layer functions for form management, including
validation, authorization, and data retrieval for form details.
"""

import logging
import json
import asyncio
from collections import defaultdict
from typing import Optional, List, Dict, Any
from uuid import UUID, uuid4
from fastapi import UploadFile

from data_service.configurations.settings import settings
from data_service.clients.s3_client import s3_client
from data_service.models.question_mapping import QuestionMapping
from data_service.models.questions import Questions
from data_service.models.sage_ai_rpa_status import SageAIRPAStatus
from data_service.models.submission_forms import SubmissionForms
from data_service.models.submissions import Submissions
from data_service.models.uploaded_documents import UploadedDocuments
from data_service.models.users import Users
from data_service.serializers.common_fields import (
    CommonFieldsRequest,
    CommonFieldsResponse,
    CommonFieldItem,
    SourceField,
)
from data_service.serializers.forms import (
    FormResponse,
    FormSerializer,
    SubmitFormResponse,
    FormSummary,
)
from data_service.utils.error_utils import handle_service_exception
from data_service.exceptions.service_errors import (
    FormSubmissionServiceError,
    FormDetailsServiceError,
)

from data_service.constants.constants import (
    FormStatus,
    SubmissionStatus,
    FormAction,
    RPAStatus,
    UploadStatus,
    FormType,
)
from data_service.utils.validation import (
    validate_and_get_user,
    validate_uuid_format,
)
from data_service.utils.form_validators import (
    validate_form_ownership_and_status,
    validate_form_not_completed,
    validate_submission_ownership,
    validate_ai_registry_update_form_allowed,
)
from data_service.clients.cortex_client import cortex_client
from data_service.configurations.prompts.summarize_ans import (
    SUMMARIZE_MULTI_SOURCE_PROMPT,
)
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

logger = logging.getLogger(__name__)


class FormsService:
    """
    Service class for handling form-related operations.

    This service manages form submissions, validations, file uploads,
    and auto-population of common fields.
    """

    def __init__(self, db: AsyncSession):
        """
        Initialize the forms service.

        Args:
            db: Database session for query execution
        """
        self.db = db
        logger.debug("FormsService initialized")

    async def _handle_form_file_uploads(
        self,
        files: List[UploadFile],
        submission: Submissions,
        form_type: str,
        form_id: str,
    ) -> List[Dict[str, Any]]:
        """
        Handle file uploads to S3 for form submissions.

        Args:
            files: List of files to upload
            submission: Associated submission record
            form_type: Type of the form

        Returns:
            List of uploaded file metadata
        """
        uploaded_files = []

        for file in files:
            try:
                # Create S3 path: {userId}/{submissionId}/{form_type}/filename
                custom_path = f"{submission.submitter_id}/{submission.id}/{form_type}"

                logger.info(
                    f"Uploading file for form - File: {file.filename}, "
                    f"Path: {custom_path}, Form Type: {form_type}"
                )

                # Upload to S3 - raises boto3 exceptions on failure
                upload_result = await s3_client.upload_file(
                    file, custom_key=custom_path
                )

                s3_key = upload_result["s3_key"]

                # Generate presigned URL - raises boto3 exceptions on failure
                presigned_url = s3_client.generate_presigned_url(
                    s3_key=s3_key, expiration=3600
                )

                # Create database record
                uploaded_doc = UploadedDocuments(
                    id=uuid4(),
                    submission_id=submission.id,
                    file_name=file.filename,
                    file_path=s3_key,
                    form_id=form_id,
                    document_metadata={
                        "form_type": form_type,
                        "s3_bucket": upload_result["bucket"],
                        "content_type": upload_result["content_type"],
                        "size": upload_result["size"],
                        "presigned_url": presigned_url,
                    },
                )

                self.db.add(uploaded_doc)
                await self.db.flush()

                uploaded_files.append(
                    {
                        "file_name": file.filename,
                        "s3_key": s3_key,
                        "presigned_url": presigned_url,
                        "upload_status": UploadStatus.SUCCESS,
                    }
                )

                logger.info(f"Successfully uploaded {file.filename} to {s3_key}")

            except FormSubmissionServiceError:
                raise
            except Exception as e:
                logger.exception(f"Error uploading file {file.filename}")
                handle_service_exception(
                    e, FormSubmissionServiceError, "uploading file to S3"
                )

        return uploaded_files

    def _extract_and_update_submission_title(
        self, form_type: str, form_data: dict, submission: Submissions
    ) -> None:
        """
        Extract title from form data and update submission title for idea-sub-form.

        Args:
            form_type: The type of the form being submitted.
            form_data: The form data containing questions and answers.
            submission: The submission object to update.
        """
        if form_type != FormType.IDEA_SUB:
            return

        try:
            # Extract form_data array from nested structure
            if isinstance(form_data, dict) and "form_data" in form_data:
                questions_list = form_data["form_data"]
                # Find title question
                for question in questions_list:
                    if (
                        question.get("questionId")
                        == settings.idea_form_title_question_id
                    ):
                        answer = question.get("answer", [])
                        if answer and len(answer) > 0:
                            # Update submission title with the answer
                            submission.title = answer[0]
                        break
        except Exception as e:
            # Log error but don't fail the submission
            logger.error(
                "Error extracting title from question %s: %s",
                settings.idea_form_title_question_id,
                str(e),
            )

    async def submit_form(
        self,
        form_id: str,
        submission_id: str,
        form_data: dict,
        action: str,
        x_webauth_email: Optional[str],
        files: Optional[List[UploadFile]] = None,
    ) -> SubmitFormResponse:
        """
        Update form data and status with validation and authorization.

        Args:
            form_id: The UUID string of the form to update.
            submission_id: The UUID string of the submission.
            form_data: The form data to update.
            action: Either "save" or "submit".
            x_webauth_email: The email address from the X-WEBAUTH-EMAIL header.
            files: Optional files to upload to S3.

        Returns:
            SubmitFormResponse: A response object containing the updated form summary.

        Raises:
            FormSubmissionServiceError: If any validation, authorization, or data update error occurs.
        """
        try:
            # Validate authentication and get user
            user = await validate_and_get_user(
                x_webauth_email, self.db, FormSubmissionServiceError
            )

            # Validate UUIDs
            form_uuid = validate_uuid_format(
                form_id, "form-id", FormSubmissionServiceError
            )
            submission_uuid = validate_uuid_format(
                submission_id, "submission-id", FormSubmissionServiceError
            )

            # Validate form ownership and fetch form + submission in single query
            form, submission = await validate_form_ownership_and_status(
                form_id=form_uuid,
                submission_id=submission_uuid,
                user_id=user.id,
                db=self.db,
                error_class=FormSubmissionServiceError,
            )

            # Check if form is already completed
            validate_form_not_completed(form, FormSubmissionServiceError)
            # Validate ai-registry-update-form submission status
            await validate_ai_registry_update_form_allowed(
                form, submission, self.db, FormSubmissionServiceError
            )

            logger.info(
                "Updating form for form_id=%s, submission_id=%s, action=%s, user=%s",
                form_id,
                submission_id,
                action,
                x_webauth_email,
            )

            # Update form_data
            # Special handling for ai-registry-update-form to allow multiple updates:
            # - First condition: If form is not yet completed (new state from initial submission),
            #   update the existing record to avoid creating stale records
            # - Second condition: If form is already completed, create a new record for each subsequent update
            #   This allows tracking multiple updates as separate form submissions
            if (
                form.form_type == FormType.AI_REGISTRY_UPDATE
                and form.status != FormStatus.COMPLETED
            ):
                form.form_data = form_data
            elif form.form_type == FormType.AI_REGISTRY_UPDATE:
                new_form = SubmissionForms(
                    id=uuid4(),
                    submission_id=submission_uuid,
                    form_schema_id=form.form_schema_id,
                    form_type=FormType.AI_REGISTRY_UPDATE,
                    form_data=form_data,
                    status=FormStatus.COMPLETED,
                    form_category="optional",
                )
                self.db.add(new_form)
                # Update form reference to point to the new form for correct response
                form = new_form
            else:
                # For all other form types, update the form_data
                form.form_data = form_data

            # Extract and update submission title for idea-sub-form (irrespective of action)
            self._extract_and_update_submission_title(
                form.form_type, form_data, submission
            )

            # Update status based on action
            if action == FormAction.SAVE:
                form.status = FormStatus.IN_PROGRESS
            elif action == FormAction.SUBMIT:
                form.status = FormStatus.COMPLETED

            # Handle file uploads if files are provided
            if files:
                await self._handle_form_file_uploads(
                    files=files,
                    submission=submission,
                    form_type=form.form_type,
                    form_id=form_id,
                )

            await self.db.commit()

            logger.info(
                "Successfully updated form: form_id=%s, new_status=%s",
                form_id,
                form.status,
            )

            # If action is submit, create RPA status entry for supported form types
            if action == FormAction.SUBMIT:
                # Check if form type is supported by RPA (from settings)
                if form.form_type in settings.rpa_form_types_list:
                    # Create RPA status entry with pending status
                    rpa_status = SageAIRPAStatus(
                        submission_id=submission_uuid,
                        form_schema_id=form.form_schema_id,
                        status=RPAStatus.PENDING.value,
                        filled_questions=0,
                        total_questions=0,
                    )
                    self.db.add(rpa_status)
                    await self.db.commit()
                    logger.info(
                        "Created RPA status entry for submission_id=%s, form_schema_id=%s, form_type=%s",
                        submission_id,
                        form.form_schema_id,
                        form.form_type,
                    )

            # If action is submit, check if all recommended forms for this submission are completed
            if action == FormAction.SUBMIT:
                # Optimization: Use COUNT instead of fetching all incomplete recommended forms
                # Only count recommended forms (excluding optional and ai-registry-update-form)
                incomplete_count_result = await self.db.execute(
                    select(func.count())
                    .select_from(SubmissionForms)
                    .where(SubmissionForms.submission_id == submission_uuid)
                    .where(SubmissionForms.status != FormStatus.COMPLETED)
                    .where(SubmissionForms.form_category == "recommended")
                    .where(SubmissionForms.form_type != FormType.AI_REGISTRY_UPDATE)
                )
                incomplete_count = incomplete_count_result.scalar()

                # If no incomplete recommended forms, mark submission complete
                if incomplete_count == 0:
                    submission.status = SubmissionStatus.COMPLETED
                    await self.db.commit()
                    logger.info(
                        "All recommended forms completed, submission status updated to completed: %s",
                        submission_id,
                    )

            return SubmitFormResponse(
                message="Form updated successfully",
                data=FormSummary(
                    id=str(form.id),
                    submission_id=str(form.submission_id),
                    status=form.status,
                ),
            )

        except FormSubmissionServiceError:
            # Rollback for write operations
            await self.db.rollback()
            raise

        except Exception as e:
            # Rollback and handle unexpected errors
            await self.db.rollback()
            handle_service_exception(e, FormSubmissionServiceError, "update form")

    async def get_form_details(
        self,
        form_id: str,
        submission_id: str,
        x_webauth_email: Optional[str],
    ) -> FormResponse:
        """
        Retrieve form details for a given form and submission, with validation and authorization.

        Args:
            form_id: The UUID string of the form to retrieve.
            submission_id: The UUID string of the submission.
            x_webauth_email: The email address from the X-WEBAUTH-EMAIL header.

        Returns:
            FormResponse: A response object containing the form data and a success message.

        Raises:
            FormDetailsServiceError: If any validation, authorization, or data retrieval error occurs.
        """
        try:
            # Validate authentication and get user
            user = await validate_and_get_user(
                x_webauth_email, self.db, FormDetailsServiceError
            )

            # Validate UUIDs
            form_uuid = validate_uuid_format(
                form_id, "form-id", FormDetailsServiceError
            )
            submission_uuid = validate_uuid_format(
                submission_id, "submission-id", FormDetailsServiceError
            )

            logger.info(
                "Fetching form details for form_id=%s, submission_id=%s, user=%s",
                form_id,
                submission_id,
                x_webauth_email,
            )

            # Validate submission ownership
            submission = await validate_submission_ownership(
                submission_id=submission_uuid,
                user_id=user.id,
                db=self.db,
                error_class=FormDetailsServiceError,
            )

            # Query for the submission form
            form_result = await self.db.execute(
                select(SubmissionForms)
                .where(SubmissionForms.id == form_uuid)
                .where(SubmissionForms.submission_id == submission_uuid)
            )
            submission_form = form_result.scalars().first()
            files_result = await self.db.execute(
                select(UploadedDocuments.file_name, UploadedDocuments.form_id).where(
                    UploadedDocuments.submission_id == submission_uuid
                )
            )
            files_data = files_result.all()

            # Create dictionary mapping form_id to list of documents
            # Default to "archetype" if form_id is missing
            form_files_dict = {}
            for file_name, file_form_id in files_data:
                key = str(file_form_id) if file_form_id else "archetype"
                if key not in form_files_dict:
                    form_files_dict[key] = []
                form_files_dict[key].append(file_name)

            if not submission_form:
                logger.warning(
                    "Form not found for form_id=%s and submission_id=%s",
                    form_id,
                    submission_id,
                )
                raise FormDetailsServiceError(
                    error="Validation Error",
                    message="No form found for given form-id and submission-id",
                    status_code=400,
                )

            logger.info(
                "Successfully retrieved form details for form_id=%s, submission_id=%s",
                form_id,
                submission_id,
            )

            form_data = FormSerializer.from_orm(submission_form)
            form_data.files = form_files_dict
            return FormResponse(
                message="Form data fetched successfully", data=form_data
            )

        except FormDetailsServiceError:
            # Re-raise our own business logic errors
            raise

        except Exception as e:
            # Handle database and unexpected errors
            handle_service_exception(
                e, FormDetailsServiceError, "retrieve form details"
            )

    async def _fetch_question_mappings(self, form_type: str) -> Dict[str, List[str]]:
        """
        Fetch question mappings for a given form type.

        Args:
            form_type: The target form type to fetch mappings for.

        Returns:
            Dictionary mapping target question IDs to list of source question IDs (in priority order).
        """
        mapping_result = await self.db.execute(
            select(QuestionMapping)
            .where(QuestionMapping.target_form_type == form_type)
            .order_by(QuestionMapping.target_question_id, QuestionMapping.priority)
        )
        mappings = mapping_result.scalars().all()

        # Build reversed mapping: target_qid -> list of source_qids (in priority order)
        targets_to_sources = defaultdict(list)
        for m in mappings:
            targets_to_sources[m.target_question_id].append(m.source_question_id)

        return targets_to_sources

    async def _collect_answers_from_forms(
        self, submission_uuid: UUID
    ) -> tuple[Dict[str, str], Dict[str, str]]:
        """
        Collect all answers from submission forms.

        Args:
            submission_uuid: The submission UUID to fetch forms for.

        Returns:
            Tuple of (all_answers, question_form_types) where:
                - all_answers: Maps question_id to answer text
                - question_form_types: Maps question_id to form_type
        """
        forms_result = await self.db.execute(
            select(SubmissionForms).where(
                SubmissionForms.submission_id == submission_uuid
            )
        )
        completed_forms = forms_result.scalars().all()

        all_answers = {}
        question_form_types = {}

        for form in completed_forms:
            form_data_json = form.form_data or {}
            form_data_list = []
            if (
                isinstance(form_data_json, dict)
                and "form_data" in form_data_json
                and isinstance(form_data_json["form_data"], list)
            ):
                form_data_list = form_data_json["form_data"]

            for item in form_data_list:
                source_qid = item.get("questionId")
                answer_list = item.get("answer", [])
                # Only store non-empty answers
                if answer_list:
                    answer_str = (
                        ", ".join(str(a) for a in answer_list)
                        if isinstance(answer_list, list)
                        else str(answer_list)
                    )
                    # Skip empty strings after conversion
                    if answer_str.strip():
                        all_answers[source_qid] = answer_str
                        # Track the form_type for this question
                        question_form_types[source_qid] = form.form_type

        return all_answers, question_form_types

    async def _map_answers_to_targets(
        self,
        targets_to_sources: Dict[str, List[str]],
        all_answers: Dict[str, str],
        question_form_types: Dict[str, str],
    ) -> tuple[Dict[str, str], Dict[str, bool], Dict[str, List[Dict[str, Any]]]]:
        """
        Map source answers to target questions.

        Args:
            targets_to_sources: Mapping of target question IDs to source question IDs.
            all_answers: Collected answers from forms.
            question_form_types: Form types for each question.

        Returns:
            Tuple of (answer_map, multi_source_map, source_fields_map) where:
                - answer_map: Maps target question ID to merged answer
                - multi_source_map: Tracks which targets have multiple sources
                - source_fields_map: Tracks source field details for each target
        """
        answer_map = {}
        multi_source_map = {}
        source_fields_map = {}

        for target_qid, source_qids in targets_to_sources.items():
            # Mark as multi-source if more than one source maps to this target
            multi_source_map[target_qid] = len(source_qids) > 1

            # Collect all non-empty answers from sources (in priority order)
            collected_answers = []
            source_fields_list = []
            for priority_idx, source_qid in enumerate(source_qids, start=1):
                if source_qid in all_answers:
                    answer_text = all_answers[source_qid]
                    collected_answers.append(answer_text)
                    # Store source field info with form_type
                    source_fields_list.append(
                        {
                            "question_id": source_qid,
                            "answer": answer_text,
                            "priority": priority_idx,
                            "form_type": question_form_types.get(source_qid, ""),
                        }
                    )

            # Store source fields info
            source_fields_map[target_qid] = source_fields_list

            # Merge answers: concatenate with separator if multiple sources
            if collected_answers:
                if len(collected_answers) == 1:
                    # Single source: use as-is
                    answer_map[target_qid] = collected_answers[0]
                else:
                    # Multiple sources: merge with separator (priority order preserved)
                    answer_map[target_qid] = " | ".join(collected_answers)

        return answer_map, multi_source_map, source_fields_map

    async def _fetch_question_texts(
        self,
        answer_map: Dict[str, str],
        source_fields_map: Dict[str, List[Dict[str, Any]]],
    ) -> Dict[str, str]:
        """
        Fetch question texts for all target and source question IDs.

        Args:
            answer_map: Map of target question IDs to answers.
            source_fields_map: Map of target question IDs to source field details.

        Returns:
            Dictionary mapping question IDs to question texts.
        """
        target_qids = list(answer_map.keys())
        all_source_qids = set()
        for source_list in source_fields_map.values():
            all_source_qids.update(src["question_id"] for src in source_list)

        all_question_ids = list(set(target_qids) | all_source_qids)
        questions_result = await self.db.execute(
            select(Questions).where(Questions.id.in_(all_question_ids))
        )
        questions_data = {q.id: q.question for q in questions_result.scalars().all()}

        return questions_data

    def _build_common_fields(
        self,
        answer_map: Dict[str, str],
        multi_source_map: Dict[str, bool],
        source_fields_map: Dict[str, List[Dict[str, Any]]],
        questions_data: Dict[str, str],
    ) -> List[CommonFieldItem]:
        """
        Build CommonFieldItem objects from mapped data.

        Args:
            answer_map: Map of target question IDs to answers.
            multi_source_map: Map tracking which targets have multiple sources.
            source_fields_map: Map of target question IDs to source field details.
            questions_data: Map of question IDs to question texts.

        Returns:
            List of CommonFieldItem objects.
        """
        common_fields = [
            CommonFieldItem(
                question_id=target_qid,
                question=questions_data.get(target_qid, ""),
                answer=answer,
                multi_source=multi_source_map.get(target_qid, False),
                source_fields=[
                    SourceField(
                        question_id=src["question_id"],
                        question=questions_data.get(src["question_id"], ""),
                        answer=src["answer"],
                        priority=src["priority"],
                        form_type=src["form_type"],
                    )
                    for src in source_fields_map.get(target_qid, [])
                ],
            )
            for target_qid, answer in answer_map.items()
        ]
        return common_fields

    def _convert_to_dict(
        self, common_fields: List[CommonFieldItem]
    ) -> List[Dict[str, Any]]:
        """
        Convert CommonFieldItem objects to dictionary format for summarization.

        Args:
            common_fields: List of CommonFieldItem objects.

        Returns:
            List of dictionaries.
        """
        return [
            {
                "question_id": field.question_id,
                "question": field.question,
                "answer": field.answer,
                "multi_source": field.multi_source,
                "source_fields": [
                    {
                        "question_id": src.question_id,
                        "question": src.question,
                        "answer": src.answer,
                        "priority": src.priority,
                        "form_type": src.form_type,
                    }
                    for src in field.source_fields
                ],
            }
            for field in common_fields
        ]

    def _convert_from_dict(
        self, fields_dict: List[Dict[str, Any]]
    ) -> List[CommonFieldItem]:
        """
        Convert dictionary format back to CommonFieldItem objects.

        Args:
            fields_dict: List of field dictionaries.

        Returns:
            List of CommonFieldItem objects.
        """
        return [
            CommonFieldItem(
                question_id=field["question_id"],
                question=field["question"],
                answer=field["answer"],
                multi_source=field["multi_source"],
                source_fields=[
                    SourceField(
                        question_id=src["question_id"],
                        question=src["question"],
                        answer=src["answer"],
                        priority=src["priority"],
                        form_type=src["form_type"],
                    )
                    for src in field["source_fields"]
                ],
            )
            for field in fields_dict
        ]

    async def auto_populate_common_fields(
        self,
        input_data: CommonFieldsRequest,
        x_webauth_email: Optional[str],
    ) -> CommonFieldsResponse:
        """
        Service to auto-populate common fields for a form.

        Fetches completed submission forms for the given submission_id,
        maps source question IDs to target question IDs using the mapping for the given form_type,
        and returns the mapped answers.

        Args:
            input_data: Request containing form_type, submission_id, and form_id.
            x_webauth_email: The email address from the X-WEBAUTH-EMAIL header.

        Returns:
            CommonFieldsResponse: List of common fields with question IDs and answers.

        Raises:
            AutoPopulateServiceError: If validation, authorization, or data retrieval errors occur.
        """
        try:
            # Validate authentication and get user
            from data_service.exceptions import AutoPopulateServiceError

            user = await validate_and_get_user(
                x_webauth_email, self.db, AutoPopulateServiceError
            )

            # Validate submission_id format
            submission_uuid = validate_uuid_format(
                str(input_data.submission_id), "submission-id", AutoPopulateServiceError
            )

            logger.info(
                "Auto-populating common fields for form_type=%s, submission_id=%s, user=%s",
                input_data.form_type,
                input_data.submission_id,
                x_webauth_email,
            )

            # Validate submission ownership
            from data_service.utils.form_validators import validate_submission_ownership

            await validate_submission_ownership(
                submission_id=submission_uuid,
                user_id=user.id,
                db=self.db,
                error_class=AutoPopulateServiceError,
            )

            # Fetch question mappings
            targets_to_sources = await self._fetch_question_mappings(
                input_data.form_type
            )

            # Collect answers from all forms
            all_answers, question_form_types = await self._collect_answers_from_forms(
                submission_uuid
            )

            # Map answers to target questions
            answer_map, multi_source_map, source_fields_map = (
                await self._map_answers_to_targets(
                    targets_to_sources, all_answers, question_form_types
                )
            )

            # Fetch question texts
            questions_data = await self._fetch_question_texts(
                answer_map, source_fields_map
            )

            # Log warning if any question IDs are missing from the database
            all_question_ids = set(answer_map.keys())
            for source_list in source_fields_map.values():
                all_question_ids.update(src["question_id"] for src in source_list)
            missing_qids = all_question_ids - set(questions_data.keys())
            if missing_qids:
                logger.warning(
                    "Question IDs not found in database for submission %s: %s",
                    input_data.submission_id,
                    missing_qids,
                )

            # Build common fields
            common_fields = self._build_common_fields(
                answer_map, multi_source_map, source_fields_map, questions_data
            )

            # Convert to dict for summarization
            common_fields_dict = self._convert_to_dict(common_fields)

            logger.info(
                "Initial common fields are prepared, starting summarization : %s",
                common_fields_dict,
            )

            # Summarize multi-source answers
            logger.info(
                "Summarizing multi-source answers for submission %s",
                input_data.submission_id,
            )
            summarized_fields = await summarize_multi_source_common_fields(
                common_fields_dict
            )

            # Convert back to CommonFieldItem objects
            common_fields = self._convert_from_dict(summarized_fields)

            logger.info(
                "Successfully auto-populated %d common fields for submission %s",
                len(common_fields),
                input_data.submission_id,
            )

            return CommonFieldsResponse(common_fields=common_fields)

        except AutoPopulateServiceError:
            # Re-raise our own business logic errors
            raise

        except Exception as e:
            # Handle database and unexpected errors
            handle_service_exception(
                e, AutoPopulateServiceError, "auto-populate common fields"
            )


async def summarize_single_answer(
    question_id: str, multi_source_answer: str
) -> Dict[str, str]:
    """
    Summarize a single multi-source answer using LLM.

    Args:
        question_id: The question ID
        multi_source_answer: The multi-source answer with " | " separator

    Returns:
        Dict with question_id and summarized_answer
    """

    try:
        # Build prompt
        prompt = SUMMARIZE_MULTI_SOURCE_PROMPT.format(
            multi_source_answer=multi_source_answer
        )

        # Call Cortex LLM
        llm_response = await cortex_client.invoke_ask(
            settings.summarize_compound_field_model,
            prompt,
            input_variables={"question": prompt},
        )

        # Parse JSON response
        try:
            response_data = json.loads(llm_response)
            summarized_answer = response_data.get(
                "summarized_answer", multi_source_answer
            )

            logger.info(
                "Parsed summarized answer for question_id=%s: %s",
                question_id,
                summarized_answer,
            )

            if not summarized_answer or not isinstance(summarized_answer, str):
                logger.warning(
                    "Invalid LLM response for question_id=%s, using original answer",
                    question_id,
                )
                summarized_answer = multi_source_answer

        except json.JSONDecodeError as e:
            logger.error(
                "JSON decode error for question_id=%s: %s, using original answer",
                question_id,
                str(e),
            )
            summarized_answer = multi_source_answer

        logger.info(
            "Successfully summarized answer for question_id=%s: %s",
            question_id,
            summarized_answer,
        )

        return {
            "question_id": question_id,
            "summarized_answer": summarized_answer,
        }

    except Exception as e:
        logger.exception(
            "Error summarizing answer for question_id=%s: %s, using original answer",
            question_id,
            str(e),
        )
        # Fallback: return original answer
        return {
            "question_id": question_id,
            "summarized_answer": multi_source_answer,
        }


async def summarize_multi_source_common_fields(
    common_fields: List[Dict[str, Any]],
) -> List[Dict[str, Any]]:
    """
    Filter and summarize multi-source answers in common fields.

    This function:
    1. Filters common_fields where multi_source is True
    2. Calls LLM in parallel to summarize each multi-source answer
    3. Updates the answer field with summarized content
    4. Returns the updated common_fields list

    Args:
        common_fields: List of common field dictionaries with structure:
            [
                {
                    "question_id": str,
                    "answer": str,
                    "multi_source": bool
                },
                ...
            ]

    Returns:
        Updated list of common fields with summarized multi-source answers

    Example:
        >>> common_fields = [
        ...     {"question_id": "AB-01", "answer": "Single answer", "multi_source": False},
        ...     {"question_id": "YT-24", "answer": "AI | ML", "multi_source": True}
        ... ]
        >>> updated_fields = await summarize_multi_source_common_fields(common_fields)
    """
    if not common_fields:
        logger.warning("No common fields provided for summarization")
        return common_fields

    logger.info("Starting summarization for %d common fields", len(common_fields))

    # Step 1: Filter multi-source fields
    multi_source_fields = [
        field for field in common_fields if field.get("multi_source", False)
    ]

    if not multi_source_fields:
        logger.info("No multi-source fields to summarize")
        return common_fields

    logger.info("Found %d multi-source fields to summarize", len(multi_source_fields))

    # Step 2: Create parallel summarization tasks
    summarization_tasks = [
        summarize_single_answer(
            question_id=field["question_id"],
            multi_source_answer=field["answer"],
        )
        for field in multi_source_fields
    ]

    # Step 3: Execute all LLM calls in parallel
    logger.info("Executing %d LLM calls in parallel", len(summarization_tasks))
    summarized_results = await asyncio.gather(
        *summarization_tasks, return_exceptions=True
    )

    # Step 4: Build lookup map for summarized answers
    summarized_map = {}
    for result in summarized_results:
        if isinstance(result, Exception):
            logger.error("Summarization task failed: %s", str(result))
            continue

        if isinstance(result, dict):
            question_id = result.get("question_id")
            summarized_answer = result.get("summarized_answer")
            if question_id and summarized_answer:
                summarized_map[question_id] = summarized_answer

    # Step 5: Update common_fields with summarized answers
    updated_count = 0
    for field in common_fields:
        if field.get("multi_source", False):
            question_id = field["question_id"]
            if question_id in summarized_map:
                field["answer"] = summarized_map[question_id]
                updated_count += 1

    logger.info(
        "Successfully summarized %d out of %d multi-source fields",
        updated_count,
        len(multi_source_fields),
    )
    logger.info("Summarization process completed: %s", common_fields)

    return common_fields


# Factory function to get FormsService instance
def get_forms_service(db: AsyncSession) -> FormsService:
    """
    Get or create FormsService instance.

    Args:
        db: Database session

    Returns:
        FormsService instance
    """
    return FormsService(db)


# Convenience function for integration
async def process_and_summarize_common_fields(
    common_fields: List[Dict[str, Any]],
) -> List[Dict[str, Any]]:
    """
    Main entry point for processing and summarizing common fields.

    Args:
        common_fields: List of common field dictionaries

    Returns:
        Updated list with summarized multi-source answers
    """
    try:
        return await summarize_multi_source_common_fields(common_fields)
    except Exception as e:
        logger.exception("Error in process_and_summarize_common_fields: %s", str(e))
        # Return original fields on error
        return common_fields
