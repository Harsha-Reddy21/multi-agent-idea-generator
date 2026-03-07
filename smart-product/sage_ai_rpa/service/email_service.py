"""
Email Service Module
====================
Service for handling email notifications for RPA operations.
"""

import logging
import asyncio
from typing import Dict, Any, List
from uuid import UUID

from utils.email_utils import send_simple_email

logger = logging.getLogger(__name__)


class EmailService:
    """Service class for sending email notifications"""

    def __init__(self):
        """Initialize the email service"""
        self.logger = logger

    async def send_completion_email(
        self,
        user_email: str,
        submission_id: UUID,
        form_type: str,
        automation_result: Dict[str, Any],
        total_questions: int,
    ) -> None:
        """
        Send email notification for successful form completion.

        Args:
            user_email: User's email address
            submission_id: Submission ID
            form_type: Type of form processed
            automation_result: Result from automation process
            total_questions: Total number of questions
        """
        try:
            filled_count = automation_result.get("matched_count", 0)
            failed_count = automation_result.get("failed_count", 0)
            unmatched_questions = automation_result.get("unmatched_questions", [])

            has_mismatches = len(unmatched_questions) > 0 or failed_count > 0

            if has_mismatches:
                subject = f"SAGE AI RPA: Form completed with {len(unmatched_questions)} unmatched and {failed_count} failed questions - Submission {submission_id}"
            else:
                subject = f"SAGE AI RPA: Form completed successfully - {filled_count}/{total_questions} questions filled - Submission {submission_id}"

            body = f"Your {form_type} submission has been processed. {filled_count} questions filled, {failed_count} failed, {len(unmatched_questions)} unmatched."

            logger.info("Preparing to send completion email to %s", user_email)
            # Send email synchronously
            send_simple_email(
                [user_email],
                subject,
                body,
            )

            self.logger.info("Completion email sent to %s", user_email)

        except Exception as e:
            self.logger.error("Failed to send completion email: %s", e)

    async def send_failure_email(
        self,
        user_email: str,
        submission_id: UUID,
        form_type: str,
        error_message: str,
    ) -> None:
        """
        Send email notification for failed form processing.

        Args:
            user_email: User's email address
            submission_id: Submission ID
            form_type: Type of form
            error_message: Error message
        """
        try:
            subject = f"SAGE AI RPA: Form processing failed - {form_type} - Submission {submission_id}"

            body = f"Your {form_type} submission failed: {error_message}"

            logger.info("Preparing to send failure email to %s", user_email)
            # Send email synchronously
            send_simple_email(
                [user_email],
                subject,
                body,
            )

            self.logger.info("Failure email sent to %s", user_email)

        except Exception as e:
            self.logger.error("Failed to send failure email: %s", e)
