"""
Tests for QuestionExtractor utility
"""

import pytest
from unittest.mock import MagicMock, patch, PropertyMock
from utils.question_extractor import QuestionExtractor
from exceptions import QuestionExtractionError


class TestQuestionExtractor:
    """Test cases for QuestionExtractor"""

    @pytest.fixture
    def mock_scraper(self):
        """Create a mock ConditionalQuestionScraper"""
        scraper = MagicMock()
        scraper.extract_all_questions.return_value = [
            {"question": "What is your name?", "type": "text"},
            {"question": "What is your age?", "type": "text"},
        ]
        scraper.close_browser = MagicMock()
        return scraper

    @pytest.fixture
    def extractor_with_mock(self, mock_scraper):
        """Create a QuestionExtractor with mocked scraper"""
        with patch("utils.question_extractor.ConditionalQuestionScraper", return_value=mock_scraper):
            extractor = QuestionExtractor("test-form")
            return extractor

    def test_init(self):
        """Test initialization of QuestionExtractor"""
        with patch("utils.question_extractor.ConditionalQuestionScraper") as mock_scraper_class:
            extractor = QuestionExtractor("test-form")

            assert extractor.form_type == "test-form"
            assert extractor.scraper is not None
            mock_scraper_class.assert_called_once_with(form_type="test-form")

    def test_extract_all_questions_success(self, extractor_with_mock, mock_scraper):
        """Test successful extraction of all questions"""
        result = extractor_with_mock.extract_all_questions()

        assert len(result) == 2
        assert result[0]["question"] == "What is your name?"
        assert result[1]["question"] == "What is your age?"
        mock_scraper.extract_all_questions.assert_called_once()

    def test_extract_all_questions_with_parameters(self, extractor_with_mock, mock_scraper):
        """Test extract_all_questions with custom parameters"""
        result = extractor_with_mock.extract_all_questions(
            use_conditional_exploration=False, max_depth=3, max_options=5
        )

        assert len(result) == 2
        mock_scraper.extract_all_questions.assert_called_once_with(
            use_conditional_exploration=False, max_depth=3, max_options=5
        )

    def test_extract_all_questions_logs_info(self, extractor_with_mock, mock_scraper):
        """Test that extraction logs info messages"""
        with patch.object(extractor_with_mock.logger, "info") as mock_info:
            extractor_with_mock.extract_all_questions()

            # Check that info was logged
            assert mock_info.call_count >= 2

    def test_extract_all_questions_reraises_question_extraction_error(self, extractor_with_mock, mock_scraper):
        """Test that QuestionExtractionError is reraised"""
        error = QuestionExtractionError("Test error")
        mock_scraper.extract_all_questions.side_effect = error

        with pytest.raises(QuestionExtractionError) as exc_info:
            extractor_with_mock.extract_all_questions()

        assert exc_info.value == error

    def test_extract_all_questions_handles_generic_exception(self, extractor_with_mock, mock_scraper):
        """Test that generic exceptions are handled"""
        mock_scraper.extract_all_questions.side_effect = RuntimeError("Unexpected error")

        # The extractor re-raises the exception for service layer to handle
        with pytest.raises(RuntimeError) as exc_info:
            extractor_with_mock.extract_all_questions()

        assert "Unexpected error" in str(exc_info.value)

    def test_extract_all_questions_logs_exception(self, extractor_with_mock, mock_scraper):
        """Test that exceptions are logged"""
        mock_scraper.extract_all_questions.side_effect = RuntimeError("Test error")

        with patch.object(extractor_with_mock.logger, "exception") as mock_exception:
            # The extractor logs and re-raises the exception
            with pytest.raises(RuntimeError):
                extractor_with_mock.extract_all_questions()

            mock_exception.assert_called_once()

    def test_close_browser_success(self, extractor_with_mock, mock_scraper):
        """Test successful browser closure"""
        extractor_with_mock.close()

        mock_scraper.close_browser.assert_called_once()

    def test_close_browser_with_exception(self, extractor_with_mock, mock_scraper):
        """Test browser closure with exception"""
        mock_scraper.close_browser.side_effect = RuntimeError("Close failed")

        with patch.object(extractor_with_mock.logger, "warning") as mock_warning:
            # Should not raise, just log warning
            extractor_with_mock.close()

            mock_warning.assert_called_once()

    def test_close_browser_logs_debug_on_success(self, extractor_with_mock, mock_scraper):
        """Test that successful close logs debug message"""
        with patch.object(extractor_with_mock.logger, "debug") as mock_debug:
            extractor_with_mock.close()

            mock_debug.assert_called_once()

    def test_close_browser_when_scraper_is_none(self):
        """Test close when scraper is None"""
        with patch("utils.question_extractor.ConditionalQuestionScraper"):
            extractor = QuestionExtractor("test-form")
            extractor.scraper = None

            # Should not raise error
            extractor.close()

    def test_extract_all_questions_with_empty_result(self, extractor_with_mock, mock_scraper):
        """Test extraction with empty result"""
        mock_scraper.extract_all_questions.return_value = []

        result = extractor_with_mock.extract_all_questions()

        assert result == []
        assert len(result) == 0

    def test_extract_all_questions_default_parameters(self, extractor_with_mock, mock_scraper):
        """Test extract_all_questions uses default parameters"""
        extractor_with_mock.extract_all_questions()

        # Verify default parameters are passed
        mock_scraper.extract_all_questions.assert_called_once_with(
            use_conditional_exploration=True, max_depth=5, max_options=10
        )

    def test_form_type_property(self, extractor_with_mock):
        """Test form_type property is accessible"""
        assert extractor_with_mock.form_type == "test-form"

    def test_scraper_property(self, extractor_with_mock, mock_scraper):
        """Test scraper property is accessible"""
        assert extractor_with_mock.scraper == mock_scraper

    def test_logger_property(self, extractor_with_mock):
        """Test logger property is accessible"""
        assert extractor_with_mock.logger is not None

    def test_multiple_extractions(self, extractor_with_mock, mock_scraper):
        """Test multiple extractions work correctly"""
        result1 = extractor_with_mock.extract_all_questions()
        result2 = extractor_with_mock.extract_all_questions()

        assert len(result1) == 2
        assert len(result2) == 2
        assert mock_scraper.extract_all_questions.call_count == 2

    def test_extract_then_close(self, extractor_with_mock, mock_scraper):
        """Test extract followed by close"""
        result = extractor_with_mock.extract_all_questions()
        assert len(result) == 2

        extractor_with_mock.close()
        mock_scraper.close_browser.assert_called_once()

    def test_close_can_be_called_multiple_times(self, extractor_with_mock, mock_scraper):
        """Test that close can be called multiple times without error"""
        extractor_with_mock.close()
        extractor_with_mock.close()

        # Should be called twice
        assert mock_scraper.close_browser.call_count == 2
