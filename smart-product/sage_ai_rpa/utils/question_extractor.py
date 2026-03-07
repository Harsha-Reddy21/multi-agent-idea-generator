"""
Question Extractor Utility
===========================
Utility to extract ALL questions from Microsoft Forms, including conditional questions
that appear based on specific answer selections.

This is a wrapper around ConditionalQuestionScraper for the refactored architecture.
"""

import logging
from typing import List, Dict, Any

from utils.conditional_question_scraper import ConditionalQuestionScraper
from exceptions import QuestionExtractionError

logger = logging.getLogger(__name__)


class QuestionExtractor:
    """
    Utility class to extract questions from Microsoft Forms.
    Provides a cleaner interface for the service layer.
    """

    def __init__(self, form_type: str):
        """
        Initialize the question extractor.

        Args:
            form_type: Type of form to extract questions from
        """
        self.form_type = form_type
        self.scraper = ConditionalQuestionScraper(form_type=form_type)
        self.logger = logger

    def extract_all_questions(
        self,
        use_conditional_exploration: bool = True,
        max_depth: int = 5,
        max_options: int = 10,
    ) -> List[Dict[str, Any]]:
        """
        Extract all questions from the form.

        Args:
            use_conditional_exploration: Whether to explore conditional paths
            max_depth: Maximum depth for conditional exploration
            max_options: Maximum radio options to test per question

        Returns:
            List of question dictionaries

        Raises:
            QuestionExtractionError: If extraction fails
        """
        self.logger.info(
            f"Extracting questions: form_type={self.form_type}, " f"conditional={use_conditional_exploration}"
        )

        try:
            questions = self.scraper.extract_all_questions(
                use_conditional_exploration=use_conditional_exploration,
                max_depth=max_depth,
                max_options=max_options,
            )

            self.logger.info(f"Extracted {len(questions)} questions")
            return questions

        except QuestionExtractionError:
            # Custom exception from scraper - re-raise as-is
            raise
        except Exception as e:
            # Utils should raise standard exceptions, not wrap them
            # Let the service layer handle conversion via handle_service_exception
            self.logger.exception("Failed to extract questions from form %s", self.form_type)
            raise

    def close(self):
        """Close browser and cleanup resources."""
        try:
            if self.scraper:
                self.scraper.close_browser()
                self.logger.debug("Browser closed successfully")
        except Exception as e:
            self.logger.warning(f"Error closing browser: {e}")
