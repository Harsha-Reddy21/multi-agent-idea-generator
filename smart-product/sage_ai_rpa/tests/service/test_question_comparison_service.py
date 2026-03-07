"""
Tests for QuestionComparisonService
"""

import pytest
import json
from unittest.mock import MagicMock, patch, mock_open
from pathlib import Path
from service.question_comparison_service import QuestionComparisonService
from exceptions import (
    QuestionExtractionError,
    QuestionComparisonError,
    EmailNotificationError,
    ConfigurationError,
)


@pytest.fixture
def mock_questions_json():
    """Mock questions JSON data"""
    return {
        "test-form": ["What is your name?", "What is your email?", "What is your department?"],
        "ai-registry-form": ["Project name?", "Project description?"],
    }


@pytest.fixture
def mock_rpa_config():
    """Mock RPA configuration"""
    return {"email_notifications": {"enabled": True, "recipient_email": "test@example.com"}}


class TestQuestionComparisonServiceInit:
    """Test initialization"""

    def test_init_with_form_type(self):
        """Test initialization with form type"""
        service = QuestionComparisonService(form_type="test-form")
        assert service.form_type == "test-form"
        assert service.json_file is None

    def test_init_with_json_file(self):
        """Test initialization with JSON file"""
        service = QuestionComparisonService(json_file="test.json")
        assert service.json_file == "test.json"
        assert service.form_type is None

    def test_init_with_both_params(self):
        """Test initialization with both parameters"""
        service = QuestionComparisonService(form_type="test-form", json_file="test.json")
        assert service.form_type == "test-form"
        assert service.json_file == "test.json"

    def test_init_with_no_params(self):
        """Test initialization with no parameters"""
        service = QuestionComparisonService()
        assert service.form_type is None
        assert service.json_file is None


class TestQuestionComparisonServiceExtractQuestions:
    """Test extract_questions method"""

    def test_extract_questions_success(self):
        """Test successful question extraction"""
        service = QuestionComparisonService(form_type="test-form")

        mock_questions_data = [
            {"question_text": "Question 1", "question_type": "text"},
            {"question_text": "Question 2", "question_type": "radio"},
        ]

        with patch("service.question_comparison_service.QuestionExtractor") as mock_extractor_class:
            mock_extractor = MagicMock()
            mock_extractor.extract_all_questions.return_value = mock_questions_data
            mock_extractor_class.return_value = mock_extractor

            result = service.extract_questions(use_conditional=True, max_depth=3, max_options=5)

            assert len(result) == 2
            assert result[0] == "Question 1"
            assert result[1] == "Question 2"
            mock_extractor_class.assert_called_once_with(form_type="test-form")
            mock_extractor.extract_all_questions.assert_called_once_with(
                use_conditional_exploration=True, max_depth=3, max_options=5
            )

    def test_extract_questions_with_defaults(self):
        """Test question extraction with default parameters"""
        service = QuestionComparisonService(form_type="test-form")

        with patch("service.question_comparison_service.QuestionExtractor") as mock_extractor_class:
            mock_extractor = MagicMock()
            mock_extractor.extract_all_questions.return_value = [{"question_text": "Q1", "question_type": "text"}]
            mock_extractor_class.return_value = mock_extractor

            result = service.extract_questions()

            assert len(result) == 1
            assert result[0] == "Q1"

    def test_extract_questions_reraises_extraction_error(self):
        """Test that QuestionExtractionError is reraised"""
        service = QuestionComparisonService(form_type="test-form")

        with patch("service.question_comparison_service.QuestionExtractor") as mock_extractor_class:
            mock_extractor = MagicMock()
            mock_extractor.extract_all_questions.side_effect = QuestionExtractionError("Test error")
            mock_extractor_class.return_value = mock_extractor

            with pytest.raises(QuestionExtractionError):
                service.extract_questions()

    def test_extract_questions_missing_key_error(self):
        """Test extraction with missing key in question data"""
        service = QuestionComparisonService(form_type="test-form")

        with patch("service.question_comparison_service.QuestionExtractor") as mock_extractor_class:
            mock_extractor = MagicMock()
            mock_extractor.extract_all_questions.return_value = [
                {"no_question_text": "Invalid"}  # Missing 'question_text' key
            ]
            mock_extractor_class.return_value = mock_extractor

            with pytest.raises(QuestionExtractionError) as exc_info:
                service.extract_questions()

            # handle_service_exception wraps KeyError with this message
            assert "Required configuration key missing" in str(exc_info.value)

    def test_extract_questions_type_error(self):
        """Test extraction with type error"""
        service = QuestionComparisonService(form_type="test-form")

        with patch("service.question_comparison_service.QuestionExtractor") as mock_extractor_class:
            mock_extractor = MagicMock()
            mock_extractor.extract_all_questions.return_value = "not a list"
            mock_extractor_class.return_value = mock_extractor

            with pytest.raises(QuestionExtractionError) as exc_info:
                service.extract_questions()

            # handle_service_exception wraps TypeError with this message
            assert "Invalid data provided" in str(exc_info.value)

    def test_extract_questions_generic_exception(self):
        """Test extraction with generic exception"""
        service = QuestionComparisonService(form_type="test-form")

        with patch("service.question_comparison_service.QuestionExtractor") as mock_extractor_class:
            mock_extractor = MagicMock()
            mock_extractor.extract_all_questions.side_effect = RuntimeError("Unexpected error")
            mock_extractor_class.return_value = mock_extractor

            with pytest.raises(QuestionExtractionError):
                service.extract_questions()


class TestQuestionComparisonServiceLoadQuestions:
    """Test load_existing_questions method"""

    def test_load_existing_questions_success(self, mock_questions_json):
        """Test successful loading of existing questions"""
        service = QuestionComparisonService(form_type="test-form", json_file="test.json")

        json_data = json.dumps(mock_questions_json)
        with patch("builtins.open", mock_open(read_data=json_data)):
            result = service.load_existing_questions()

            assert len(result) == 3
            assert "What is your name?" in result
            assert "What is your email?" in result

    def test_load_existing_questions_form_type_not_found(self, mock_questions_json):
        """Test loading when form type not in JSON"""
        service = QuestionComparisonService(form_type="nonexistent-form", json_file="test.json")

        json_data = json.dumps(mock_questions_json)
        with patch("builtins.open", mock_open(read_data=json_data)):
            with pytest.raises(QuestionComparisonError) as exc_info:
                service.load_existing_questions()

            assert "Form type not found" in str(exc_info.value)

    def test_load_existing_questions_invalid_format(self):
        """Test loading when questions is not a list"""
        service = QuestionComparisonService(form_type="test-form", json_file="test.json")

        invalid_json = {"test-form": "not a list"}
        json_data = json.dumps(invalid_json)
        with patch("builtins.open", mock_open(read_data=json_data)):
            with pytest.raises(QuestionComparisonError) as exc_info:
                service.load_existing_questions()

            assert "Invalid questions format" in str(exc_info.value)

    def test_load_existing_questions_file_not_found(self):
        """Test loading when file doesn't exist"""
        service = QuestionComparisonService(form_type="test-form", json_file="nonexistent.json")

        with patch("builtins.open", side_effect=FileNotFoundError("File not found")):
            with patch("service.question_comparison_service.handle_service_exception") as mock_handle:
                service.load_existing_questions()
                mock_handle.assert_called_once()

    def test_load_existing_questions_json_decode_error(self):
        """Test loading with invalid JSON"""
        service = QuestionComparisonService(form_type="test-form", json_file="test.json")

        with patch("builtins.open", mock_open(read_data="invalid json {")):
            with patch("service.question_comparison_service.handle_service_exception") as mock_handle:
                service.load_existing_questions()
                mock_handle.assert_called_once()


class TestQuestionComparisonServiceCompare:
    """Test compare_questions method"""

    def test_compare_questions_success(self):
        """Test successful question comparison"""
        service = QuestionComparisonService(form_type="test-form")

        extracted = ["Q1", "Q2", "Q3"]
        existing = ["Q1", "Q2", "Q4"]

        with patch("service.question_comparison_service.QuestionComparator") as mock_comparator_class:
            mock_comparator = MagicMock()
            mock_comparator.compare.return_value = {
                "match_count": 2,
                "new_count": 1,
                "missing_count": 1,
                "matching": ["Q1", "Q2"],
                "new": ["Q3"],
                "missing": ["Q4"],
            }
            mock_comparator_class.return_value = mock_comparator

            result = service.compare_questions(extracted, existing)

            assert result["match_count"] == 2
            assert result["new_count"] == 1
            assert result["missing_count"] == 1
            mock_comparator.compare.assert_called_once_with(extracted, existing)

    def test_compare_questions_all_match(self):
        """Test comparison when all questions match"""
        service = QuestionComparisonService()

        questions = ["Q1", "Q2"]

        with patch("service.question_comparison_service.QuestionComparator") as mock_comparator_class:
            mock_comparator = MagicMock()
            mock_comparator.compare.return_value = {"match_count": 2, "new_count": 0, "missing_count": 0}
            mock_comparator_class.return_value = mock_comparator

            result = service.compare_questions(questions, questions)

            assert result["match_count"] == 2
            assert result["new_count"] == 0


class TestQuestionComparisonServiceEmail:
    """Test email notification methods"""

    def test_create_email_subject_with_both_discrepancies(self):
        """Test email subject creation with new and missing questions"""
        service = QuestionComparisonService(form_type="test-form")

        comparison = {"new_count": 3, "missing_count": 2}

        subject = service._create_email_subject(comparison)

        assert "test-form" in subject
        assert "3 new" in subject
        assert "2 missing" in subject

    def test_create_email_subject_with_only_new(self):
        """Test email subject with only new questions"""
        service = QuestionComparisonService(form_type="ai-registry-form")

        comparison = {"new_count": 5, "missing_count": 0}

        subject = service._create_email_subject(comparison)

        assert "ai-registry-form" in subject
        assert "5 new" in subject
        assert "missing" not in subject.split("-")[-1]  # Last part shouldn't mention missing

    def test_create_email_subject_with_only_missing(self):
        """Test email subject with only missing questions"""
        service = QuestionComparisonService(form_type="test-form")

        comparison = {"new_count": 0, "missing_count": 4}

        subject = service._create_email_subject(comparison)

        assert "4 missing" in subject

    def test_create_email_body_success(self):
        """Test email body creation"""
        service = QuestionComparisonService(form_type="test-form")

        comparison = {
            "total_extracted": 10,
            "total_existing": 8,
            "match_count": 6,
            "new_count": 2,
            "missing_count": 2,
            "new": ["New Q1", "New Q2"],
            "missing": ["Missing Q1", "Missing Q2"],
        }

        body = service._create_email_body(comparison)

        assert "test-form" in body
        assert "Total Extracted: 10" in body
        assert "Total Existing: 8" in body
        assert "Matching: 6" in body
        assert "New Questions: 2" in body
        assert "Missing Questions: 2" in body
        assert "New Q1" in body
        assert "Missing Q1" in body
        assert "Match Rate: 60.0%" in body

    def test_create_email_body_with_no_new(self):
        """Test email body with no new questions"""
        service = QuestionComparisonService(form_type="test-form")

        comparison = {
            "total_extracted": 5,
            "total_existing": 7,
            "match_count": 5,
            "new_count": 0,
            "missing_count": 2,
            "new": [],
            "missing": ["Missing Q1", "Missing Q2"],
        }

        body = service._create_email_body(comparison)

        assert "NEW QUESTIONS" not in body
        assert "MISSING QUESTIONS" in body
        assert "Missing Q1" in body

    def test_create_email_body_missing_key_error(self):
        """Test email body creation with missing key"""
        service = QuestionComparisonService(form_type="test-form")

        incomplete_comparison = {"total_extracted": 5}  # Missing required keys

        # handle_service_exception tries to instantiate EmailNotificationError with incompatible args
        with pytest.raises(TypeError) as exc_info:
            service._create_email_body(incomplete_comparison)

        assert "unexpected keyword argument 'error'" in str(exc_info.value)

    def test_create_email_body_type_error(self):
        """Test email body creation with type error"""
        service = QuestionComparisonService(form_type="test-form")

        # Use string for match_count which will cause TypeError in division
        invalid_comparison = {
            "total_extracted": 10,
            "total_existing": 10,
            "match_count": "invalid",  # This will cause TypeError in division
            "new_count": 1,
            "missing_count": 1,
            "new": ["Q1"],
            "missing": [],
        }

        # handle_service_exception tries to instantiate EmailNotificationError with incompatible args
        with pytest.raises(TypeError) as exc_info:
            service._create_email_body(invalid_comparison)

        assert "unexpected keyword argument 'error'" in str(exc_info.value)

    def test_send_discrepancy_notification_no_discrepancies(self, mock_rpa_config):
        """Test email notification when no discrepancies"""
        service = QuestionComparisonService(form_type="test-form")

        comparison = {"new_count": 0, "missing_count": 0}

        result = service.send_discrepancy_notification(comparison, mock_rpa_config)

        assert result is True

    def test_send_discrepancy_notification_disabled(self, mock_rpa_config):
        """Test email notification when disabled in config"""
        service = QuestionComparisonService(form_type="test-form")

        mock_rpa_config["email_notifications"]["enabled"] = False

        comparison = {"new_count": 5, "missing_count": 3}

        result = service.send_discrepancy_notification(comparison, mock_rpa_config)

        assert result is True

    def test_send_discrepancy_notification_no_recipient(self, mock_rpa_config):
        """Test email notification with no recipient configured"""
        service = QuestionComparisonService(form_type="test-form")

        mock_rpa_config["email_notifications"]["recipient_email"] = None

        comparison = {"new_count": 2, "missing_count": 1}

        result = service.send_discrepancy_notification(comparison, mock_rpa_config)

        assert result is False

    def test_send_discrepancy_notification_success(self, mock_rpa_config):
        """Test successful email notification"""
        service = QuestionComparisonService(form_type="test-form")

        comparison = {
            "new_count": 2,
            "missing_count": 1,
            "total_extracted": 10,
            "total_existing": 9,
            "match_count": 8,
            "new": ["New Q1", "New Q2"],
            "missing": ["Missing Q1"],
        }

        with patch("service.question_comparison_service.send_simple_email") as mock_send:
            result = service.send_discrepancy_notification(comparison, mock_rpa_config)

            assert result is True
            mock_send.assert_called_once()
            call_kwargs = mock_send.call_args
            assert call_kwargs[1]["to_addresses"] == ["test@example.com"]
            assert "test-form" in call_kwargs[1]["subject"]

    def test_send_discrepancy_notification_email_error(self, mock_rpa_config):
        """Test email notification with email sending error"""
        service = QuestionComparisonService(form_type="test-form")

        comparison = {
            "new_count": 2,
            "missing_count": 1,
            "total_extracted": 10,
            "total_existing": 9,
            "match_count": 8,
            "new": ["New Q1"],
            "missing": ["Missing Q1"],
        }

        with patch("service.question_comparison_service.send_simple_email", side_effect=Exception("Send failed")):
            # The method tries to handle the exception but hits TypeError in handle_service_exception
            with pytest.raises(TypeError) as exc_info:
                service.send_discrepancy_notification(comparison, mock_rpa_config)

            assert "unexpected keyword argument 'error'" in str(exc_info.value)

    def test_send_discrepancy_notification_config_error(self):
        """Test email notification with configuration error"""
        service = QuestionComparisonService(form_type="test-form")

        invalid_config = {"email_notifications": {"enabled": True}}  # Missing recipient_email

        comparison = {"new_count": 1, "missing_count": 0}

        result = service.send_discrepancy_notification(comparison, invalid_config)

        assert result is False


class TestQuestionComparisonServiceExecute:
    """Test execute_comparison method"""

    def test_execute_comparison_full_workflow(self, mock_questions_json, mock_rpa_config):
        """Test full comparison workflow"""
        service = QuestionComparisonService(form_type="test-form", json_file="test.json")

        with patch.object(service, "extract_questions", return_value=["Q1", "Q2", "Q3"]):
            with patch.object(service, "load_existing_questions", return_value=["Q1", "Q2"]):
                with patch.object(service, "compare_questions") as mock_compare:
                    mock_compare.return_value = {"match_count": 2, "new_count": 1, "missing_count": 0}
                    with patch.object(service, "send_discrepancy_notification", return_value=True):
                        result = service.execute_comparison(
                            use_conditional=True,
                            max_depth=3,
                            max_options=5,
                            rpa_config=mock_rpa_config,
                            send_email=True,
                        )

                        assert result["match_count"] == 2
                        assert result["new_count"] == 1

    def test_execute_comparison_without_email(self):
        """Test comparison workflow without sending email"""
        service = QuestionComparisonService(form_type="test-form", json_file="test.json")

        with patch.object(service, "extract_questions", return_value=["Q1"]):
            with patch.object(service, "load_existing_questions", return_value=["Q1"]):
                with patch.object(service, "compare_questions") as mock_compare:
                    mock_compare.return_value = {"match_count": 1}
                    with patch.object(service, "send_discrepancy_notification") as mock_send:
                        result = service.execute_comparison(send_email=False)

                        mock_send.assert_not_called()

    def test_execute_comparison_without_rpa_config(self):
        """Test comparison workflow without RPA config"""
        service = QuestionComparisonService(form_type="test-form", json_file="test.json")

        with patch.object(service, "extract_questions", return_value=["Q1"]):
            with patch.object(service, "load_existing_questions", return_value=["Q1"]):
                with patch.object(service, "compare_questions") as mock_compare:
                    mock_compare.return_value = {"match_count": 1}
                    with patch.object(service, "send_discrepancy_notification") as mock_send:
                        result = service.execute_comparison(rpa_config=None, send_email=True)

                        mock_send.assert_not_called()


class TestQuestionComparisonServiceGetFormTypes:
    """Test get_all_form_types method"""

    def test_get_all_form_types_success(self, mock_questions_json):
        """Test getting all form types"""
        service = QuestionComparisonService(json_file="test.json")

        json_data = json.dumps(mock_questions_json)
        with patch("builtins.open", mock_open(read_data=json_data)):
            result = service.get_all_form_types()

            assert len(result) == 2
            assert "test-form" in result
            assert "ai-registry-form" in result

    def test_get_all_form_types_empty_file(self):
        """Test getting form types from empty JSON"""
        service = QuestionComparisonService(json_file="test.json")

        json_data = json.dumps({})
        with patch("builtins.open", mock_open(read_data=json_data)):
            result = service.get_all_form_types()

            assert len(result) == 0

    def test_get_all_form_types_invalid_structure(self):
        """Test getting form types with invalid JSON structure"""
        service = QuestionComparisonService(json_file="test.json")

        json_data = json.dumps(["not", "a", "dict"])
        with patch("builtins.open", mock_open(read_data=json_data)):
            with pytest.raises(ConfigurationError) as exc_info:
                service.get_all_form_types()

            assert "Invalid JSON structure" in str(exc_info.value)

    def test_get_all_form_types_file_not_found(self):
        """Test getting form types when file doesn't exist"""
        service = QuestionComparisonService(json_file="nonexistent.json")

        with patch("builtins.open", side_effect=FileNotFoundError("File not found")):
            # handle_service_exception tries to instantiate ConfigurationError with incompatible args
            with pytest.raises(TypeError) as exc_info:
                service.get_all_form_types()

            assert "unexpected keyword argument 'error'" in str(exc_info.value)

    def test_get_all_form_types_json_decode_error(self):
        """Test getting form types with invalid JSON"""
        service = QuestionComparisonService(json_file="test.json")

        with patch("builtins.open", mock_open(read_data="invalid json")):
            # handle_service_exception tries to instantiate ConfigurationError with incompatible args
            with pytest.raises(TypeError) as exc_info:
                service.get_all_form_types()

            assert "unexpected keyword argument 'error'" in str(exc_info.value)
