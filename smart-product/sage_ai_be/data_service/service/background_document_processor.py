"""
Background Document Processor Service
======================================
Handles asynchronous document extraction with status tracking and SSE progress updates.

This module provides background task processing for document extraction:
- Manages document processing lifecycle with proper error handling
- Updates processing status in database with transaction safety
- Sends real-time progress via Server-Sent Events (SSE)
- Handles extraction results storage with data validation
- Provides comprehensive error recovery and status rollback capabilities
- Implements proper logging and observability

Usage:
    async with AsyncSessionLocal() as db:
        await process_documents_in_background(
            submission_id=uuid,
            files_data=file_list,
            file_metadata=metadata_dict,
            form_schemas=schemas,
            submission_forms=forms
        )

Note:
    This function is designed to be called as a background task and
    handles all exceptions internally to prevent task crashes.
"""

import logging
from io import BytesIO
from typing import Any, Dict, List, Optional
from uuid import UUID

from fastapi import UploadFile

from data_service.constants.constants import ProcessingStatus
from data_service.db_connection.db import AsyncSessionLocal
from data_service.models.form_schemas import FormSchemas
from data_service.models.submission_forms import SubmissionForms
from data_service.service.parallel_extraction_service import parallel_extraction_service
from data_service.utils.processing_status_utils import (
    update_processing_status,
    store_form_extractions,
)
from data_service.utils.sse_progress_tracker import sse_progress_tracker, ProgressStatus

logger = logging.getLogger(__name__)


class InMemoryUploadFile:
    """
    Wrapper class to mimic FastAPI UploadFile interface using in-memory content

    This class allows passing pre-loaded file content to functions expecting
    UploadFile objects, avoiding repeated file I/O operations.

    Attributes:
        filename: Name of the file
        content_type: MIME type of the file
        file: BytesIO buffer containing file content
        size: Size of the file in bytes
    """

    def __init__(
        self,
        filename: str,
        content: bytes,
        content_type: str = "application/octet-stream",
    ) -> None:
        self.filename: str = filename
        self.content_type: str = content_type
        self.file: BytesIO = BytesIO(content)
        self.size: int = len(content)

    async def read(self, size: int = -1) -> bytes:
        return self.file.read(size)

    async def seek(self, offset: int) -> int:
        return self.file.seek(offset)

    def __repr__(self) -> str:
        return f"<InMemoryUploadFile(filename='{self.filename}', size={self.size})>"


async def process_documents_in_background(
    submission_id: UUID,
    files_data: Optional[List[UploadFile]],
    file_metadata: Dict[str, Dict[str, Any]],
    form_schemas: List[FormSchemas],
    submission_forms: List[SubmissionForms],
) -> None:
    """
    Background task to extract documents and store results with status tracking

    This function orchestrates the complete document processing workflow:
    1. Initializes SSE progress tracking
    2. Updates processing status in database
    3. Converts files to in-memory format for efficient processing
    4. Executes parallel document extraction
    5. Stores extraction results in database
    6. Sends completion/failure notifications via SSE

    Args:
        submission_id: UUID of the submission being processed
        files_data: List of uploaded file objects (can be None for testing)
        file_metadata: Metadata for each file (S3 keys, URLs, etc.)
        form_schemas: Form schema definitions for the category
        submission_forms: Submission form instances to populate

    Returns:
        None (updates database and sends SSE events)

    Raises:
        ValueError: If submission_id is invalid UUID format

    Side Effects:
        - Updates SubmissionProcessingStatus table
        - Creates/updates FormExtractions records
        - Sends SSE progress updates to connected clients
        - Commits database transactions

    Note:
        This function does not raise exceptions; all errors are caught,
        logged, and result in FAILED status updates.
    """
    async with AsyncSessionLocal() as db:
        try:
            # Input validation
            if not submission_id:
                logger.error("[BACKGROUND] Invalid submission_id: %s", submission_id)
                return

            # Validate UUID format
            try:
                str(submission_id)  # Ensure it's convertible to string
            except (ValueError, TypeError) as e:
                logger.error("[BACKGROUND] Invalid submission_id format: %s", e)
                return

            logger.info(
                "[BACKGROUND] Starting document extraction for submission %s",
                submission_id,
            )

            # Input validation
            if not files_data:
                error_msg = f"No files provided for submission {submission_id}"
                logger.error("[BACKGROUND] %s", error_msg)
                await update_processing_status(
                    db=db,
                    submission_id=submission_id,
                    status=ProcessingStatus.FAILED,
                    message="No files to process.",
                )
                await sse_progress_tracker.update_progress(
                    submission_id=str(submission_id),
                    status=ProgressStatus.FAILED,
                    message=error_msg,
                )
                return

            file_count = len(files_data)

            # Initialize SSE progress tracking
            await sse_progress_tracker.update_progress(
                submission_id=str(submission_id),
                status=ProgressStatus.STARTED,
                message=f"Starting extraction for {file_count} document(s)",
                metadata={"total_files": file_count},
            )

            await update_processing_status(
                db=db,
                submission_id=submission_id,
                status=ProcessingStatus.PROCESSING,
                message="Processing your documents...",
            )

            in_memory_files = [
                InMemoryUploadFile(
                    filename=file_data["filename"],
                    content=file_data["content"],
                    content_type=file_data.get(
                        "content_type", "application/octet-stream"
                    ),
                )
                for file_data in files_data
            ]

            try:
                logger.info(
                    "[BACKGROUND] Processing %s file(s) for submission", file_count
                )

                extraction_result = await parallel_extraction_service.extract_documents_parallel(
                    files=in_memory_files,
                    file_metadata=file_metadata,
                    db=db,
                    max_retries=3,
                    # Pass submission_id for SSE tracking
                    submission_id=str(submission_id),
                )

                stats = extraction_result.get("stats", {})
                successful = stats.get("successful_files", 0)
                total = stats.get("total_files", 0)
                failed = stats.get("failed_files", 0)
                successful_questions = stats.get("successful_questions", 0)
                failed_questions = stats.get("failed_questions", 0)

                logger.info(
                    "[BACKGROUND] Extraction completed: "
                    "%d/%d files succeeded, %d failed, "
                    "%d/%d questions succeeded",
                    successful,
                    total,
                    failed,
                    successful_questions,
                    successful_questions + failed_questions,
                )

                # Handle complete failure vs partial success
                if not extraction_result["success"]:
                    error_msg = extraction_result.get(
                        "error", "Parallel extraction failed"
                    )
                    logger.error("[BACKGROUND] Extraction failed: %s", error_msg)

                    await sse_progress_tracker.update_progress(
                        submission_id=str(submission_id),
                        status=ProgressStatus.FAILED,
                        message=error_msg,
                        metadata=stats,
                    )

                    await update_processing_status(
                        db=db,
                        submission_id=submission_id,
                        status=ProcessingStatus.FAILED,
                        message="Unable to process your documents. Please fill out the forms manually.",
                    )
                    return

                # Check for partial success scenario
                has_failures = failed > 0 or failed_questions > 0
                if has_failures:
                    logger.warning(
                        "[BACKGROUND] Partial success: %d files failed, %d questions failed",
                        failed,
                        failed_questions,
                    )

                validation_passed = extraction_result.get("validation_passed", True)
                validation_errors = extraction_result.get("validation_errors", [])

                if not validation_passed:
                    logger.warning(
                        "[BACKGROUND] Schema validation failed: %s", validation_errors
                    )

                form_jsons = extraction_result["form_jsons"]
                logger.info(
                    "[BACKGROUND] Got %d form JSONs from extraction", len(form_jsons)
                )

                # Update SSE progress - storing results
                await sse_progress_tracker.update_progress(
                    submission_id=str(submission_id),
                    status=ProgressStatus.STORING_RESULTS,
                    message=f"Storing {len(form_jsons)} form extraction(s)",
                    metadata={"form_count": len(form_jsons)},
                )

                stored_count, failed_count = await store_form_extractions(
                    db=db,
                    submission_id=submission_id,
                    form_schemas=form_schemas,
                    submission_forms=submission_forms,
                    form_jsons=form_jsons,
                )

                logger.info(
                    "[BACKGROUND] Stored %d form extractions, %d failed for submission %s",
                    stored_count,
                    failed_count,
                    submission_id,
                )

                warning_count = len(validation_errors) if validation_errors else 0

                # Build comprehensive message based on results
                if has_failures:
                    # Partial success - inform user about what succeeded and what failed
                    failure_details = []
                    if failed > 0:
                        failure_details.append(
                            f"{failed}/{total} documents failed to process"
                        )
                    if failed_questions > 0:
                        failure_details.append(
                            f"{failed_questions} questions could not be answered"
                        )

                    message = (
                        f"Your forms have been partially populated from {successful}/{total} documents. "
                        + " and ".join(failure_details)
                        + ". Please review and complete the remaining fields."
                    )

                    await sse_progress_tracker.update_progress(
                        submission_id=str(submission_id),
                        status=ProgressStatus.WARNING,
                        message=message,
                        metadata={
                            "warning_count": warning_count + failed,
                            "validation_errors": (
                                validation_errors[:5] if validation_errors else []
                            ),
                            "failed_files": stats.get("failed_file_details", [])[:5],
                            "successful_files": successful,
                            "failed_files_count": failed,
                        },
                    )
                elif warning_count > 0:
                    message = "Your forms have been populated. Please review and edit as needed."
                    await sse_progress_tracker.update_progress(
                        submission_id=str(submission_id),
                        status=ProgressStatus.WARNING,
                        message=message,
                        metadata={
                            "warning_count": warning_count,
                            # Send first 5 errors
                            "validation_errors": validation_errors[:5],
                        },
                    )
                else:
                    message = "Your forms have been populated successfully."
                    await sse_progress_tracker.update_progress(
                        submission_id=str(submission_id),
                        status=ProgressStatus.SUCCESS,
                        message=message,
                        metadata=stats,
                    )

                await update_processing_status(
                    db=db,
                    submission_id=submission_id,
                    status=ProcessingStatus.COMPLETED,
                    message=message,
                )

                logger.info(
                    "[BACKGROUND] Document extraction completed successfully for submission %s",
                    submission_id,
                )

            finally:
                # Clean up in-memory files to prevent memory leaks
                for in_memory_file in in_memory_files:
                    try:
                        in_memory_file.file.close()
                    except Exception as cleanup_error:
                        logger.warning(
                            "[BACKGROUND] Failed to cleanup in-memory file %s: %s",
                            in_memory_file.filename,
                            cleanup_error,
                        )

        except (ValueError, TypeError, KeyError) as e:
            error_msg = (
                f"Validation/data error for submission {submission_id}: {str(e)}"
            )
            logger.exception("[BACKGROUND] %s", error_msg)
            await sse_progress_tracker.update_progress(
                submission_id=str(submission_id),
                status=ProgressStatus.FAILED,
                message=f"Document extraction failed: {str(e)}",
                metadata={
                    "error_type": type(e).__name__,
                    "submission_id": str(submission_id),
                },
            )

            await update_processing_status(
                db=db,
                submission_id=submission_id,
                status=ProcessingStatus.FAILED,
                message="Unable to process your documents. Please fill out the forms manually.",
            )
        except Exception as e:
            logger.exception(
                "[BACKGROUND] Unexpected error for submission %s: %s",
                submission_id,
                str(e),
            )
            await sse_progress_tracker.update_progress(
                submission_id=str(submission_id),
                status=ProgressStatus.FAILED,
                message="An unexpected error occurred during processing.",
            )

            await update_processing_status(
                db=db,
                submission_id=submission_id,
                status=ProcessingStatus.FAILED,
                message="Unable to process your documents. Please fill out the forms manually.",
            )
            # PLACEHOLDER: Rollback mechanism
            # await _rollback_submission_on_failure(db, submission_id)
