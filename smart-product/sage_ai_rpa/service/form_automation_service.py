"""
Form Automation Service Module
===============================
Business logic for form automation, database operations, and status management.
Queue-based processing for RPA jobs from sage_ai_rpa_status table.
"""

import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from uuid import UUID
from sqlalchemy import select, and_

from models.submission_forms import SubmissionForms
from models.sage_ai_rpa_status import SageAIRPAStatus
from models.submissions import Submissions
from models.users import Users
from utils.form_processor import FormProcessor
from service.email_service import EmailService
from db_connection.db import AsyncSessionLocal
from configuration.constants import RPAStatus
from configuration.settings import settings
from exceptions import FormAutomationServiceError
from utils.error_utils import handle_service_exception
from serializers.rpa_schemas import QueueJobInfo

logger = logging.getLogger(__name__)


class FormAutomationService:
    """
    Service class for form automation operations.
    Handles database interactions, status management, and automation coordination.
    """

    def __init__(self, form_type: str = None):
        """
        Initialize the service.

        Args:
            form_type: Type of form to process (optional for queue processing)
        """
        self.form_type = form_type
        self.automation = FormProcessor(form_type) if form_type else None
        self.email_service = EmailService()
        self.logger = logger

    async def get_pending_queue_jobs(self, form_types: List[str], limit: int) -> List[QueueJobInfo]:
        """
        Get pending RPA jobs from the queue (sage_ai_rpa_status table).

        Queries for jobs with status='pending' and joins with submission_forms
        to get the form_type for filtering.

        Args:
            form_types: List of form types to process
            limit: Maximum number of jobs to return

        Returns:
            List of QueueJobInfo objects
        """
        try:
            async with AsyncSessionLocal() as db:
                # Calculate cutoff time for old jobs
                cutoff_time = datetime.utcnow() - timedelta(hours=settings.queue_max_age_hours)

                # Query for pending jobs with form type filter
                query = (
                    select(
                        SageAIRPAStatus.id.label("rpa_status_id"),
                        SageAIRPAStatus.submission_id,
                        SageAIRPAStatus.form_schema_id,
                        SageAIRPAStatus.created_at,
                        SubmissionForms.form_type,
                    )
                    .join(
                        SubmissionForms,
                        and_(
                            SageAIRPAStatus.submission_id == SubmissionForms.submission_id,
                            SageAIRPAStatus.form_schema_id == SubmissionForms.form_schema_id,
                        ),
                    )
                    .where(
                        and_(
                            SageAIRPAStatus.status == RPAStatus.PENDING.value,
                            SageAIRPAStatus.created_at >= cutoff_time,
                            SubmissionForms.form_type.in_(form_types),
                        )
                    )
                    .order_by(SageAIRPAStatus.created_at.asc())
                    .limit(limit)
                )

                result = await db.execute(query)
                rows = result.all()

                jobs = [
                    QueueJobInfo(
                        rpa_status_id=row.rpa_status_id,
                        submission_id=row.submission_id,
                        form_schema_id=row.form_schema_id,
                        form_type=row.form_type,
                        created_at=row.created_at,
                    )
                    for row in rows
                ]

                self.logger.info("Found %s pending jobs for form types: %s", len(jobs), form_types)

                return jobs

        except FormAutomationServiceError:
            raise
        except Exception as e:
            handle_service_exception(e, FormAutomationServiceError, "fetch pending queue jobs")

    async def process_rpa_job(
        self,
        rpa_status_id: UUID,
        submission_id: UUID,
        form_schema_id: UUID,
    ) -> Dict[str, Any]:
        """
        Process a single RPA job from the queue.

        This method:
        1. Updates job status to 'processing'
        2. Gets form data from submission_forms
        3. Runs browser automation
        4. Updates job status to 'completed' or 'failed'

        Args:
            rpa_status_id: RPA status record ID
            submission_id: Submission ID
            form_schema_id: Form schema ID

        Returns:
            Dict with automation results
        """
        self.logger.info("Processing RPA job: rpa_status_id=%s, submission_id=%s", rpa_status_id, submission_id)

        try:
            async with AsyncSessionLocal() as db:
                # Update status to processing
                await self._update_job_status(db, rpa_status_id, RPAStatus.PROCESSING.value)

                # Get form data
                result = await db.execute(
                    select(SubmissionForms).where(
                        and_(
                            SubmissionForms.submission_id == submission_id,
                            SubmissionForms.form_schema_id == form_schema_id,
                        )
                    )
                )
                form = result.scalar_one_or_none()

                if not form:
                    error_msg = f"Form not found for submission {submission_id}"
                    self.logger.error(error_msg)
                    await self._update_job_status(
                        db,
                        rpa_status_id,
                        RPAStatus.FAILED.value,
                        error_message=error_msg,
                    )
                    return {"success": False, "message": error_msg}

                # Get email from Submissions -> Users
                user_email = None
                try:
                    submission_result = await db.execute(
                        select(Submissions, Users.email)
                        .join(Users, Submissions.submitter_id == Users.id)
                        .where(Submissions.id == submission_id)
                    )
                    submission_data = submission_result.first()
                    if submission_data and submission_data[1]:
                        user_email = submission_data[1]
                        self.logger.info("Found email: %s", user_email)
                except Exception as e:
                    self.logger.error("Failed to fetch user email: %s", e)

                if not user_email:
                    error_msg = f"User email not found for submission {submission_id}"
                    self.logger.error(error_msg)
                    await self._update_job_status(
                        db,
                        rpa_status_id,
                        RPAStatus.FAILED.value,
                        error_message=error_msg,
                    )
                    return {"success": False, "message": error_msg}

                # Initialize automation with form type
                if not self.automation or self.automation.form_type != form.form_type:
                    self.automation = FormProcessor(form.form_type)

                # Extract and filter form data
                if isinstance(form.form_data, dict):
                    form_data_list = form.form_data.get("form_data", [])
                elif isinstance(form.form_data, list):
                    form_data_list = form.form_data
                else:
                    error_msg = "Invalid form_data format"
                    self.logger.error(error_msg)
                    await self._update_job_status(
                        db,
                        rpa_status_id,
                        RPAStatus.FAILED.value,
                        error_message=error_msg,
                    )
                    return {"success": False, "message": error_msg}

                # Filter out file types and empty answers
                form_data_list = [
                    item
                    for item in form_data_list
                    if item.get("type", "").lower() != "file" and item.get("answer") and len(item.get("answer", [])) > 0
                ]

                # Add system fields (submission_id and email)
                system_fields = [
                    {
                        "questionId": "SYSTEM-SUBMISSION-ID",
                        "question": "Submission Id",
                        "answer": [str(submission_id)],
                        "type": "textbox",
                    },
                    {
                        "questionId": "SYSTEM-EMAIL-ID",
                        "question": "Email Id",
                        "answer": [user_email],
                        "type": "textbox",
                    },
                ]
                form_data_list = system_fields + form_data_list

                self.logger.info("Added system fields - submission_id: %s, email: %s", submission_id, user_email)

                total_questions = len(form_data_list)
                self.logger.info("Processing %s questions", total_questions)

                # Run automation (async method with executor for browser I/O)
                automation_result = await self.automation.process_single_submission(form_data=form_data_list)

                # Update status based on result
                if automation_result.get("success"):
                    filled_count = automation_result.get("matched_count", 0)
                    await self._update_job_status(
                        db,
                        rpa_status_id,
                        RPAStatus.COMPLETED.value,
                        filled_questions=filled_count,
                    )
                    self.logger.info("Job completed successfully: %s/%s filled", filled_count, total_questions)

                    # Send success email notification
                    await self.email_service.send_completion_email(
                        user_email=user_email,
                        submission_id=submission_id,
                        form_type=form.form_type,
                        automation_result=automation_result,
                        total_questions=total_questions,
                    )
                else:
                    error_msg = automation_result.get("message", "Automation failed")
                    await self._update_job_status(
                        db,
                        rpa_status_id,
                        RPAStatus.FAILED.value,
                        error_message=error_msg,
                    )
                    self.logger.error("Job failed: %s", error_msg)

                    # Send failure email notification
                    await self.email_service.send_failure_email(
                        user_email=user_email,
                        submission_id=submission_id,
                        form_type=form.form_type,
                        error_message=error_msg,
                    )

                automation_result["total_questions"] = total_questions
                return automation_result

        except FormAutomationServiceError as e:
            # Service errors - mark job as failed
            self.logger.error("Service error processing RPA job %s: %s", rpa_status_id, e.message)
            try:
                async with AsyncSessionLocal() as db:
                    await self._update_job_status(
                        db,
                        rpa_status_id,
                        RPAStatus.FAILED.value,
                        error_message=e.message,
                    )
            except Exception:
                self.logger.exception("Failed to update job status on service error")
            return {"success": False, "message": e.message}

        except Exception as e:
            # Unexpected errors - mark job as failed and convert to service error
            self.logger.exception("Unexpected error processing RPA job %s", rpa_status_id)
            error_msg = f"Unexpected error: {str(e)}"
            try:
                async with AsyncSessionLocal() as db:
                    await self._update_job_status(
                        db,
                        rpa_status_id,
                        RPAStatus.FAILED.value,
                        error_message=error_msg,
                    )
            except Exception:
                self.logger.exception("Failed to update job status on exception")

            return {"success": False, "message": error_msg}

    async def _update_job_status(
        self,
        db,
        rpa_status_id: UUID,
        status: str,
        filled_questions: Optional[int] = None,
        error_message: Optional[str] = None,
    ):
        """
        Update RPA job status in database.

        Args:
            db: Database session
            rpa_status_id: RPA status record ID
            status: New status value
            filled_questions: Number of questions filled (optional)
            error_message: Error message if failed (optional)
        """
        result = await db.execute(select(SageAIRPAStatus).where(SageAIRPAStatus.id == rpa_status_id))
        rpa_status = result.scalar_one_or_none()

        if rpa_status:
            rpa_status.status = status

            if status == RPAStatus.PROCESSING.value:
                rpa_status.started_at = datetime.utcnow()

            if filled_questions is not None:
                rpa_status.filled_questions = filled_questions

            if error_message:
                rpa_status.error_message = error_message

            if status in [RPAStatus.COMPLETED.value, RPAStatus.FAILED.value]:
                rpa_status.completed_at = datetime.utcnow()

            await db.commit()
