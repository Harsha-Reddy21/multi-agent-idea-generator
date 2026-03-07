"""
Question Comparison Service Module
===================================
Business logic for question extraction and comparison operations.
"""

import json
import logging
from pathlib import Path
from typing import List, Dict, Any

from utils.question_extractor import QuestionExtractor
from utils.question_comparator import QuestionComparator
from utils.email_utils import send_simple_email
from utils.error_utils import handle_service_exception
from exceptions import (
    QuestionExtractionError,
    QuestionComparisonError,
    EmailNotificationError,
    ConfigurationError,
)

logger = logging.getLogger(__name__)


class QuestionComparisonService:
    """
    Service class for question comparison operations.
    Handles extraction, comparison, and notification logic.
    """

    def __init__(self, form_type: str = None, json_file: str = None):
        """
        Initialize the service.

        Args:
            form_type: Type of form to process (optional)
            json_file: Path to JSON file with existing questions (optional)
        """
        self.form_type = form_type
        self.json_file = json_file
        self.logger = logger

    def extract_questions(
        self,
        use_conditional: bool = True,
        max_depth: int = 3,
        max_options: int = 5,
    ) -> List[str]:
        """
        Extract questions from a form.

        Args:
            use_conditional: Whether to use conditional exploration
            max_depth: Maximum depth for conditional exploration
            max_options: Maximum options to test per question

        Returns:
            List of question texts

        Raises:
            QuestionExtractionError: If extraction fails
        """
        self.logger.info(f"Extracting questions for form: {self.form_type}")

        try:
            extractor = QuestionExtractor(form_type=self.form_type)

            questions_data = extractor.extract_all_questions(
                use_conditional_exploration=use_conditional,
                max_depth=max_depth,
                max_options=max_options,
            )

            # Extract just the question texts
            question_texts = [q["question_text"] for q in questions_data]

            self.logger.info(f"Extracted {len(question_texts)} questions")
            return question_texts

        except QuestionExtractionError:
            # Custom exception already raised by extractor - just re-raise
            raise
        except Exception as e:
            # Let handle_service_exception convert all other exceptions
            handle_service_exception(e, QuestionExtractionError, "extract questions from form")

    def load_existing_questions(self) -> List[str]:
        """
        Load existing questions from JSON file.

        Returns:
            List of existing question texts

        Raises:
            QuestionComparisonError: If loading fails
        """
        self.logger.info(f"Loading existing questions from: {self.json_file}")

        try:
            with open(self.json_file, "r", encoding="utf-8") as f:
                data = json.load(f)

            if self.form_type not in data:
                raise QuestionComparisonError(
                    f"Form type not found in {self.json_file}",
                    form_type=self.form_type,
                )

            questions = data[self.form_type]

            # Validate that questions is a list
            if not isinstance(questions, list):
                raise QuestionComparisonError(
                    f"Invalid questions format: expected list, got {type(questions).__name__}",
                    form_type=self.form_type,
                )

            self.logger.info(f"Loaded {len(questions)} existing questions")
            return questions

        except QuestionComparisonError:
            # Custom exceptions already properly formatted - just re-raise
            raise
        except Exception as exc:
            # Convert low-level exceptions (FileNotFoundError, JSONDecodeError, etc.)
            handle_service_exception(
                exc,
                QuestionComparisonError,
                f"load questions from {self.json_file}",
            )

    def compare_questions(
        self,
        extracted_questions: List[str],
        existing_questions: List[str],
    ) -> Dict[str, Any]:
        """
        Compare extracted questions with existing questions.

        Args:
            extracted_questions: List of extracted question texts
            existing_questions: List of existing question texts

        Returns:
            Dictionary with comparison results
        """
        self.logger.info("Comparing questions...")

        comparator = QuestionComparator()
        comparison_result = comparator.compare(
            extracted_questions,
            existing_questions,
        )

        self.logger.info(
            "Comparison complete: %s matches, %s new, %s missing",
            comparison_result["match_count"],
            comparison_result["new_count"],
            comparison_result["missing_count"],
        )

        return comparison_result

    def send_discrepancy_notification(
        self,
        comparison_result: Dict[str, Any],
        rpa_config: Dict,
    ) -> bool:
        """
        Send email notification if discrepancies are found.

        Args:
            comparison_result: Comparison results dictionary
            rpa_config: RPA configuration for email settings

        Returns:
            True if email sent successfully or not needed, False otherwise
        """
        try:
            # Check if there are any discrepancies
            has_discrepancies = comparison_result["new_count"] > 0 or comparison_result["missing_count"] > 0

            if not has_discrepancies:
                self.logger.info("No discrepancies found, skipping email notification")
                return True

            # Get email configuration
            email_config = rpa_config.get("email_notifications", {})

            if not email_config.get("enabled", False):
                self.logger.info("Email notifications are disabled in config")
                return True

            recipient_email = email_config.get("recipient_email")
            if not recipient_email:
                self.logger.warning("No recipient email configured for notifications")
                raise ConfigurationError(
                    "Recipient email not configured",
                    config_path="email_notifications.recipient_email",
                )

            # Create email subject and body
            subject = self._create_email_subject(comparison_result)
            body = self._create_email_body(comparison_result)

            # Send email
            self.logger.info(f"Sending notification to {recipient_email}")
            try:
                send_simple_email(
                    to_addresses=[recipient_email],
                    subject=subject,
                    body=body,
                )
                self.logger.info("Email notification sent successfully")
                return True

            except Exception as email_error:
                # Convert low-level exceptions to EmailNotificationError
                self.logger.exception("Failed to send email notification")
                handle_service_exception(email_error, EmailNotificationError, "send email notification")

        except (EmailNotificationError, ConfigurationError) as e:
            # Log custom exceptions and return False instead of raising
            # This allows the comparison workflow to continue even if email fails
            self.logger.error(f"Notification error: {e.message}")
            return False
        except Exception as e:
            # Convert unexpected exceptions
            self.logger.exception("Unexpected error in email notification")
            handle_service_exception(e, EmailNotificationError, "send email notification")

    def _create_email_subject(self, comparison: Dict[str, Any]) -> str:
        """Create email subject line."""
        subject = f"[SAGE AI RPA] Discrepancies: {self.form_type}"

        if comparison["new_count"] > 0 and comparison["missing_count"] > 0:
            subject += f" - {comparison['new_count']} new, {comparison['missing_count']} missing"
        elif comparison["new_count"] > 0:
            subject += f" - {comparison['new_count']} new"
        else:
            subject += f" - {comparison['missing_count']} missing"

        return subject

    def _create_email_body(self, comparison: Dict[str, Any]) -> str:
        """Create email body content."""
        from datetime import datetime

        try:
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            match_rate = 0
            total_unique = max(comparison["total_extracted"], comparison["total_existing"])
            if total_unique > 0:
                match_rate = (comparison["match_count"] / total_unique) * 100

            report = f"""SAGE AI RPA - Question Comparison Alert

Form Type: {self.form_type}
Time: {timestamp}

SUMMARY:
- Total Extracted: {comparison['total_extracted']}
- Total Existing: {comparison['total_existing']}
- Matching: {comparison['match_count']}
- New Questions: {comparison['new_count']}
- Missing Questions: {comparison['missing_count']}
- Match Rate: {match_rate:.1f}%
"""

            if comparison["new"]:
                report += f"\n\nNEW QUESTIONS ({comparison['new_count']}):\n"
                report += "Found in form but not in JSON:\n"
                for idx, q in enumerate(comparison["new"], 1):
                    report += f"{idx}. {q}\n"

            if comparison["missing"]:
                report += f"\n\nMISSING QUESTIONS ({comparison['missing_count']}):\n"
                report += "In JSON but not extracted from form:\n"
                for idx, q in enumerate(comparison["missing"], 1):
                    report += f"{idx}. {q}\n"

            report += "\n---\nThis is an automated notification from SAGE AI RPA."

            return report

        except Exception as e:
            # Let handle_service_exception convert any formatting errors
            self.logger.exception("Error formatting email body")
            handle_service_exception(e, EmailNotificationError, "format email body")

    def execute_comparison(
        self,
        use_conditional: bool = True,
        max_depth: int = 3,
        max_options: int = 5,
        rpa_config: Dict = None,
        send_email: bool = True,
    ) -> Dict[str, Any]:
        """
        Execute the full comparison workflow.

        Args:
            use_conditional: Whether to use conditional exploration
            max_depth: Maximum depth for conditional exploration
            max_options: Maximum options to test per question
            rpa_config: RPA configuration for email settings
            send_email: Whether to send email notifications

        Returns:
            Dictionary with comparison results
        """
        # Extract questions from form
        extracted_questions = self.extract_questions(
            use_conditional=use_conditional,
            max_depth=max_depth,
            max_options=max_options,
        )

        # Load existing questions from JSON
        existing_questions = self.load_existing_questions()

        # Compare questions
        comparison_result = self.compare_questions(
            extracted_questions,
            existing_questions,
        )

        # Send email notification if enabled
        if send_email and rpa_config:
            self.send_discrepancy_notification(comparison_result, rpa_config)

        return comparison_result

    def get_all_form_types(self) -> List[str]:
        """
        Get all form types from the JSON file.

        Returns:
            List of form types

        Raises:
            ConfigurationError: If file cannot be loaded
        """
        try:
            with open(self.json_file, "r", encoding="utf-8") as f:
                data = json.load(f)

            if not isinstance(data, dict):
                raise ConfigurationError(
                    f"Invalid JSON structure: expected dict, got {type(data).__name__}",
                    config_path=self.json_file,
                )

            return list(data.keys())

        except ConfigurationError:
            # Custom exception already properly formatted - just re-raise
            raise
        except Exception as exc:
            # Convert low-level exceptions (FileNotFoundError, JSONDecodeError, etc.)
            handle_service_exception(exc, ConfigurationError, f"load form types from {self.json_file}")
