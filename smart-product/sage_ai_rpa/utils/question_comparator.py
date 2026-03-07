"""
Question Comparator Utility
============================
Utility to compare extracted questions with existing questions.
"""

import re
import logging
from typing import List, Dict, Set, Any

logger = logging.getLogger(__name__)


class QuestionComparator:
    """
    Utility class to compare extracted questions with existing questions.
    """

    def __init__(self):
        """Initialize the question comparator."""
        self.logger = logger

    @staticmethod
    def normalize_question_text(text: str) -> str:
        """
        Normalize question text for comparison.

        Removes leading numbers, extra whitespace, and converts to lowercase.

        Args:
            text: Raw question text

        Returns:
            Normalized question text
        """
        # Remove leading numbers and periods (e.g., "1.", "2.")
        text = re.sub(r"^\d+\.\s*", "", text.strip())
        # Remove extra whitespace
        text = " ".join(text.split())
        return text.lower()

    def compare(
        self,
        extracted: List[str],
        existing: List[str],
    ) -> Dict[str, Any]:
        """
        Compare extracted questions with existing questions.

        Args:
            extracted: List of extracted question texts
            existing: List of existing question texts

        Returns:
            Dictionary with comparison results containing:
                - matching: List of matching questions
                - new: List of new questions (in extracted but not in existing)
                - missing: List of missing questions (in existing but not in extracted)
                - total_extracted: Total number of extracted questions
                - total_existing: Total number of existing questions
                - match_count: Number of matching questions
                - new_count: Number of new questions
                - missing_count: Number of missing questions

        Raises:
            TypeError: If inputs are not lists
            ValueError: If inputs contain non-string elements
        """
        # Validate inputs
        if not isinstance(extracted, list):
            raise TypeError(f"extracted must be a list, got {type(extracted).__name__}")
        if not isinstance(existing, list):
            raise TypeError(f"existing must be a list, got {type(existing).__name__}")

        self.logger.debug(f"Comparing questions: extracted={len(extracted)}, existing={len(existing)}")

        try:
            # Normalize all questions
            extracted_normalized = {self.normalize_question_text(q): q for q in extracted}
            existing_normalized = {self.normalize_question_text(q): q for q in existing}

            extracted_set = set(extracted_normalized.keys())
            existing_set = set(existing_normalized.keys())

            # Find matches and differences
            matching = extracted_set & existing_set
            new_questions = extracted_set - existing_set
            missing_questions = existing_set - extracted_set

            result = {
                "matching": sorted([extracted_normalized[q] for q in matching]),
                "new": sorted([extracted_normalized[q] for q in new_questions]),
                "missing": sorted([existing_normalized[q] for q in missing_questions]),
                "total_extracted": len(extracted),
                "total_existing": len(existing),
                "match_count": len(matching),
                "new_count": len(new_questions),
                "missing_count": len(missing_questions),
            }

            self.logger.debug(
                f"Comparison complete: matches={result['match_count']}, "
                f"new={result['new_count']}, missing={result['missing_count']}"
            )

            return result

        except (TypeError, AttributeError) as e:
            # Utils should raise standard exceptions, not use handle_service_exception
            self.logger.exception("Error during question comparison: invalid data type")
            raise ValueError(f"Invalid input data for comparison: {str(e)}")
        except Exception as e:
            # Raise standard exception - let service layer handle conversion if needed
            self.logger.exception("Unexpected error during question comparison")
            raise RuntimeError(f"Failed to compare questions: {str(e)}")

    def print_comparison_report(
        self,
        comparison: Dict[str, Any],
        form_type: str,
    ):
        """
        Print a formatted comparison report.

        Args:
            comparison: Comparison results dictionary
            form_type: Form type being compared
        """
        self.logger.info("\n" + "=" * 80)
        self.logger.info(f"QUESTION COMPARISON REPORT: {form_type}")
        self.logger.info("=" * 80)

        self.logger.info(" SUMMARY:")
        self.logger.info(f"  Total Extracted Questions: {comparison['total_extracted']}")
        self.logger.info(f"  Total Existing Questions:  {comparison['total_existing']}")
        self.logger.info(f"  Matching:                {comparison['match_count']}")
        self.logger.info(f"  New (not in JSON):       {comparison['new_count']}")
        self.logger.info(f"  Missing (not extracted): {comparison['missing_count']}")

        if comparison["new"]:
            self.logger.info(f"\n NEW QUESTIONS ({len(comparison['new'])}) - " "Found in extraction but not in JSON:")
            for idx, q in enumerate(comparison["new"], 1):
                self.logger.info(f"  {idx}. {q}")

        if comparison["missing"]:
            self.logger.info(f"\n MISSING QUESTIONS ({len(comparison['missing'])}) - " "In JSON but not extracted:")
            for idx, q in enumerate(comparison["missing"], 1):
                self.logger.info(f"  {idx}. {q}")

        self.logger.info("\n" + "=" * 80)

        # Calculate match percentage
        total_unique = max(comparison["total_extracted"], comparison["total_existing"])
        if total_unique > 0:
            match_pct = (comparison["match_count"] / total_unique) * 100
            self.logger.info(f"Match Rate: {match_pct:.1f}%")

        self.logger.info("=" * 80 + "\n")
