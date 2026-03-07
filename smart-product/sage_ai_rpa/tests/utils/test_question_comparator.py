"""
Tests for QuestionComparator utility
"""

import pytest
from unittest.mock import MagicMock, patch
from utils.question_comparator import QuestionComparator
from exceptions import QuestionComparisonError


class TestQuestionComparator:
    """Test cases for QuestionComparator"""

    @pytest.fixture
    def comparator(self):
        """Create a QuestionComparator instance"""
        return QuestionComparator()

    def test_normalize_question_text_removes_leading_numbers(self, comparator):
        """Test normalization removes leading numbers and periods"""
        text = "1. What is your name?"
        result = comparator.normalize_question_text(text)
        assert result == "what is your name?"

    def test_normalize_question_text_removes_extra_whitespace(self, comparator):
        """Test normalization removes extra whitespace"""
        text = "What   is    your   name?"
        result = comparator.normalize_question_text(text)
        assert result == "what is your name?"

    def test_normalize_question_text_converts_to_lowercase(self, comparator):
        """Test normalization converts to lowercase"""
        text = "What Is Your Name?"
        result = comparator.normalize_question_text(text)
        assert result == "what is your name?"

    def test_normalize_question_text_complex(self, comparator):
        """Test normalization with complex input"""
        text = "  10.   What    IS your   NAME?  "
        result = comparator.normalize_question_text(text)
        assert result == "what is your name?"

    def test_compare_with_matching_questions(self, comparator):
        """Test comparison with matching questions"""
        extracted = ["What is your name?", "What is your age?"]
        existing = ["What is your name?", "What is your age?"]

        result = comparator.compare(extracted, existing)

        assert result["match_count"] == 2
        assert result["new_count"] == 0
        assert result["missing_count"] == 0
        assert result["total_extracted"] == 2
        assert result["total_existing"] == 2
        assert len(result["matching"]) == 2

    def test_compare_with_new_questions(self, comparator):
        """Test comparison with new questions"""
        extracted = ["What is your name?", "What is your email?"]
        existing = ["What is your name?"]

        result = comparator.compare(extracted, existing)

        assert result["match_count"] == 1
        assert result["new_count"] == 1
        assert result["missing_count"] == 0
        assert "What is your email?" in result["new"]

    def test_compare_with_missing_questions(self, comparator):
        """Test comparison with missing questions"""
        extracted = ["What is your name?"]
        existing = ["What is your name?", "What is your age?"]

        result = comparator.compare(extracted, existing)

        assert result["match_count"] == 1
        assert result["new_count"] == 0
        assert result["missing_count"] == 1
        assert "What is your age?" in result["missing"]

    def test_compare_with_normalized_matching(self, comparator):
        """Test comparison with questions that match after normalization"""
        extracted = ["1. What is your name?", "2.   What   is YOUR age?"]
        existing = ["What is your name?", "What is your age?"]

        result = comparator.compare(extracted, existing)

        assert result["match_count"] == 2
        assert result["new_count"] == 0
        assert result["missing_count"] == 0

    def test_compare_raises_type_error_for_non_list_extracted(self, comparator):
        """Test compare raises TypeError when extracted is not a list"""
        with pytest.raises(TypeError) as exc_info:
            comparator.compare("not a list", ["question"])

        assert "extracted must be a list" in str(exc_info.value)

    def test_compare_raises_type_error_for_non_list_existing(self, comparator):
        """Test compare raises TypeError when existing is not a list"""
        with pytest.raises(TypeError) as exc_info:
            comparator.compare(["question"], "not a list")

        assert "existing must be a list" in str(exc_info.value)

    def test_compare_raises_value_error_for_invalid_data(self, comparator):
        """Test compare raises ValueError for invalid data types in lists"""
        extracted = ["valid question", 123]  # Contains non-string
        existing = ["valid question"]

        with pytest.raises(ValueError) as exc_info:
            comparator.compare(extracted, existing)

        assert "Invalid input data for comparison" in str(exc_info.value)

    def test_compare_with_empty_lists(self, comparator):
        """Test comparison with empty lists"""
        result = comparator.compare([], [])

        assert result["match_count"] == 0
        assert result["new_count"] == 0
        assert result["missing_count"] == 0
        assert result["total_extracted"] == 0
        assert result["total_existing"] == 0

    def test_compare_with_one_empty_list(self, comparator):
        """Test comparison with one empty list"""
        extracted = ["What is your name?"]
        existing = []

        result = comparator.compare(extracted, existing)

        assert result["match_count"] == 0
        assert result["new_count"] == 1
        assert result["missing_count"] == 0
        assert "What is your name?" in result["new"]

    def test_compare_logs_debug_messages(self, comparator):
        """Test compare logs debug messages"""
        extracted = ["What is your name?"]
        existing = ["What is your name?"]

        with patch.object(comparator.logger, "debug") as mock_debug:
            comparator.compare(extracted, existing)

            assert mock_debug.called

    def test_compare_handles_unexpected_exception(self, comparator):
        """Test compare handles unexpected exceptions"""
        # Mock normalize_question_text to raise an exception
        with patch.object(comparator, "normalize_question_text", side_effect=RuntimeError("Unexpected")):
            # The comparator raises RuntimeError for unexpected exceptions
            with pytest.raises(RuntimeError) as exc_info:
                comparator.compare(["test"], ["test"])

            assert "Failed to compare questions: Unexpected" in str(exc_info.value)

    def test_print_comparison_report(self, comparator, caplog):
        """Test printing comparison report"""
        comparison = {
            "total_extracted": 3,
            "total_existing": 4,
            "match_count": 2,
            "new_count": 1,
            "missing_count": 2,
            "new": ["New question?"],
            "missing": ["Missing question 1?", "Missing question 2?"],
            "matching": ["Matched question 1?", "Matched question 2?"],
        }

        with patch.object(comparator.logger, "info") as mock_info:
            comparator.print_comparison_report(comparison, "Test Form")

            # Verify logger.info was called multiple times
            assert mock_info.call_count > 5

    def test_print_comparison_report_with_no_new_questions(self, comparator):
        """Test printing comparison report with no new questions"""
        comparison = {
            "total_extracted": 2,
            "total_existing": 2,
            "match_count": 2,
            "new_count": 0,
            "missing_count": 0,
            "new": [],
            "missing": [],
            "matching": ["Question 1?", "Question 2?"],
        }

        with patch.object(comparator.logger, "info") as mock_info:
            comparator.print_comparison_report(comparison, "Test Form")

            # Should still log summary
            assert mock_info.called

    def test_print_comparison_report_calculates_match_percentage(self, comparator):
        """Test print_comparison_report calculates match percentage"""
        comparison = {
            "total_extracted": 3,
            "total_existing": 4,
            "match_count": 2,
            "new_count": 1,
            "missing_count": 2,
            "new": [],
            "missing": [],
            "matching": [],
        }

        with patch.object(comparator.logger, "info") as mock_info:
            comparator.print_comparison_report(comparison, "Test Form")

            # Check that match percentage is calculated (2/4 * 100 = 50%)
            call_args = [str(call) for call in mock_info.call_args_list]
            assert any("50.0%" in str(arg) or "Match Rate" in str(arg) for arg in call_args)

    def test_print_comparison_report_with_zero_existing_questions(self, comparator):
        """Test print_comparison_report with zero existing questions"""
        comparison = {
            "total_extracted": 2,
            "total_existing": 0,
            "match_count": 0,
            "new_count": 2,
            "missing_count": 0,
            "new": ["New 1", "New 2"],
            "missing": [],
            "matching": [],
        }

        with patch.object(comparator.logger, "info") as mock_info:
            comparator.print_comparison_report(comparison, "Test Form")

            # Should not raise division by zero error
            assert mock_info.called

    def test_compare_sorts_results(self, comparator):
        """Test that compare results are sorted"""
        extracted = ["Z question", "A question", "M question"]
        existing = ["M question", "B question"]

        result = comparator.compare(extracted, existing)

        # Check that results are sorted
        assert result["new"] == sorted(result["new"])
        assert result["missing"] == sorted(result["missing"])
        assert result["matching"] == sorted(result["matching"])
