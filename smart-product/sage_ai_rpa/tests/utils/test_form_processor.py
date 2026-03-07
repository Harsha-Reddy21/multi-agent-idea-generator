"""
Tests for FormProcessor utility class
"""

import pytest
from utils.form_processor import FormProcessor


class TestFormProcessor:
    """Test cases for FormProcessor"""

    def test_normalize_question_text_basic(self):
        """Test basic question text normalization"""
        processor = FormProcessor("ai-registry-form")

        text = "  What is your name?  "
        normalized = processor.normalize_question_text(text)
        assert normalized == "what is your name?"

    def test_normalize_question_text_with_number(self):
        """Test normalization removes leading numbers"""
        processor = FormProcessor("ai-registry-form")

        text = "1. What is the AI system name?"
        normalized = processor.normalize_question_text(text)
        assert normalized == "what is the ai system name?"

    def test_normalize_question_text_select_all(self):
        """Test normalization removes 'select all that apply'"""
        processor = FormProcessor("ai-registry-form")

        text = "Select categories (select all that apply)"
        normalized = processor.normalize_question_text(text)
        assert normalized == "select categories"

    def test_normalize_question_text_extra_spaces(self):
        """Test normalization removes extra spaces"""
        processor = FormProcessor("ai-registry-form")

        text = "What   is    your     name?"
        normalized = processor.normalize_question_text(text)
        assert normalized == "what is your name?"

    def test_normalize_question_text_empty(self):
        """Test normalization handles empty string"""
        processor = FormProcessor("ai-registry-form")

        result = processor.normalize_question_text("")
        assert result == ""

    def test_normalize_question_text_none(self):
        """Test normalization handles None"""
        processor = FormProcessor("ai-registry-form")

        result = processor.normalize_question_text(None)
        assert result == ""

    def test_find_matching_form_data_exact_match(self):
        """Test finding form data with exact match"""
        processor = FormProcessor("ai-registry-form")

        form_data = [
            {"question": "What is your name?", "answer": "John"},
            {"question": "What is your age?", "answer": "30"},
        ]

        result = processor.find_matching_form_data("What is your name?", form_data)
        assert result is not None
        assert result["answer"] == "John"

    def test_find_matching_form_data_normalized_match(self):
        """Test finding form data with normalized match"""
        processor = FormProcessor("ai-registry-form")

        form_data = [{"question": "1. What is your name?", "answer": "John"}]

        result = processor.find_matching_form_data("What is your name?", form_data)
        assert result is not None
        assert result["answer"] == "John"

    def test_find_matching_form_data_core_phrase_match(self):
        """Test finding form data with core phrase matching"""
        processor = FormProcessor("ai-registry-form")

        form_data = [{"question": "What is the name of the AI system?", "answer": "TestAI"}]

        result = processor.find_matching_form_data("name of the AI system", form_data)
        assert result is not None
        assert result["answer"] == "TestAI"

    def test_find_matching_form_data_no_match(self):
        """Test finding form data returns None when no match"""
        processor = FormProcessor("ai-registry-form")

        form_data = [{"question": "What is your name?", "answer": "John"}]

        result = processor.find_matching_form_data("What is your favorite color?", form_data)
        assert result is None

    def test_find_matching_form_data_empty_question(self):
        """Test finding form data with empty question"""
        processor = FormProcessor("ai-registry-form")

        form_data = [{"question": "What is your name?", "answer": "John"}]

        result = processor.find_matching_form_data("", form_data)
        assert result is None

    def test_get_hardcoded_question_exact_match(self, mock_browser_automation):
        """Test getting hardcoded question with exact match"""
        processor = FormProcessor("ai-registry-form")
        processor.config = {
            "hardcoded_questions": {
                "ai-registry-form": {"What is the deployment date?": {"value": "2024-01-01", "reason": "Standard date"}}
            }
        }

        result = processor.get_hardcoded_question("What is the deployment date?")
        assert result is not None
        assert result["value"] == "2024-01-01"

    def test_get_hardcoded_question_with_number_prefix(self, mock_browser_automation):
        """Test getting hardcoded question strips number prefix"""
        processor = FormProcessor("ai-registry-form")
        processor.config = {
            "hardcoded_questions": {
                "ai-registry-form": {"What is the deployment date?": {"value": "2024-01-01", "reason": "Standard date"}}
            }
        }

        result = processor.get_hardcoded_question("1. What is the deployment date?")
        assert result is not None
        assert result["value"] == "2024-01-01"

    def test_get_hardcoded_question_partial_match(self, mock_browser_automation):
        """Test getting hardcoded question with partial match"""
        processor = FormProcessor("ai-registry-form")
        processor.config = {
            "hardcoded_questions": {
                "ai-registry-form": {"deployment date": {"value": "2024-01-01", "reason": "Standard date"}}
            }
        }

        result = processor.get_hardcoded_question("What is the deployment date?")
        assert result is not None
        assert result["value"] == "2024-01-01"

    def test_get_hardcoded_question_no_match(self, mock_browser_automation):
        """Test getting hardcoded question returns None when no match"""
        processor = FormProcessor("ai-registry-form")
        processor.config = {"hardcoded_questions": {"ai-registry-form": {}}}

        result = processor.get_hardcoded_question("What is the deployment date?")
        assert result is None


"""
Additional tests for FormProcessor to increase coverage
"""
import pytest
from unittest.mock import MagicMock, patch
from utils.form_processor import FormProcessor


class TestFormProcessorExtended:
    """Extended test cases for FormProcessor"""

    def test_normalize_handles_select_all_prefix(self):
        """Test normalization handles 'select all that apply' at start"""
        processor = FormProcessor("ai-registry-form")

        text = "(select all that apply) Select your options"
        normalized = processor.normalize_question_text(text)

        assert "select all that apply" not in normalized
        assert "select your options" in normalized

    def test_find_matching_no_data(self):
        """Test finding match with empty form data"""
        processor = FormProcessor("ai-registry-form")

        result = processor.find_matching_form_data("test question", [])

        assert result is None

    def test_find_matching_with_short_phrases(self):
        """Test core phrase matching with short phrases (under 10 chars)"""
        processor = FormProcessor("ai-registry-form")

        form_data = [{"question": "What is it?", "answer": "Test"}]

        # Short phrases won't match via core phrase logic
        result = processor.find_matching_form_data("What is it?", form_data)

        assert result is not None  # Should match via exact match

    def test_get_hardcoded_no_config_for_form_type(self):
        """Test getting hardcoded question when form type not in config"""
        processor = FormProcessor("ai-registry-form")
        processor.config = {"hardcoded_questions": {"other-form": {"question": {"value": "answer"}}}}

        result = processor.get_hardcoded_question("any question")

        assert result is None

    def test_normalize_with_multiple_spaces_and_numbers(self):
        """Test complex normalization with numbers and spaces"""
        processor = FormProcessor("ai-registry-form")

        text = "  1.   What   is   the   AI   system   name?  (select all that apply)  "
        normalized = processor.normalize_question_text(text)

        assert normalized == "what is the ai system name?"
        assert "  " not in normalized
        assert "1." not in normalized

    def test_find_matching_case_insensitive(self):
        """Test matching is case insensitive"""
        processor = FormProcessor("ai-registry-form")

        form_data = [{"question": "WHAT IS YOUR NAME?", "answer": "Test"}]

        result = processor.find_matching_form_data("what is your name?", form_data)

        assert result is not None
        assert result["answer"] == "Test"

    def test_find_matching_with_question_mark(self):
        """Test matching removes question marks"""
        processor = FormProcessor("ai-registry-form")

        form_data = [{"question": "What is the system name", "answer": "TestSystem"}]

        result = processor.find_matching_form_data("What is the system name?", form_data)

        assert result is not None

    def test_get_hardcoded_strips_whitespace(self):
        """Test hardcoded question lookup strips whitespace"""
        processor = FormProcessor("ai-registry-form")
        processor.config = {
            "hardcoded_questions": {"ai-registry-form": {"test question": {"value": "test answer", "reason": "test"}}}
        }

        result = processor.get_hardcoded_question("  test question  ")

        assert result is not None
        assert result["value"] == "test answer"

    def test_process_form_question_no_match(self):
        """Test _process_form_question when no matching data found"""
        processor = FormProcessor("ai-registry-form")

        form_data = [{"questionId": "q1", "question": "Different question", "answer": ["test"]}]
        matched_ids = []

        status, qid, detail = processor._process_form_question(1, "Non-existent question", form_data, matched_ids)

        assert status == "no_match"
        assert qid is None
        assert detail is None

    def test_process_form_question_with_hardcoded_answer(self):
        """Test _process_form_question with hardcoded answer"""
        processor = FormProcessor("ai-registry-form")
        processor.config = {
            "hardcoded_questions": {
                "ai-registry-form": {
                    "test question": {"answer": "hardcoded answer", "type": "text", "reason": "testing"}
                }
            },
            "wait_times": {"between_fields": 0.1},
        }

        form_data = [{"questionId": "q1", "question": "test question", "answer": ["original answer"], "type": "text"}]
        matched_ids = []

        with patch.object(processor.browser_automation, "fill_field_by_type", return_value=True):
            status, qid, detail = processor._process_form_question(1, "test question", form_data, matched_ids)

        assert status == "filled"
        assert qid == "q1"
        assert "q1" in matched_ids

    def test_process_form_question_with_type_override(self):
        """Test _process_form_question with hardcoded type only"""
        processor = FormProcessor("ai-registry-form")
        processor.config = {
            "hardcoded_questions": {
                "ai-registry-form": {"test question": {"type": "checkbox", "reason": "override type"}}
            },
            "wait_times": {"between_fields": 0.1},
        }

        form_data = [{"questionId": "q1", "question": "test question", "answer": ["option1"], "type": "text"}]
        matched_ids = []

        with patch.object(processor.browser_automation, "fill_field_by_type", return_value=True):
            status, qid, detail = processor._process_form_question(1, "test question", form_data, matched_ids)

        assert status == "filled"

    def test_process_form_question_skipped_empty_answer(self):
        """Test _process_form_question skips when answer is empty"""
        processor = FormProcessor("ai-registry-form")

        form_data = [{"questionId": "q1", "question": "test question", "answer": [], "type": "text"}]
        matched_ids = []

        status, qid, detail = processor._process_form_question(1, "test question", form_data, matched_ids)

        assert status == "skipped"
        assert qid == "q1"
        assert "q1" in matched_ids

    def test_process_form_question_skipped_empty_string_answer(self):
        """Test _process_form_question skips when answer is empty string"""
        processor = FormProcessor("ai-registry-form")

        form_data = [{"questionId": "q1", "question": "test question", "answer": [""], "type": "text"}]
        matched_ids = []

        status, qid, detail = processor._process_form_question(1, "test question", form_data, matched_ids)

        assert status == "skipped"

    @patch("utils.form_processor.logger")
    def test_process_form_question_failed(self, mock_logger):
        """Test _process_form_question when filling fails"""
        processor = FormProcessor("ai-registry-form")

        form_data = [{"questionId": "q1", "question": "test question", "answer": ["test answer"], "type": "text"}]
        matched_ids = []

        with patch.object(processor.browser_automation, "fill_field_by_type", return_value=False):
            status, qid, detail = processor._process_form_question(1, "test question", form_data, matched_ids)

        assert status == "failed"
        assert qid == "q1"
        assert detail is not None
        assert detail["questionId"] == "q1"

    @patch("utils.form_processor.logger")
    def test_log_fill_statistics(self, mock_logger):
        """Test _log_fill_statistics logs correctly"""
        processor = FormProcessor("ai-registry-form")

        unmatched = [{"questionId": "q1", "question": "unmatched"}]
        failed = [{"questionId": "q2", "question": "failed", "type": "text"}]

        # Should not raise any exceptions
        processor._log_fill_statistics(
            final_question_count=10,
            iteration=2,
            processed_questions={1, 2, 3},
            matched_count=5,
            filled_count=4,
            skipped_count=1,
            failed_count=1,
            max_iterations=50,
            unmatched_questions=unmatched,
            failed_questions_detail=failed,
        )

    def test_log_fill_statistics_empty(self):
        """Test _log_fill_statistics with empty data"""
        processor = FormProcessor("ai-registry-form")

        processor._log_fill_statistics(
            final_question_count=0,
            iteration=1,
            processed_questions=set(),
            matched_count=0,
            filled_count=0,
            skipped_count=0,
            failed_count=0,
            max_iterations=50,
            unmatched_questions=[],
            failed_questions_detail=[],
        )

    def test_log_fill_statistics_max_iterations(self):
        """Test _log_fill_statistics when max iterations reached"""
        processor = FormProcessor("ai-registry-form")

        processor._log_fill_statistics(
            final_question_count=100,
            iteration=50,
            processed_questions={1, 2, 3},
            matched_count=3,
            filled_count=2,
            skipped_count=1,
            failed_count=0,
            max_iterations=50,
            unmatched_questions=[],
            failed_questions_detail=[],
        )

    def test_fill_form_with_data_open_form_fails(self):
        """Test fill_form_with_data when opening form fails"""
        processor = FormProcessor("ai-registry-form")

        with patch.object(processor.browser_automation, "open_form", return_value=False):
            with patch.object(processor.browser_automation, "close_browser"):
                result = processor.fill_form_with_data([])

        assert result == False

    def test_fill_form_with_data_simple_success(self):
        """Test fill_form_with_data with simple successful scenario"""
        processor = FormProcessor("ai-registry-form")
        processor.config["wait_times"] = {"between_fields": 0.01, "form_expansion": 0.1, "new_questions_appear": 0.1}

        form_data = [{"questionId": "q1", "question": "test question", "answer": ["test answer"], "type": "text"}]

        with patch.object(processor.browser_automation, "open_form", return_value=True):
            with patch.object(processor.browser_automation, "count_form_questions", return_value=1):
                with patch.object(processor.browser_automation, "get_form_question_text", return_value="test question"):
                    with patch.object(processor.browser_automation, "fill_field_by_type", return_value=True):
                        with patch.object(processor.browser_automation, "wait_for_new_questions", return_value=1):
                            with patch.object(processor.browser_automation, "submit_form", return_value=True):
                                with patch.object(processor.browser_automation, "close_browser"):
                                    result = processor.fill_form_with_data(form_data)

        assert result["success"] is True
        assert result["filled_count"] == 1
        assert result["matched_count"] == 1

    def test_fill_form_with_data_form_expansion(self):
        """Test fill_form_with_data handles form expansion"""
        processor = FormProcessor("ai-registry-form")
        processor.config["wait_times"] = {"between_fields": 0.01, "form_expansion": 0.1, "new_questions_appear": 0.1}

        form_data = [
            {"questionId": "q1", "question": "question 1", "answer": ["answer1"], "type": "text"},
            {"questionId": "q2", "question": "question 2", "answer": ["answer2"], "type": "text"},
        ]

        question_counts = [1, 2, 2]
        count_call_index = [0]

        def count_side_effect():
            idx = count_call_index[0]
            count_call_index[0] += 1
            return question_counts[min(idx, len(question_counts) - 1)]

        question_texts = ["question 1", "question 2"]
        text_call_index = [0]

        def text_side_effect(q_num):
            idx = text_call_index[0]
            text_call_index[0] += 1
            return question_texts[min(idx, len(question_texts) - 1)]

        with patch.object(processor.browser_automation, "open_form", return_value=True):
            with patch.object(processor.browser_automation, "count_form_questions", side_effect=count_side_effect):
                with patch.object(processor.browser_automation, "get_form_question_text", side_effect=text_side_effect):
                    with patch.object(processor.browser_automation, "fill_field_by_type", return_value=True):
                        with patch.object(processor.browser_automation, "wait_for_new_questions", side_effect=[2, 2]):
                            with patch.object(processor.browser_automation, "submit_form", return_value=True):
                                with patch.object(processor.browser_automation, "close_browser"):
                                    result = processor.fill_form_with_data(form_data)

        assert result["success"] is True

    @patch("utils.form_processor.logger")
    def test_fill_form_with_data_question_extraction_fails(self, mock_logger):
        """Test fill_form_with_data when question text extraction fails"""
        processor = FormProcessor("ai-registry-form")
        processor.config["wait_times"] = {"between_fields": 0.01, "form_expansion": 0.1, "new_questions_appear": 0.1}

        with patch.object(processor.browser_automation, "open_form", return_value=True):
            with patch.object(processor.browser_automation, "count_form_questions", return_value=1):
                with patch.object(processor.browser_automation, "get_form_question_text", return_value=None):
                    with patch.object(processor.browser_automation, "wait_for_new_questions", return_value=1):
                        with patch.object(processor.browser_automation, "submit_form", return_value=True):
                            with patch.object(processor.browser_automation, "close_browser"):
                                result = processor.fill_form_with_data([])

        assert result["success"] is True
        assert result["failed_count"] == 1

    @patch("utils.form_processor.logger")
    def test_fill_form_with_data_submission_fails(self, mock_logger):
        """Test fill_form_with_data when submission fails"""
        processor = FormProcessor("ai-registry-form")
        processor.config["wait_times"] = {"between_fields": 0.01, "form_expansion": 0.1, "new_questions_appear": 0.1}

        form_data = [{"questionId": "q1", "question": "test question", "answer": ["test answer"], "type": "text"}]

        with patch.object(processor.browser_automation, "open_form", return_value=True):
            with patch.object(processor.browser_automation, "count_form_questions", return_value=1):
                with patch.object(processor.browser_automation, "get_form_question_text", return_value="test question"):
                    with patch.object(processor.browser_automation, "fill_field_by_type", return_value=True):
                        with patch.object(processor.browser_automation, "wait_for_new_questions", return_value=1):
                            with patch.object(processor.browser_automation, "submit_form", return_value=False):
                                with patch.object(processor.browser_automation, "close_browser"):
                                    result = processor.fill_form_with_data(form_data)

        assert result["success"] is False
        assert "submit button" in result["error"]

    @patch("utils.form_processor.logger")
    def test_fill_form_with_data_exception(self, mock_logger):
        """Test fill_form_with_data handles exceptions"""
        processor = FormProcessor("ai-registry-form")

        with patch.object(processor.browser_automation, "open_form", side_effect=Exception("Test error")):
            with patch.object(processor.browser_automation, "close_browser"):
                result = processor.fill_form_with_data([])

        assert result["success"] is False
        assert "Test error" in result["error"]

    @patch("utils.form_processor.logger")
    def test_fill_form_with_data_max_iterations(self, mock_logger):
        """Test fill_form_with_data stops at max iterations"""
        processor = FormProcessor("ai-registry-form")
        processor.config["wait_times"] = {"between_fields": 0.01, "form_expansion": 0.1, "new_questions_appear": 0.1}

        # Always return more questions to trigger max iterations
        with patch.object(processor.browser_automation, "open_form", return_value=True):
            with patch.object(processor.browser_automation, "count_form_questions", return_value=100):
                with patch.object(processor.browser_automation, "get_form_question_text", return_value=None):
                    with patch.object(processor.browser_automation, "wait_for_new_questions", return_value=100):
                        with patch.object(processor.browser_automation, "submit_form", return_value=True):
                            with patch.object(processor.browser_automation, "close_browser"):
                                result = processor.fill_form_with_data([])

        assert result["success"] is True

    @pytest.mark.asyncio
    async def test_process_single_submission_success(self):
        """Test process_single_submission with successful result"""
        processor = FormProcessor("ai-registry-form")

        form_data = [{"questionId": "q1", "question": "test", "answer": ["test"], "type": "text"}]

        mock_result = {"success": True, "filled_count": 1, "matched_count": 1}

        with patch.object(processor, "fill_form_with_data", return_value=mock_result):
            result = await processor.process_single_submission(form_data)

        assert result["success"] is True
        assert result["message"] == "Form submitted successfully"

    @patch("utils.form_processor.logger")
    @pytest.mark.asyncio
    async def test_process_single_submission_failure(self, mock_logger):
        """Test process_single_submission with failed result"""
        processor = FormProcessor("ai-registry-form")

        form_data = [{"questionId": "q1", "question": "test", "answer": ["test"], "type": "text"}]

        mock_result = {"success": False, "error": "Submission failed"}

        with patch.object(processor, "fill_form_with_data", return_value=mock_result):
            result = await processor.process_single_submission(form_data)

        assert result["success"] is False
        assert "Submission failed" in result["message"]

    @pytest.mark.asyncio
    async def test_process_single_submission_boolean_success(self):
        """Test process_single_submission with boolean True result"""
        processor = FormProcessor("ai-registry-form")

        form_data = [{"questionId": "q1", "question": "test", "answer": ["test"], "type": "text"}]

        with patch.object(processor, "fill_form_with_data", return_value=True):
            result = await processor.process_single_submission(form_data)

        assert result["success"] is True

    @patch("utils.form_processor.logger")
    @pytest.mark.asyncio
    async def test_process_single_submission_boolean_failure(self, mock_logger):
        """Test process_single_submission with boolean False result"""
        processor = FormProcessor("ai-registry-form")

        form_data = [{"questionId": "q1", "question": "test", "answer": ["test"], "type": "text"}]

        with patch.object(processor, "fill_form_with_data", return_value=False):
            result = await processor.process_single_submission(form_data)

        assert result["success"] is False

    @patch("utils.form_processor.logger")
    @pytest.mark.asyncio
    async def test_process_single_submission_exception(self, mock_logger):
        """Test process_single_submission handles exceptions"""
        processor = FormProcessor("ai-registry-form")

        form_data = [{"questionId": "q1", "question": "test", "answer": ["test"], "type": "text"}]

        with patch.object(processor, "fill_form_with_data", side_effect=Exception("Test error")):
            result = await processor.process_single_submission(form_data)

        assert result["success"] is False
        assert "Test error" in result["message"]
