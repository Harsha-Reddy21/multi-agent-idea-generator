"""
RPA Handler Module
==================
Orchestrates RPA queue job execution and manages workflow.
"""

import logging
from typing import List

from service.form_automation_service import FormAutomationService
from exceptions import FormAutomationServiceError
from serializers.rpa_schemas import (
    RPAJobResponse,
    BatchProcessResponse,
    QueueJobInfo,
)

logger = logging.getLogger(__name__)


class RPAHandler:
    """
    Handler for RPA operations.
    Orchestrates form automation workflows and manages job execution.
    """

    def __init__(self):
        """Initialize RPA handler."""
        self.logger = logger

    async def process_queue(
        self,
        form_types: List[str],
        limit: int,
    ) -> BatchProcessResponse:
        """
        Process pending RPA jobs from the queue (sage_ai_rpa_status table).

        This is the main entry point for queue-based processing.
        Queries sage_ai_rpa_status for pending jobs and processes them.

        Args:
            form_types: List of form types to process
            limit: Maximum number of jobs to process

        Returns:
            BatchProcessResponse with queue processing results
        """
        self.logger.info("Processing RPA queue: form_types=%s, limit=%s", form_types, limit)

        try:
            # Get pending jobs from queue
            service = FormAutomationService()
            pending_jobs = await service.get_pending_queue_jobs(form_types=form_types, limit=limit)

            if not pending_jobs:
                self.logger.info("No pending jobs in queue")
                return BatchProcessResponse(
                    success=True,
                    message="No pending jobs to process",
                    processed_count=0,
                    success_count=0,
                    failed_count=0,
                )

            self.logger.info("Found %s pending jobs in queue", len(pending_jobs))

            # Process each job
            results = []
            success_count = 0
            failed_count = 0

            for job in pending_jobs:
                try:
                    self.logger.info(
                        "Processing job: submission_id=%s, form_type=%s, rpa_status_id=%s",
                        job.submission_id,
                        job.form_type,
                        job.rpa_status_id,
                    )

                    # Process the job
                    result = await self._process_queue_job(job)

                    if result.success:
                        success_count += 1
                    else:
                        failed_count += 1

                    results.append(result)

                except FormAutomationServiceError as e:
                    # Service errors are already logged - just record the failure
                    self.logger.error("Service error processing job %s: %s", job.rpa_status_id, e.message)
                    failed_count += 1
                    results.append(
                        RPAJobResponse(
                            success=False,
                            message=e.message,
                            submission_id=str(job.submission_id),
                            status="failed",
                            error_details=e.error,
                        )
                    )

                except Exception as e:
                    # Unexpected errors - log with full traceback
                    self.logger.exception("Unexpected error processing job for submission %s", job.submission_id)
                    failed_count += 1
                    results.append(
                        RPAJobResponse(
                            success=False,
                            message=f"Unexpected error: {str(e)}",
                            submission_id=str(job.submission_id),
                            status="failed",
                            error_details=str(e),
                        )
                    )

            response = BatchProcessResponse(
                success=True,
                message=f"Queue processing completed: {success_count} succeeded, {failed_count} failed",
                processed_count=len(results),
                success_count=success_count,
                failed_count=failed_count,
                results=results,
            )

            self.logger.info("Queue processing completed: %s/%s successful", success_count, len(results))

            return response

        except FormAutomationServiceError as e:
            # Service error getting pending jobs
            self.logger.error("Service error in queue processing: %s", e.message)
            return BatchProcessResponse(
                success=False,
                message=e.message,
                processed_count=0,
                success_count=0,
                failed_count=0,
            )

        except Exception as e:
            # Unexpected error in queue processing setup
            self.logger.exception("Unexpected error in queue processing")
            return BatchProcessResponse(
                success=False,
                message=f"Unexpected error: {str(e)}",
                processed_count=0,
                success_count=0,
                failed_count=0,
            )

    async def _process_queue_job(self, job: QueueJobInfo) -> RPAJobResponse:
        """
        Process a single queue job.

        Args:
            job: QueueJobInfo with job details

        Returns:
            RPAJobResponse with execution results
        """
        try:
            # Initialize service for this form type
            service = FormAutomationService(form_type=job.form_type)

            # Process the submission
            result = await service.process_rpa_job(
                rpa_status_id=job.rpa_status_id,
                submission_id=job.submission_id,
                form_schema_id=job.form_schema_id,
            )

            # Convert to response model
            response = RPAJobResponse(
                success=result.get("success", False),
                message=result.get("message", "Unknown error"),
                submission_id=str(job.submission_id),
                filled_questions=result.get("matched_count"),
                total_questions=result.get("total_questions"),
                status="completed" if result.get("success") else "failed",
                error_details=result.get("error_details"),
            )

            if response.success:
                self.logger.info(
                    "Successfully processed job %s: %s/%s questions filled",
                    job.rpa_status_id,
                    response.filled_questions,
                    response.total_questions,
                )
            else:
                self.logger.error("Failed to process job %s: %s", job.rpa_status_id, response.message)

            return response

        except FormAutomationServiceError as e:
            # Service error - already logged and job marked as failed by service layer
            self.logger.error("Service error processing queue job %s: %s", job.rpa_status_id, e.message)
            return RPAJobResponse(
                success=False,
                message=e.message,
                submission_id=str(job.submission_id),
                status="failed",
                error_details=e.error,
            )

        except Exception as e:
            # Unexpected error - should rarely happen if service layer handles errors properly
            self.logger.exception("Unexpected error processing queue job %s", job.rpa_status_id)
            return RPAJobResponse(
                success=False,
                message=f"Unexpected error: {str(e)}",
                submission_id=str(job.submission_id),
                status="failed",
                error_details=str(e),
            )
