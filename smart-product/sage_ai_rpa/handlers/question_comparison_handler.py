"""
Question Comparison Handler Module
===================================
Orchestrates question extraction and comparison workflows.
"""

import logging
from typing import List, Dict, Any

from service.question_comparison_service import QuestionComparisonService
from exceptions import (
    QuestionExtractionError,
    QuestionComparisonError,
    ConfigurationError,
)

logger = logging.getLogger(__name__)


class QuestionComparisonHandler:
    """
    Handler for question comparison operations.
    Orchestrates extraction and comparison workflows.
    """

    def __init__(self):
        """Initialize question comparison handler."""
        self.logger = logger

    def compare_form_questions(
        self,
        form_type: str,
        json_file: str,
        use_conditional: bool = True,
        max_depth: int = 3,
        max_options: int = 5,
        rpa_config: Dict = None,
        send_email: bool = True,
    ) -> Dict[str, Any]:
        """
        Compare extracted questions with existing questions from JSON file.

        This is the main entry point for question comparison.
        Coordinates extraction and comparison via service layer.

        Args:
            form_type: Type of form to process
            json_file: Path to JSON file with existing questions
            use_conditional: Whether to use conditional exploration
            max_depth: Maximum depth for conditional exploration
            max_options: Maximum options to test per question
            rpa_config: RPA configuration for email settings
            send_email: Whether to send email notifications

        Returns:
            Dictionary with comparison results

        Raises:
            QuestionComparisonError: If comparison fails
            QuestionExtractionError: If extraction fails
            ConfigurationError: If configuration is invalid
        """
        self.logger.info(
            "Starting question comparison: form_type=%s, json_file=%s",
            form_type,
            json_file,
        )

        try:
            # Initialize service
            service = QuestionComparisonService(
                form_type=form_type,
                json_file=json_file,
            )

            # Execute comparison workflow
            comparison_result = service.execute_comparison(
                use_conditional=use_conditional,
                max_depth=max_depth,
                max_options=max_options,
                rpa_config=rpa_config,
                send_email=send_email,
            )

            self.logger.info(
                "Comparison completed: form_type=%s, matches=%s, new=%s, missing=%s",
                form_type,
                comparison_result["match_count"],
                comparison_result["new_count"],
                comparison_result["missing_count"],
            )

            return comparison_result

        except (QuestionExtractionError, QuestionComparisonError, ConfigurationError) as e:
            # Log the error and return error result - don't re-raise
            self.logger.error(f"Comparison failed for {form_type}: {e.message}")
            return {
                "error": e.error,
                "message": e.message,
                "form_type": form_type,
                "total_extracted": 0,
                "total_existing": 0,
                "match_count": 0,
                "new_count": 0,
                "missing_count": 0,
            }
        except Exception as e:
            # Log unexpected errors and return error result
            self.logger.error(f"Unexpected error during comparison: {e}", exc_info=True)
            return {
                "error": "Internal Server Error",
                "message": f"Unexpected error: {str(e)}",
                "form_type": form_type,
                "total_extracted": 0,
                "total_existing": 0,
                "match_count": 0,
                "new_count": 0,
                "missing_count": 0,
            }

    def compare_all_forms(
        self,
        json_file: str,
        use_conditional: bool = True,
        max_depth: int = 3,
        max_options: int = 5,
        rpa_config: Dict = None,
        send_email: bool = True,
    ) -> Dict[str, Dict[str, Any]]:
        """
        Compare questions for all forms in the JSON file.

        Args:
            json_file: Path to JSON file with existing questions
            use_conditional: Whether to use conditional exploration
            max_depth: Maximum depth for conditional exploration
            max_options: Maximum options to test per question
            rpa_config: RPA configuration for email settings
            send_email: Whether to send email notifications

        Returns:
            Dictionary mapping form types to comparison results

        Raises:
            ConfigurationError: If JSON file cannot be loaded
        """
        self.logger.info("Starting comparison for all forms in: %s", json_file)

        # Get all form types from JSON
        service = QuestionComparisonService(json_file=json_file)

        try:
            form_types = service.get_all_form_types()
        except Exception as e:
            # Log and return error - don't raise from handler
            self.logger.error(f"Failed to load form types from {json_file}: {e}")
            return {"_error": f"Failed to load form types: {e}"}

        if not form_types:
            self.logger.error(f"No form types found in JSON file: {json_file}")
            return {"_error": "No form types found in JSON file"}

        self.logger.info(
            "Found %s form types: %s",
            len(form_types),
            ", ".join(form_types),
        )

        # Process each form type
        all_results = {}
        for idx, form_type in enumerate(form_types, 1):
            self.logger.info(
                "Processing %s/%s: %s",
                idx,
                len(form_types),
                form_type,
            )

            try:
                comparison = self.compare_form_questions(
                    form_type=form_type,
                    json_file=json_file,
                    use_conditional=use_conditional,
                    max_depth=max_depth,
                    max_options=max_options,
                    rpa_config=rpa_config,
                    send_email=send_email,
                )

                all_results[form_type] = {
                    "total_extracted": comparison["total_extracted"],
                    "total_existing": comparison["total_existing"],
                    "match_count": comparison["match_count"],
                    "new_count": comparison["new_count"],
                    "missing_count": comparison["missing_count"],
                }

            except Exception as e:
                self.logger.error(f"Error processing {form_type}: {e}")
                all_results[form_type] = {"error": str(e)}

        self.logger.info("Completed comparison for all forms")
        return all_results
