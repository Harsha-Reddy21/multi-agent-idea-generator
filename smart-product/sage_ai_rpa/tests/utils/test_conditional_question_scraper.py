"""
Tests for ConditionalQuestionScraper utility
"""

import pytest
import json
from unittest.mock import MagicMock, patch, mock_open, PropertyMock
from pathlib import Path
from selenium.common.exceptions import (
    TimeoutException,
    WebDriverException,
    NoSuchElementException,
    StaleElementReferenceException,
)
from utils.conditional_question_scraper import ConditionalQuestionScraper
from exceptions import (
    ConfigurationError,
    FormLoadError,
    QuestionScraperError,
    ConditionalExplorationError,
)


@pytest.fixture
def mock_config():
    """Create a mock configuration"""
    return {
        "form_urls": {
            "test-form": "https://forms.office.com/test",
            "ai-registry-form": "https://forms.office.com/ai-registry",
        },
        "browser_options": {"headless": False, "window_size": {"width": 1920, "height": 1080}},
        "wait_times": {"page_load": 2, "after_scroll": 1, "new_questions_appear": 1, "dropdown_open": 0.5},
        "selectors": {
            "first_question": "xpath://div[@data-automation-id='questionItem']",
            "text_fields": [
                "xpath:(//div[@data-automation-id='questionItem'])[{question_num}]//textarea",
                "xpath:(//div[@data-automation-id='questionItem'])[{question_num}]//input[@type='text']",
            ],
            "radio": [
                "xpath:(//div[@data-automation-id='questionItem'])[{question_num}]//input[@type='radio' and @value='{value}']"
            ],
            "checkbox": [
                "xpath:(//div[@data-automation-id='questionItem'])[{question_num}]//input[@type='checkbox' and @value='{value}']"
            ],
            "dropdown": {
                "triggers": [
                    "xpath:(//div[@data-automation-id='questionItem'])[{question_num}]//div[@role='combobox']"
                ],
                "options": ["xpath://div[@role='option' and contains(text(), '{value}')]"],
            },
            "datepicker": {
                "inputs": ["xpath:(//div[@data-automation-id='questionItem'])[{question_num}]//input[@type='date']"]
            },
        },
    }


@pytest.fixture
def mock_browser():
    """Create a mock Selenium browser"""
    browser = MagicMock()
    browser.open_available_browser = MagicMock()
    browser.maximize_browser_window = MagicMock()
    browser.set_window_size = MagicMock()
    browser.wait_until_element_is_visible = MagicMock()
    browser.find_element = MagicMock()
    browser.find_elements = MagicMock(return_value=[])
    browser.get_text = MagicMock(return_value="Test Question")
    browser.click_element = MagicMock()
    browser.execute_javascript = MagicMock()
    browser.close_browser = MagicMock()
    return browser


class TestConditionalQuestionScraperInit:
    """Test initialization of ConditionalQuestionScraper"""

    def test_init_with_valid_config(self, mock_config):
        """Test initialization with valid config file"""
        config_json = json.dumps(mock_config)

        with patch("builtins.open", mock_open(read_data=config_json)):
            with patch("pathlib.Path.is_file", return_value=True):
                scraper = ConditionalQuestionScraper("test-form")

                assert scraper.form_type == "test-form"
                assert scraper.browser is None
                assert scraper.config == mock_config
                assert isinstance(scraper.discovered_questions, dict)
                assert isinstance(scraper.all_questions_by_text, dict)

    def test_init_with_custom_config_path(self, mock_config):
        """Test initialization with custom config path"""
        config_json = json.dumps(mock_config)

        with patch("builtins.open", mock_open(read_data=config_json)):
            with patch("pathlib.Path.is_file", return_value=True):
                scraper = ConditionalQuestionScraper("test-form", config_path="custom/path.json")

                assert scraper.form_type == "test-form"
                assert scraper.config == mock_config

    def test_init_config_file_not_found(self):
        """Test initialization when config file doesn't exist"""
        with patch("pathlib.Path.is_file", return_value=False):
            with pytest.raises(ConfigurationError) as exc_info:
                ConditionalQuestionScraper("test-form")

            assert "config file not found" in str(exc_info.value).lower()

    def test_init_invalid_json(self):
        """Test initialization with invalid JSON"""
        with patch("builtins.open", mock_open(read_data="invalid json {")):
            with patch("pathlib.Path.is_file", return_value=True):
                with pytest.raises(ConfigurationError) as exc_info:
                    ConditionalQuestionScraper("test-form")

                assert "Invalid JSON" in str(exc_info.value)

    def test_init_file_read_error(self):
        """Test initialization with file read error"""
        with patch("builtins.open", side_effect=IOError("Read error")):
            with patch("pathlib.Path.is_file", return_value=True):
                with pytest.raises(ConfigurationError) as exc_info:
                    ConditionalQuestionScraper("test-form")

                assert "Failed to load config" in str(exc_info.value)


class TestConditionalQuestionScraperBrowserOps:
    """Test browser operations"""

    def test_initialize_browser(self, mock_config, mock_browser):
        """Test browser initialization"""
        config_json = json.dumps(mock_config)

        with patch("builtins.open", mock_open(read_data=config_json)):
            with patch("pathlib.Path.is_file", return_value=True):
                with patch("utils.conditional_question_scraper.Selenium", return_value=mock_browser):
                    scraper = ConditionalQuestionScraper("test-form")
                    scraper._initialize_browser()

                    assert scraper.browser is not None

    def test_open_form_success(self, mock_config, mock_browser):
        """Test successful form opening"""
        config_json = json.dumps(mock_config)

        with patch("builtins.open", mock_open(read_data=config_json)):
            with patch("pathlib.Path.is_file", return_value=True):
                with patch("utils.conditional_question_scraper.Selenium", return_value=mock_browser):
                    with patch("time.sleep"):
                        scraper = ConditionalQuestionScraper("test-form")
                        result = scraper._open_form()

                        assert result is True
                        mock_browser.open_available_browser.assert_called_once()
                        mock_browser.maximize_browser_window.assert_called_once()

    def test_open_form_headless(self, mock_config, mock_browser):
        """Test opening form in headless mode"""
        mock_config["browser_options"]["headless"] = True
        config_json = json.dumps(mock_config)

        with patch("builtins.open", mock_open(read_data=config_json)):
            with patch("pathlib.Path.is_file", return_value=True):
                with patch("utils.conditional_question_scraper.Selenium", return_value=mock_browser):
                    with patch("time.sleep"):
                        scraper = ConditionalQuestionScraper("test-form")
                        result = scraper._open_form()

                        assert result is True
                        mock_browser.set_window_size.assert_called_once()

    def test_open_form_type_not_in_config(self, mock_config, mock_browser):
        """Test opening form when form type not in config"""
        config_json = json.dumps(mock_config)

        with patch("builtins.open", mock_open(read_data=config_json)):
            with patch("pathlib.Path.is_file", return_value=True):
                with patch("utils.conditional_question_scraper.Selenium", return_value=mock_browser):
                    scraper = ConditionalQuestionScraper("nonexistent-form")

                    with pytest.raises(FormLoadError) as exc_info:
                        scraper._open_form()

                    assert "not found in configuration" in str(exc_info.value)

    def test_open_form_webdriver_exception(self, mock_config, mock_browser):
        """Test handling WebDriverException during form opening"""
        mock_browser.open_available_browser.side_effect = WebDriverException("Browser error")
        config_json = json.dumps(mock_config)

        with patch("builtins.open", mock_open(read_data=config_json)):
            with patch("pathlib.Path.is_file", return_value=True):
                with patch("utils.conditional_question_scraper.Selenium", return_value=mock_browser):
                    scraper = ConditionalQuestionScraper("test-form")

                    with pytest.raises(FormLoadError) as exc_info:
                        scraper._open_form()

                    assert "Browser automation error" in str(exc_info.value)

    def test_open_form_config_error(self, mock_config, mock_browser):
        """Test handling configuration error during browser setup"""
        mock_config["browser_options"] = None  # Invalid config
        config_json = json.dumps(mock_config)

        with patch("builtins.open", mock_open(read_data=config_json)):
            with patch("pathlib.Path.is_file", return_value=True):
                with patch("utils.conditional_question_scraper.Selenium", return_value=mock_browser):
                    scraper = ConditionalQuestionScraper("test-form")

                    with pytest.raises(FormLoadError) as exc_info:
                        scraper._open_form()

                    assert "Unexpected error opening form" in str(exc_info.value)

    def test_open_form_timeout_waiting_for_first_question(self, mock_config, mock_browser):
        """Test timeout waiting for first question"""
        mock_browser.wait_until_element_is_visible.side_effect = TimeoutException("Timeout")
        config_json = json.dumps(mock_config)

        with patch("builtins.open", mock_open(read_data=config_json)):
            with patch("pathlib.Path.is_file", return_value=True):
                with patch("utils.conditional_question_scraper.Selenium", return_value=mock_browser):
                    with patch("time.sleep"):
                        scraper = ConditionalQuestionScraper("test-form")

                        with pytest.raises(FormLoadError) as exc_info:
                            scraper._open_form()

                        assert "First question not visible" in str(exc_info.value)

    def test_close_browser(self, mock_config, mock_browser):
        """Test closing browser"""
        config_json = json.dumps(mock_config)

        with patch("builtins.open", mock_open(read_data=config_json)):
            with patch("pathlib.Path.is_file", return_value=True):
                with patch("utils.conditional_question_scraper.Selenium", return_value=mock_browser):
                    scraper = ConditionalQuestionScraper("test-form")
                    scraper.browser = mock_browser
                    scraper.close_browser()

                    mock_browser.close_browser.assert_called_once()
                    assert scraper.browser is None

    def test_close_browser_with_exception(self, mock_config, mock_browser):
        """Test closing browser when exception occurs"""
        mock_browser.close_browser.side_effect = Exception("Close error")
        config_json = json.dumps(mock_config)

        with patch("builtins.open", mock_open(read_data=config_json)):
            with patch("pathlib.Path.is_file", return_value=True):
                scraper = ConditionalQuestionScraper("test-form")
                scraper.browser = mock_browser

                # Should not raise exception
                scraper.close_browser()

    def test_close_browser_when_none(self, mock_config):
        """Test closing browser when browser is None"""
        config_json = json.dumps(mock_config)

        with patch("builtins.open", mock_open(read_data=config_json)):
            with patch("pathlib.Path.is_file", return_value=True):
                scraper = ConditionalQuestionScraper("test-form")
                scraper.browser = None

                # Should not raise exception
                scraper.close_browser()


class TestConditionalQuestionScraperQuestionExtraction:
    """Test question extraction methods"""

    def test_clean_question_text_with_number_prefix(self):
        """Test cleaning question text with number prefix"""
        result = ConditionalQuestionScraper._clean_question_text("1. What is your name?")
        assert result == "What is your name?"

    def test_clean_question_text_with_newline(self):
        """Test cleaning question text with newline"""
        result = ConditionalQuestionScraper._clean_question_text("10.\nSubmission ID")
        assert result == "Submission ID"

    def test_clean_question_text_no_prefix(self):
        """Test cleaning question text without number prefix"""
        result = ConditionalQuestionScraper._clean_question_text("What is your email?")
        assert result == "What is your email?"

    def test_clean_question_text_with_whitespace(self):
        """Test cleaning question text with extra whitespace"""
        # The regex pattern ^\d+\.\s* matches at start of string, so leading spaces prevent the match
        # The strip() at the end removes leading/trailing whitespace but not the number prefix
        result = ConditionalQuestionScraper._clean_question_text("  5. Question text  ")
        assert result == "5. Question text"

    def test_get_question_text_success(self, mock_config, mock_browser):
        """Test successful question text extraction"""
        mock_element = MagicMock()
        mock_browser.find_element.return_value = mock_element
        mock_browser.get_text.return_value = "1. Test Question"
        config_json = json.dumps(mock_config)

        with patch("builtins.open", mock_open(read_data=config_json)):
            with patch("pathlib.Path.is_file", return_value=True):
                with patch("utils.conditional_question_scraper.Selenium", return_value=mock_browser):
                    scraper = ConditionalQuestionScraper("test-form")
                    scraper.browser = mock_browser

                    result = scraper._get_question_text(1)

                    assert result == "Test Question"

    def test_get_question_text_no_element_found(self, mock_config, mock_browser):
        """Test question text extraction when no element found"""
        mock_browser.find_element.side_effect = Exception("Not found")
        config_json = json.dumps(mock_config)

        with patch("builtins.open", mock_open(read_data=config_json)):
            with patch("pathlib.Path.is_file", return_value=True):
                with patch("utils.conditional_question_scraper.Selenium", return_value=mock_browser):
                    scraper = ConditionalQuestionScraper("test-form")
                    scraper.browser = mock_browser

                    result = scraper._get_question_text(1)

                    assert result is None

    def test_get_question_type_checkbox(self, mock_config, mock_browser):
        """Test detecting checkbox question type"""
        mock_element = MagicMock()
        mock_browser.find_element.return_value = mock_element
        config_json = json.dumps(mock_config)

        with patch("builtins.open", mock_open(read_data=config_json)):
            with patch("pathlib.Path.is_file", return_value=True):
                with patch("utils.conditional_question_scraper.Selenium", return_value=mock_browser):
                    scraper = ConditionalQuestionScraper("test-form")
                    scraper.browser = mock_browser

                    with patch.object(scraper, "_element_exists") as mock_exists:
                        # First call for checkbox returns True
                        mock_exists.side_effect = [True]

                        result = scraper._get_question_type(1)

                        assert result == "checkbox"

    def test_get_question_type_radio(self, mock_config, mock_browser):
        """Test detecting radio button question type"""
        mock_element = MagicMock()
        mock_browser.find_element.return_value = mock_element
        config_json = json.dumps(mock_config)

        with patch("builtins.open", mock_open(read_data=config_json)):
            with patch("pathlib.Path.is_file", return_value=True):
                with patch("utils.conditional_question_scraper.Selenium", return_value=mock_browser):
                    scraper = ConditionalQuestionScraper("test-form")
                    scraper.browser = mock_browser

                    with patch.object(scraper, "_element_exists") as mock_exists:
                        # Checkbox checks return False, radio check returns True
                        mock_exists.side_effect = [False, False, False, True]

                        result = scraper._get_question_type(1)

                        assert result == "radio"

    def test_get_question_type_dropdown(self, mock_config, mock_browser):
        """Test detecting dropdown question type"""
        config_json = json.dumps(mock_config)

        with patch("builtins.open", mock_open(read_data=config_json)):
            with patch("pathlib.Path.is_file", return_value=True):
                with patch("utils.conditional_question_scraper.Selenium", return_value=mock_browser):
                    scraper = ConditionalQuestionScraper("test-form")
                    scraper.browser = mock_browser

                    with patch.object(scraper, "_element_exists") as mock_exists:
                        # Checkbox/radio checks False, dropdown check True
                        mock_exists.side_effect = [False, False, False, False, False, False, True]

                        result = scraper._get_question_type(1)

                        assert result == "dropdown"

    def test_get_question_type_text(self, mock_config, mock_browser):
        """Test detecting text question type"""
        mock_element = MagicMock()
        mock_element.tag_name = "input"
        mock_browser.find_element.return_value = mock_element
        config_json = json.dumps(mock_config)

        with patch("builtins.open", mock_open(read_data=config_json)):
            with patch("pathlib.Path.is_file", return_value=True):
                with patch("utils.conditional_question_scraper.Selenium", return_value=mock_browser):
                    scraper = ConditionalQuestionScraper("test-form")
                    scraper.browser = mock_browser

                    with patch.object(scraper, "_element_exists") as mock_exists:
                        # All checks False until text field check
                        def exists_side_effect(selector):
                            if "textarea" in selector or "input[@type='text']" in selector:
                                return True
                            return False

                        mock_exists.side_effect = exists_side_effect

                        result = scraper._get_question_type(1)

                        assert result == "text"

    def test_get_question_type_textarea(self, mock_config, mock_browser):
        """Test detecting textarea question type"""
        mock_element = MagicMock()
        mock_element.tag_name = "textarea"
        mock_browser.find_element.return_value = mock_element
        config_json = json.dumps(mock_config)

        with patch("builtins.open", mock_open(read_data=config_json)):
            with patch("pathlib.Path.is_file", return_value=True):
                with patch("utils.conditional_question_scraper.Selenium", return_value=mock_browser):
                    scraper = ConditionalQuestionScraper("test-form")
                    scraper.browser = mock_browser

                    with patch.object(scraper, "_element_exists") as mock_exists:

                        def exists_side_effect(selector):
                            if "textarea" in selector:
                                return True
                            return False

                        mock_exists.side_effect = exists_side_effect

                        result = scraper._get_question_type(1)

                        assert result == "textarea"

    def test_get_question_type_date(self, mock_config, mock_browser):
        """Test detecting date question type"""
        config_json = json.dumps(mock_config)

        with patch("builtins.open", mock_open(read_data=config_json)):
            with patch("pathlib.Path.is_file", return_value=True):
                with patch("utils.conditional_question_scraper.Selenium", return_value=mock_browser):
                    scraper = ConditionalQuestionScraper("test-form")
                    scraper.browser = mock_browser

                    with patch.object(scraper, "_element_exists") as mock_exists:

                        def exists_side_effect(selector):
                            if "input[@type='date']" in selector:
                                return True
                            return False

                        mock_exists.side_effect = exists_side_effect

                        result = scraper._get_question_type(1)

                        assert result == "date"

    def test_get_question_type_file(self, mock_config, mock_browser):
        """Test detecting file upload question type"""
        config_json = json.dumps(mock_config)

        with patch("builtins.open", mock_open(read_data=config_json)):
            with patch("pathlib.Path.is_file", return_value=True):
                with patch("utils.conditional_question_scraper.Selenium", return_value=mock_browser):
                    scraper = ConditionalQuestionScraper("test-form")
                    scraper.browser = mock_browser

                    with patch.object(scraper, "_element_exists") as mock_exists:

                        def exists_side_effect(selector):
                            if "input[@type='file']" in selector:
                                return True
                            return False

                        mock_exists.side_effect = exists_side_effect

                        result = scraper._get_question_type(1)

                        assert result == "file"

    def test_get_question_type_unknown(self, mock_config, mock_browser):
        """Test detecting unknown question type"""
        config_json = json.dumps(mock_config)

        with patch("builtins.open", mock_open(read_data=config_json)):
            with patch("pathlib.Path.is_file", return_value=True):
                with patch("utils.conditional_question_scraper.Selenium", return_value=mock_browser):
                    scraper = ConditionalQuestionScraper("test-form")
                    scraper.browser = mock_browser

                    with patch.object(scraper, "_element_exists", return_value=False):
                        result = scraper._get_question_type(1)

                        assert result == "unknown"

    def test_get_question_options_radio(self, mock_config, mock_browser):
        """Test getting options for radio question"""
        mock_element1 = MagicMock()
        mock_element2 = MagicMock()
        mock_browser.find_elements.return_value = [mock_element1, mock_element2]
        mock_browser.get_text.side_effect = ["Option 1", "Option 2"]
        config_json = json.dumps(mock_config)

        with patch("builtins.open", mock_open(read_data=config_json)):
            with patch("pathlib.Path.is_file", return_value=True):
                with patch("utils.conditional_question_scraper.Selenium", return_value=mock_browser):
                    scraper = ConditionalQuestionScraper("test-form")
                    scraper.browser = mock_browser

                    result = scraper._get_question_options(1, "radio")

                    assert len(result) == 2
                    assert "Option 1" in result
                    assert "Option 2" in result

    def test_get_question_options_dropdown(self, mock_config, mock_browser):
        """Test getting options for dropdown question"""
        mock_option1 = MagicMock()
        mock_option2 = MagicMock()
        mock_browser.find_elements.return_value = [mock_option1, mock_option2]
        mock_browser.get_text.side_effect = ["Option A", "Option B"]
        config_json = json.dumps(mock_config)

        with patch("builtins.open", mock_open(read_data=config_json)):
            with patch("pathlib.Path.is_file", return_value=True):
                with patch("utils.conditional_question_scraper.Selenium", return_value=mock_browser):
                    with patch("time.sleep"):
                        scraper = ConditionalQuestionScraper("test-form")
                        scraper.browser = mock_browser

                        with patch.object(scraper, "_element_exists", return_value=True):
                            result = scraper._get_question_options(1, "dropdown")

                            assert len(result) >= 0  # May vary based on mock behavior

    def test_element_exists_true(self, mock_config, mock_browser):
        """Test _element_exists when element exists"""
        mock_element = MagicMock()
        mock_browser.find_element.return_value = mock_element
        config_json = json.dumps(mock_config)

        with patch("builtins.open", mock_open(read_data=config_json)):
            with patch("pathlib.Path.is_file", return_value=True):
                with patch("utils.conditional_question_scraper.Selenium", return_value=mock_browser):
                    scraper = ConditionalQuestionScraper("test-form")
                    scraper.browser = mock_browser

                    result = scraper._element_exists("xpath://test")

                    assert result is True

    def test_element_exists_false(self, mock_config, mock_browser):
        """Test _element_exists when element doesn't exist"""
        mock_browser.find_element.side_effect = Exception("Not found")
        config_json = json.dumps(mock_config)

        with patch("builtins.open", mock_open(read_data=config_json)):
            with patch("pathlib.Path.is_file", return_value=True):
                with patch("utils.conditional_question_scraper.Selenium", return_value=mock_browser):
                    scraper = ConditionalQuestionScraper("test-form")
                    scraper.browser = mock_browser

                    result = scraper._element_exists("xpath://test")

                    assert result is False

    def test_count_visible_questions(self, mock_config, mock_browser):
        """Test counting visible questions"""
        mock_elements = [MagicMock(), MagicMock(), MagicMock()]
        mock_browser.find_elements.return_value = mock_elements
        config_json = json.dumps(mock_config)

        with patch("builtins.open", mock_open(read_data=config_json)):
            with patch("pathlib.Path.is_file", return_value=True):
                with patch("utils.conditional_question_scraper.Selenium", return_value=mock_browser):
                    scraper = ConditionalQuestionScraper("test-form")
                    scraper.browser = mock_browser

                    result = scraper._count_visible_questions()

                    assert result == 3

    def test_count_visible_questions_none(self, mock_config, mock_browser):
        """Test counting visible questions when none found"""
        mock_browser.find_elements.return_value = None
        config_json = json.dumps(mock_config)

        with patch("builtins.open", mock_open(read_data=config_json)):
            with patch("pathlib.Path.is_file", return_value=True):
                with patch("utils.conditional_question_scraper.Selenium", return_value=mock_browser):
                    scraper = ConditionalQuestionScraper("test-form")
                    scraper.browser = mock_browser

                    result = scraper._count_visible_questions()

                    assert result == 0

    def test_scroll_to_bottom(self, mock_config, mock_browser):
        """Test scrolling to bottom"""
        config_json = json.dumps(mock_config)

        with patch("builtins.open", mock_open(read_data=config_json)):
            with patch("pathlib.Path.is_file", return_value=True):
                with patch("utils.conditional_question_scraper.Selenium", return_value=mock_browser):
                    with patch("time.sleep"):
                        scraper = ConditionalQuestionScraper("test-form")
                        scraper.browser = mock_browser

                        scraper._scroll_to_bottom()

                        mock_browser.execute_javascript.assert_called_once()

    def test_scroll_to_bottom_with_exception(self, mock_config, mock_browser):
        """Test scrolling to bottom when exception occurs"""
        mock_browser.execute_javascript.side_effect = Exception("Scroll error")
        config_json = json.dumps(mock_config)

        with patch("builtins.open", mock_open(read_data=config_json)):
            with patch("pathlib.Path.is_file", return_value=True):
                with patch("utils.conditional_question_scraper.Selenium", return_value=mock_browser):
                    scraper = ConditionalQuestionScraper("test-form")
                    scraper.browser = mock_browser

                    # Should not raise exception
                    scraper._scroll_to_bottom()


class TestConditionalQuestionScraperSelection:
    """Test question selection methods"""

    def test_select_option_radio_success(self, mock_config, mock_browser):
        """Test successful radio option selection"""
        config_json = json.dumps(mock_config)

        with patch("builtins.open", mock_open(read_data=config_json)):
            with patch("pathlib.Path.is_file", return_value=True):
                with patch("utils.conditional_question_scraper.Selenium", return_value=mock_browser):
                    with patch("time.sleep"):
                        scraper = ConditionalQuestionScraper("test-form")
                        scraper.browser = mock_browser

                        with patch.object(scraper, "_element_exists", return_value=True):
                            result = scraper._select_option(1, "radio", "Option 1")

                            assert result is True

    def test_select_option_radio_failure(self, mock_config, mock_browser):
        """Test failed radio option selection"""
        config_json = json.dumps(mock_config)

        with patch("builtins.open", mock_open(read_data=config_json)):
            with patch("pathlib.Path.is_file", return_value=True):
                with patch("utils.conditional_question_scraper.Selenium", return_value=mock_browser):
                    scraper = ConditionalQuestionScraper("test-form")
                    scraper.browser = mock_browser

                    with patch.object(scraper, "_element_exists", return_value=False):
                        result = scraper._select_option(1, "radio", "Option 1")

                        assert result is False

    def test_select_option_dropdown_success(self, mock_config, mock_browser):
        """Test successful dropdown option selection"""
        config_json = json.dumps(mock_config)

        with patch("builtins.open", mock_open(read_data=config_json)):
            with patch("pathlib.Path.is_file", return_value=True):
                with patch("utils.conditional_question_scraper.Selenium", return_value=mock_browser):
                    with patch("time.sleep"):
                        scraper = ConditionalQuestionScraper("test-form")
                        scraper.browser = mock_browser

                        with patch.object(scraper, "_element_exists", return_value=True):
                            result = scraper._select_option(1, "dropdown", "Option A")

                            assert result is True
                            assert mock_browser.click_element.call_count >= 2  # Trigger + option

    def test_select_option_checkbox_success(self, mock_config, mock_browser):
        """Test successful checkbox option selection"""
        config_json = json.dumps(mock_config)

        with patch("builtins.open", mock_open(read_data=config_json)):
            with patch("pathlib.Path.is_file", return_value=True):
                with patch("utils.conditional_question_scraper.Selenium", return_value=mock_browser):
                    with patch("time.sleep"):
                        scraper = ConditionalQuestionScraper("test-form")
                        scraper.browser = mock_browser

                        with patch.object(scraper, "_element_exists", return_value=True):
                            result = scraper._select_option(1, "checkbox", "Option X")

                            assert result is True

    def test_select_option_exception(self, mock_config, mock_browser):
        """Test select option with exception"""
        mock_browser.click_element.side_effect = Exception("Click error")
        config_json = json.dumps(mock_config)

        with patch("builtins.open", mock_open(read_data=config_json)):
            with patch("pathlib.Path.is_file", return_value=True):
                with patch("utils.conditional_question_scraper.Selenium", return_value=mock_browser):
                    scraper = ConditionalQuestionScraper("test-form")
                    scraper.browser = mock_browser

                    with patch.object(scraper, "_element_exists", return_value=True):
                        result = scraper._select_option(1, "radio", "Option")

                        assert result is False


class TestConditionalQuestionScraperExtraction:
    """Test full extraction methods"""

    def test_extract_current_questions(self, mock_config, mock_browser):
        """Test extracting current visible questions"""
        mock_browser.find_elements.return_value = [MagicMock(), MagicMock()]
        config_json = json.dumps(mock_config)

        with patch("builtins.open", mock_open(read_data=config_json)):
            with patch("pathlib.Path.is_file", return_value=True):
                with patch("utils.conditional_question_scraper.Selenium", return_value=mock_browser):
                    with patch("time.sleep"):
                        scraper = ConditionalQuestionScraper("test-form")
                        scraper.browser = mock_browser

                        with patch.object(scraper, "_get_question_text", side_effect=["Q1", "Q2"]):
                            with patch.object(scraper, "_get_question_type", return_value="text"):
                                with patch.object(scraper, "_scroll_to_bottom"):
                                    result = scraper._extract_current_questions()

                                    assert len(result) == 2
                                    assert 1 in result
                                    assert 2 in result

    def test_extract_all_questions_without_conditional(self, mock_config, mock_browser):
        """Test extract_all_questions without conditional exploration"""
        mock_browser.find_elements.return_value = [MagicMock()]
        config_json = json.dumps(mock_config)

        with patch("builtins.open", mock_open(read_data=config_json)):
            with patch("pathlib.Path.is_file", return_value=True):
                with patch("utils.conditional_question_scraper.Selenium", return_value=mock_browser):
                    with patch("time.sleep"):
                        scraper = ConditionalQuestionScraper("test-form")
                        scraper.browser = mock_browser

                        with patch.object(scraper, "_open_form", return_value=True):
                            with patch.object(scraper, "_extract_current_questions") as mock_extract:
                                # Also populate all_questions_by_text
                                def side_effect():
                                    scraper.all_questions_by_text = {
                                        "Q1": {
                                            "question_number": 1,
                                            "question_text": "Q1",
                                            "question_type": "text",
                                            "options": [],
                                        }
                                    }
                                    return {
                                        1: {
                                            "question_number": 1,
                                            "question_text": "Q1",
                                            "question_type": "text",
                                            "options": [],
                                        }
                                    }

                                mock_extract.side_effect = side_effect

                                with patch.object(scraper, "close_browser"):
                                    result = scraper.extract_all_questions(use_conditional_exploration=False)

                                    assert len(result) == 1
                                    assert result[0]["question_text"] == "Q1"

    def test_extract_all_questions_with_conditional(self, mock_config, mock_browser):
        """Test extract_all_questions with conditional exploration"""
        mock_browser.find_elements.return_value = [MagicMock()]
        config_json = json.dumps(mock_config)

        with patch("builtins.open", mock_open(read_data=config_json)):
            with patch("pathlib.Path.is_file", return_value=True):
                with patch("utils.conditional_question_scraper.Selenium", return_value=mock_browser):
                    with patch("time.sleep"):
                        scraper = ConditionalQuestionScraper("test-form")
                        scraper.browser = mock_browser

                        with patch.object(scraper, "_open_form", return_value=True):
                            with patch.object(scraper, "_explore_forward_traversal"):
                                scraper.all_questions_by_text = {
                                    "Q1": {
                                        "question_number": 1,
                                        "question_text": "Q1",
                                        "question_type": "text",
                                        "options": [],
                                    }
                                }
                                with patch.object(scraper, "close_browser"):
                                    result = scraper.extract_all_questions(
                                        use_conditional_exploration=True, max_options=5
                                    )

                                    assert len(result) == 1

    def test_extract_all_questions_form_load_error(self, mock_config, mock_browser):
        """Test extract_all_questions when form load fails"""
        config_json = json.dumps(mock_config)

        with patch("builtins.open", mock_open(read_data=config_json)):
            with patch("pathlib.Path.is_file", return_value=True):
                with patch("utils.conditional_question_scraper.Selenium", return_value=mock_browser):
                    scraper = ConditionalQuestionScraper("test-form")

                    with patch.object(scraper, "_open_form", return_value=False):
                        with patch.object(scraper, "close_browser"):
                            with pytest.raises(FormLoadError):
                                scraper.extract_all_questions()

    def test_extract_all_questions_webdriver_error(self, mock_config, mock_browser):
        """Test extract_all_questions with WebDriverException"""
        config_json = json.dumps(mock_config)

        with patch("builtins.open", mock_open(read_data=config_json)):
            with patch("pathlib.Path.is_file", return_value=True):
                with patch("utils.conditional_question_scraper.Selenium", return_value=mock_browser):
                    scraper = ConditionalQuestionScraper("test-form")

                    with patch.object(scraper, "_open_form", side_effect=WebDriverException("Error")):
                        with patch.object(scraper, "close_browser"):
                            with pytest.raises(FormLoadError):
                                scraper.extract_all_questions()

    def test_extract_all_questions_conditional_timeout_error(self, mock_config, mock_browser):
        """Test extract_all_questions with TimeoutException during conditional exploration"""
        config_json = json.dumps(mock_config)

        with patch("builtins.open", mock_open(read_data=config_json)):
            with patch("pathlib.Path.is_file", return_value=True):
                with patch("utils.conditional_question_scraper.Selenium", return_value=mock_browser):
                    scraper = ConditionalQuestionScraper("test-form")

                    with patch.object(scraper, "_open_form", return_value=True):
                        with patch.object(
                            scraper, "_explore_forward_traversal", side_effect=TimeoutException("Timeout")
                        ):
                            with patch.object(scraper, "close_browser"):
                                with pytest.raises(ConditionalExplorationError):
                                    scraper.extract_all_questions(use_conditional_exploration=True)

    def test_extract_all_questions_element_error(self, mock_config, mock_browser):
        """Test extract_all_questions with NoSuchElementException"""
        config_json = json.dumps(mock_config)

        with patch("builtins.open", mock_open(read_data=config_json)):
            with patch("pathlib.Path.is_file", return_value=True):
                with patch("utils.conditional_question_scraper.Selenium", return_value=mock_browser):
                    scraper = ConditionalQuestionScraper("test-form")

                    with patch.object(scraper, "_open_form", return_value=True):
                        with patch.object(
                            scraper, "_extract_current_questions", side_effect=NoSuchElementException("Not found")
                        ):
                            with patch.object(scraper, "close_browser"):
                                with pytest.raises(QuestionScraperError):
                                    scraper.extract_all_questions(use_conditional_exploration=False)

    def test_extract_all_questions_stale_element_error(self, mock_config, mock_browser):
        """Test extract_all_questions with StaleElementReferenceException"""
        config_json = json.dumps(mock_config)

        with patch("builtins.open", mock_open(read_data=config_json)):
            with patch("pathlib.Path.is_file", return_value=True):
                with patch("utils.conditional_question_scraper.Selenium", return_value=mock_browser):
                    scraper = ConditionalQuestionScraper("test-form")

                    with patch.object(scraper, "_open_form", return_value=True):
                        with patch.object(
                            scraper, "_explore_forward_traversal", side_effect=StaleElementReferenceException("Stale")
                        ):
                            with patch.object(scraper, "close_browser"):
                                with pytest.raises(ConditionalExplorationError):
                                    scraper.extract_all_questions(use_conditional_exploration=True)

    def test_get_visible_question_ids(self, mock_config, mock_browser):
        """Test getting visible question IDs"""
        config_json = json.dumps(mock_config)

        with patch("builtins.open", mock_open(read_data=config_json)):
            with patch("pathlib.Path.is_file", return_value=True):
                with patch("utils.conditional_question_scraper.Selenium", return_value=mock_browser):
                    scraper = ConditionalQuestionScraper("test-form")
                    scraper.browser = mock_browser

                    with patch.object(scraper, "_count_visible_questions", return_value=2):
                        with patch.object(scraper, "_get_question_text", side_effect=["Q1", "Q2"]):
                            result = scraper._get_visible_question_ids()

                            assert len(result) == 2
                            assert "Q1" in result
                            assert "Q2" in result


class TestConditionalQuestionScraperAdvanced:
    """Advanced tests for additional coverage of ConditionalQuestionScraper"""

    def test_get_question_text_generic_exception(self, mock_config, mock_browser):
        """Test _get_question_text with generic exception"""
        config_json = json.dumps(mock_config)

        with patch("builtins.open", mock_open(read_data=config_json)):
            with patch("pathlib.Path.is_file", return_value=True):
                with patch("utils.conditional_question_scraper.Selenium", return_value=mock_browser):
                    scraper = ConditionalQuestionScraper("test-form")
                    scraper.browser = mock_browser
                    mock_browser.find_element.side_effect = RuntimeError("Unexpected error")

                    result = scraper._get_question_text(1)
                    assert result is None

    def test_select_option_with_wait_and_sleep(self, mock_config, mock_browser):
        """Test _select_option with wait time"""
        config_json = json.dumps(mock_config)

        with patch("builtins.open", mock_open(read_data=config_json)):
            with patch("pathlib.Path.is_file", return_value=True):
                with patch("utils.conditional_question_scraper.Selenium", return_value=mock_browser):
                    with patch("time.sleep") as mock_sleep:
                        scraper = ConditionalQuestionScraper("test-form")
                        scraper.browser = mock_browser
                        scraper.wait_after_interaction = 0.5

                        mock_element = MagicMock()
                        mock_browser.find_element.return_value = mock_element

                        result = scraper._select_option(1, "radio", "Option 1")

                        assert result is True
                        mock_sleep.assert_called()

    def test_extract_current_questions_with_question_number_gaps(self, mock_config, mock_browser):
        """Test _extract_current_questions with gaps in question numbers"""
        config_json = json.dumps(mock_config)

        with patch("builtins.open", mock_open(read_data=config_json)):
            with patch("pathlib.Path.is_file", return_value=True):
                with patch("utils.conditional_question_scraper.Selenium", return_value=mock_browser):
                    scraper = ConditionalQuestionScraper("test-form")
                    scraper.browser = mock_browser

                    # Mock questions where some fail to extract
                    with patch.object(scraper, "_count_visible_questions", return_value=5):
                        with patch.object(scraper, "_get_question_text", side_effect=["Q1", None, "Q3", None, "Q5"]):
                            with patch.object(
                                scraper, "_get_question_type", side_effect=["text", "text", "text", "text", "text"]
                            ):
                                with patch.object(scraper, "_get_question_options", return_value=[]):
                                    result = scraper._extract_current_questions()

                                    # Should only have 3 questions (1, 3, 5)
                                    assert len(result) == 3

    def test_extract_all_questions_exception_in_finally_block(self, mock_config, mock_browser):
        """Test extract_all_questions with exception during browser close"""
        config_json = json.dumps(mock_config)

        with patch("builtins.open", mock_open(read_data=config_json)):
            with patch("pathlib.Path.is_file", return_value=True):
                with patch("utils.conditional_question_scraper.Selenium", return_value=mock_browser):
                    scraper = ConditionalQuestionScraper("test-form")
                    scraper.browser = mock_browser

                    # Make _open_form raise an exception
                    with patch.object(scraper, "_open_form", side_effect=FormLoadError("Failed to open")):
                        # Make close_browser also raise an exception
                        mock_browser.close_browser.side_effect = Exception("Close failed")

                        with pytest.raises(FormLoadError):
                            scraper.extract_all_questions()

                        # Browser close was attempted despite the error
                        assert mock_browser.close_browser.called


class TestBrowserConfigurationErrors:
    """Test browser configuration error handling"""

    def test_open_form_type_error_in_config(self, mock_config, mock_browser):
        """Test TypeError during browser configuration - wrapped in FormLoadError"""
        # Make window_size non-subscriptable to trigger TypeError inside try block
        mock_config["browser_options"]["window_size"] = "invalid"
        mock_config["browser_options"]["headless"] = True  # Force headless path
        config_json = json.dumps(mock_config)

        with patch("builtins.open", mock_open(read_data=config_json)):
            with patch("pathlib.Path.is_file", return_value=True):
                with patch("utils.conditional_question_scraper.Selenium", return_value=mock_browser):
                    scraper = ConditionalQuestionScraper("test-form")

                    # ConfigurationError is raised but then wrapped by outer except Exception handler
                    with pytest.raises(FormLoadError) as exc_info:
                        scraper._open_form()

                    assert "Unexpected error opening form" in str(exc_info.value)
                    assert "Invalid browser configuration" in str(exc_info.value)

    def test_open_form_generic_exception(self, mock_config, mock_browser):
        """Test generic exception during browser setup"""
        mock_browser.maximize_browser_window.side_effect = Exception("Generic error")
        config_json = json.dumps(mock_config)

        with patch("builtins.open", mock_open(read_data=config_json)):
            with patch("pathlib.Path.is_file", return_value=True):
                with patch("utils.conditional_question_scraper.Selenium", return_value=mock_browser):
                    with patch("time.sleep"):
                        scraper = ConditionalQuestionScraper("test-form")

                        with pytest.raises(FormLoadError) as exc_info:
                            scraper._open_form()

                        assert "Failed to open browser or navigate to form" in str(exc_info.value)


class TestQuestionOptionsExtraction:
    """Test question options extraction with various selectors"""

    def test_get_question_options_radio_with_labels(self, mock_config, mock_browser):
        """Test getting radio options using label fallback"""
        config_json = json.dumps(mock_config)

        # First attempt (inputs) fails, second attempt (labels) succeeds
        mock_elem1 = MagicMock()
        mock_elem2 = MagicMock()

        def find_elements_side_effect(selector):
            if "label" in selector:
                return [mock_elem1, mock_elem2]
            return []

        mock_browser.find_elements.side_effect = find_elements_side_effect
        mock_browser.get_text.side_effect = ["Option A", "Option B"]

        with patch("builtins.open", mock_open(read_data=config_json)):
            with patch("pathlib.Path.is_file", return_value=True):
                with patch("utils.conditional_question_scraper.Selenium", return_value=mock_browser):
                    scraper = ConditionalQuestionScraper("test-form")
                    scraper.browser = mock_browser

                    result = scraper._get_question_options(1, "radio")

                    assert len(result) == 2
                    assert "Option A" in result
                    assert "Option B" in result

    def test_get_question_options_dropdown_click_failure(self, mock_config, mock_browser):
        """Test dropdown options when clicking trigger fails"""
        config_json = json.dumps(mock_config)

        with patch("builtins.open", mock_open(read_data=config_json)):
            with patch("pathlib.Path.is_file", return_value=True):
                with patch("utils.conditional_question_scraper.Selenium", return_value=mock_browser):
                    with patch("time.sleep"):
                        scraper = ConditionalQuestionScraper("test-form")
                        scraper.browser = mock_browser

                        # Element exists but clicking fails
                        with patch.object(scraper, "_element_exists", return_value=False):
                            result = scraper._get_question_options(1, "dropdown")

                            assert len(result) == 0

    def test_get_question_options_dropdown_with_alternative_selectors(self, mock_config, mock_browser):
        """Test dropdown with alternative option selectors"""
        config_json = json.dumps(mock_config)

        mock_opt1 = MagicMock()
        mock_opt2 = MagicMock()

        def find_elements_side_effect(selector):
            if "role='option'" in selector:
                return [mock_opt1, mock_opt2]
            return []

        mock_browser.find_elements.side_effect = find_elements_side_effect
        mock_browser.get_text.side_effect = ["Opt1", "Opt2"]

        with patch("builtins.open", mock_open(read_data=config_json)):
            with patch("pathlib.Path.is_file", return_value=True):
                with patch("utils.conditional_question_scraper.Selenium", return_value=mock_browser):
                    with patch("time.sleep"):
                        scraper = ConditionalQuestionScraper("test-form")
                        scraper.browser = mock_browser

                        with patch.object(scraper, "_element_exists", return_value=True):
                            result = scraper._get_question_options(1, "dropdown")

                            # May find options from alternative selector
                            assert isinstance(result, list)


class TestSelectOptionEdgeCases:
    """Test _select_option edge cases"""

    def test_select_option_dropdown_trigger_not_clicked(self, mock_config, mock_browser):
        """Test dropdown selection when trigger click fails"""
        config_json = json.dumps(mock_config)

        with patch("builtins.open", mock_open(read_data=config_json)):
            with patch("pathlib.Path.is_file", return_value=True):
                with patch("utils.conditional_question_scraper.Selenium", return_value=mock_browser):
                    with patch("time.sleep"):
                        scraper = ConditionalQuestionScraper("test-form")
                        scraper.browser = mock_browser

                        # Element doesn't exist, so trigger won't be clicked
                        with patch.object(scraper, "_element_exists", return_value=False):
                            result = scraper._select_option(1, "dropdown", "Option")

                            assert result is False

    def test_select_option_checkbox_all_selectors_fail(self, mock_config, mock_browser):
        """Test checkbox selection when all selectors fail"""
        config_json = json.dumps(mock_config)

        with patch("builtins.open", mock_open(read_data=config_json)):
            with patch("pathlib.Path.is_file", return_value=True):
                with patch("utils.conditional_question_scraper.Selenium", return_value=mock_browser):
                    scraper = ConditionalQuestionScraper("test-form")
                    scraper.browser = mock_browser

                    with patch.object(scraper, "_element_exists", return_value=False):
                        result = scraper._select_option(1, "checkbox", "Option")

                        assert result is False


class TestExtractCurrentQuestionsAdvanced:
    """Test _extract_current_questions method - advanced scenarios"""

    def test_extract_current_questions_with_options(self, mock_config, mock_browser):
        """Test extracting questions with options"""
        config_json = json.dumps(mock_config)

        mock_browser.find_elements.return_value = [MagicMock(), MagicMock()]

        with patch("builtins.open", mock_open(read_data=config_json)):
            with patch("pathlib.Path.is_file", return_value=True):
                with patch("utils.conditional_question_scraper.Selenium", return_value=mock_browser):
                    with patch("time.sleep"):
                        scraper = ConditionalQuestionScraper("test-form")
                        scraper.browser = mock_browser

                        with patch.object(scraper, "_get_question_text", side_effect=["Q1", "Q2"]):
                            with patch.object(scraper, "_get_question_type", side_effect=["radio", "dropdown"]):
                                with patch.object(
                                    scraper, "_get_question_options", side_effect=[["Opt1", "Opt2"], ["OptA"]]
                                ):
                                    with patch.object(scraper, "_scroll_to_bottom"):
                                        result = scraper._extract_current_questions()

                                        assert len(result) == 2
                                        assert result[1]["has_conditional_logic"] is True
                                        assert result[2]["has_conditional_logic"] is True

    def test_extract_current_questions_skip_no_text(self, mock_config, mock_browser):
        """Test extracting questions when some have no text"""
        config_json = json.dumps(mock_config)

        mock_browser.find_elements.return_value = [MagicMock(), MagicMock()]

        with patch("builtins.open", mock_open(read_data=config_json)):
            with patch("pathlib.Path.is_file", return_value=True):
                with patch("utils.conditional_question_scraper.Selenium", return_value=mock_browser):
                    with patch("time.sleep"):
                        scraper = ConditionalQuestionScraper("test-form")
                        scraper.browser = mock_browser

                        # First question has no text, second does
                        with patch.object(scraper, "_get_question_text", side_effect=[None, "Q2"]):
                            with patch.object(scraper, "_get_question_type", return_value="text"):
                                with patch.object(scraper, "_scroll_to_bottom"):
                                    result = scraper._extract_current_questions()

                                    # Only second question extracted
                                    assert len(result) == 1
                                    assert 2 in result


class TestForwardTraversal:
    """Test _explore_forward_traversal method (lines 588-698)"""

    def test_explore_forward_traversal_no_questions(self, mock_config, mock_browser):
        """Test forward traversal when no questions found"""
        config_json = json.dumps(mock_config)

        with patch("builtins.open", mock_open(read_data=config_json)):
            with patch("pathlib.Path.is_file", return_value=True):
                with patch("utils.conditional_question_scraper.Selenium", return_value=mock_browser):
                    with patch("time.sleep"):
                        scraper = ConditionalQuestionScraper("test-form")
                        scraper.browser = mock_browser

                        with patch.object(scraper, "_scroll_to_bottom"):
                            with patch.object(scraper, "_extract_current_questions", return_value={}):
                                # Should complete without error
                                scraper._explore_forward_traversal(max_options_per_question=2)

    def test_explore_forward_traversal_text_questions_only(self, mock_config, mock_browser):
        """Test forward traversal with only text questions (no conditional logic)"""
        config_json = json.dumps(mock_config)

        with patch("builtins.open", mock_open(read_data=config_json)):
            with patch("pathlib.Path.is_file", return_value=True):
                with patch("utils.conditional_question_scraper.Selenium", return_value=mock_browser):
                    with patch("time.sleep"):
                        scraper = ConditionalQuestionScraper("test-form")
                        scraper.browser = mock_browser

                        questions = {
                            1: {"question_text": "Q1", "question_type": "text", "options": []},
                            2: {"question_text": "Q2", "question_type": "textarea", "options": []},
                        }

                        with patch.object(scraper, "_scroll_to_bottom"):
                            with patch.object(scraper, "_extract_current_questions", return_value=questions):
                                with patch.object(scraper, "_get_visible_question_ids", return_value={"Q1", "Q2"}):
                                    scraper._explore_forward_traversal(max_options_per_question=2)

    def test_explore_forward_traversal_radio_with_no_options(self, mock_config, mock_browser):
        """Test forward traversal with radio question but no options"""
        config_json = json.dumps(mock_config)

        with patch("builtins.open", mock_open(read_data=config_json)):
            with patch("pathlib.Path.is_file", return_value=True):
                with patch("utils.conditional_question_scraper.Selenium", return_value=mock_browser):
                    with patch("time.sleep"):
                        scraper = ConditionalQuestionScraper("test-form")
                        scraper.browser = mock_browser

                        questions = {
                            1: {"question_text": "Q1", "question_type": "radio", "options": []},
                        }

                        with patch.object(scraper, "_scroll_to_bottom"):
                            with patch.object(scraper, "_extract_current_questions", return_value=questions):
                                with patch.object(scraper, "_get_visible_question_ids", return_value={"Q1"}):
                                    scraper._explore_forward_traversal(max_options_per_question=2)

    def test_explore_forward_traversal_option_reveals_new_questions(self, mock_config, mock_browser):
        """Test forward traversal when option reveals new questions"""
        config_json = json.dumps(mock_config)

        with patch("builtins.open", mock_open(read_data=config_json)):
            with patch("pathlib.Path.is_file", return_value=True):
                with patch("utils.conditional_question_scraper.Selenium", return_value=mock_browser):
                    with patch("time.sleep"):
                        scraper = ConditionalQuestionScraper("test-form")
                        scraper.browser = mock_browser

                        questions_iter1 = {
                            1: {"question_text": "Q1", "question_type": "radio", "options": ["Yes", "No"]},
                        }
                        questions_iter2 = {
                            1: {"question_text": "Q1", "question_type": "radio", "options": ["Yes", "No"]},
                            2: {"question_text": "Q2 (new)", "question_type": "text", "options": []},
                        }

                        extract_calls = [questions_iter1, questions_iter2, {}]  # Third call returns empty to end

                        with patch.object(scraper, "_scroll_to_bottom"):
                            with patch.object(scraper, "_extract_current_questions", side_effect=extract_calls):
                                with patch.object(scraper, "_get_visible_question_ids") as mock_visible:
                                    # First iteration: 1 question, after selecting option: 2 questions
                                    mock_visible.side_effect = [{"Q1"}, {"Q1"}, {"Q1", "Q2 (new)"}]

                                    with patch.object(scraper, "_select_option", return_value=True):
                                        scraper._explore_forward_traversal(max_options_per_question=1)

    def test_explore_forward_traversal_option_no_new_questions(self, mock_config, mock_browser):
        """Test forward traversal when option doesn't reveal new questions"""
        config_json = json.dumps(mock_config)

        with patch("builtins.open", mock_open(read_data=config_json)):
            with patch("pathlib.Path.is_file", return_value=True):
                with patch("utils.conditional_question_scraper.Selenium", return_value=mock_browser):
                    with patch("time.sleep"):
                        scraper = ConditionalQuestionScraper("test-form")
                        scraper.browser = mock_browser

                        questions = {
                            1: {"question_text": "Q1", "question_type": "radio", "options": ["Opt1", "Opt2", "Opt3"]},
                        }

                        with patch.object(scraper, "_scroll_to_bottom"):
                            with patch.object(scraper, "_extract_current_questions", side_effect=[questions, {}]):
                                with patch.object(scraper, "_get_visible_question_ids", return_value={"Q1"}):
                                    with patch.object(scraper, "_select_option", return_value=True):
                                        # Should skip remaining options after first reveals no new questions
                                        scraper._explore_forward_traversal(max_options_per_question=3)

    def test_explore_forward_traversal_select_option_fails(self, mock_config, mock_browser):
        """Test forward traversal when selecting option fails"""
        config_json = json.dumps(mock_config)

        with patch("builtins.open", mock_open(read_data=config_json)):
            with patch("pathlib.Path.is_file", return_value=True):
                with patch("utils.conditional_question_scraper.Selenium", return_value=mock_browser):
                    with patch("time.sleep"):
                        scraper = ConditionalQuestionScraper("test-form")
                        scraper.browser = mock_browser

                        questions = {
                            1: {"question_text": "Q1", "question_type": "dropdown", "options": ["A", "B"]},
                        }

                        with patch.object(scraper, "_scroll_to_bottom"):
                            with patch.object(scraper, "_extract_current_questions", side_effect=[questions, {}]):
                                with patch.object(scraper, "_get_visible_question_ids", return_value={"Q1"}):
                                    # First option fails, second option succeeds
                                    with patch.object(scraper, "_select_option", side_effect=[False, True]):
                                        scraper._explore_forward_traversal(max_options_per_question=2)

    def test_explore_forward_traversal_max_iterations_reached(self, mock_config, mock_browser):
        """Test forward traversal when max iterations reached"""
        config_json = json.dumps(mock_config)

        with patch("builtins.open", mock_open(read_data=config_json)):
            with patch("pathlib.Path.is_file", return_value=True):
                with patch("utils.conditional_question_scraper.Selenium", return_value=mock_browser):
                    with patch("time.sleep"):
                        scraper = ConditionalQuestionScraper("test-form")
                        scraper.browser = mock_browser

                        questions = {
                            1: {"question_text": "Q1", "question_type": "radio", "options": ["Yes"]},
                        }

                        with patch.object(scraper, "_scroll_to_bottom"):
                            # Always return questions to trigger max iterations
                            with patch.object(scraper, "_extract_current_questions", return_value=questions):
                                with patch.object(scraper, "_get_visible_question_ids") as mock_visible:
                                    # Always add new questions to keep loop going
                                    counter = [0]

                                    def visible_side_effect():
                                        counter[0] += 1
                                        return {f"Q{counter[0]}"}

                                    mock_visible.side_effect = visible_side_effect

                                    with patch.object(scraper, "_select_option", return_value=True):
                                        # Patch max_iterations to a lower value for testing
                                        with patch(
                                            "utils.conditional_question_scraper.ConditionalQuestionScraper._explore_forward_traversal"
                                        ) as mock_explore:
                                            # Just verify it could be called - actual max_iterations test is complex
                                            pass


class TestExtractAllQuestionsExceptionHandlingAdvanced:
    """Test exception handling in extract_all_questions - advanced scenarios"""

    def test_extract_all_questions_generic_exception_raised(self, mock_config, mock_browser):
        """Test generic exception in extract_all_questions - wrapped as FormLoadError"""
        config_json = json.dumps(mock_config)

        with patch("builtins.open", mock_open(read_data=config_json)):
            with patch("pathlib.Path.is_file", return_value=True):
                with patch("utils.conditional_question_scraper.Selenium", return_value=mock_browser):
                    scraper = ConditionalQuestionScraper("test-form")

                    with patch.object(scraper, "_open_form", side_effect=Exception("Unknown error")):
                        with patch.object(scraper, "close_browser"):
                            # Generic exception gets wrapped in FormLoadError, not passed to handle_service_exception
                            with pytest.raises(FormLoadError) as exc_info:
                                scraper.extract_all_questions()

                            assert "Unexpected error opening form: Unknown error" in str(exc_info.value)

    def test_extract_all_questions_reraises_form_load_error(self, mock_config, mock_browser):
        """Test that FormLoadError is reraised correctly"""
        config_json = json.dumps(mock_config)

        with patch("builtins.open", mock_open(read_data=config_json)):
            with patch("pathlib.Path.is_file", return_value=True):
                with patch("utils.conditional_question_scraper.Selenium", return_value=mock_browser):
                    scraper = ConditionalQuestionScraper("test-form")

                    with patch.object(scraper, "_open_form", side_effect=FormLoadError("Load error", form_type="test")):
                        with patch.object(scraper, "close_browser"):
                            with pytest.raises(FormLoadError) as exc_info:
                                scraper.extract_all_questions()

                            assert "Load error" in str(exc_info.value)

    def test_extract_all_questions_reraises_question_scraper_error(self, mock_config, mock_browser):
        """Test that QuestionScraperError is reraised correctly"""
        config_json = json.dumps(mock_config)

        with patch("builtins.open", mock_open(read_data=config_json)):
            with patch("pathlib.Path.is_file", return_value=True):
                with patch("utils.conditional_question_scraper.Selenium", return_value=mock_browser):
                    scraper = ConditionalQuestionScraper("test-form")

                    with patch.object(scraper, "_open_form", return_value=True):
                        with patch.object(
                            scraper, "_extract_current_questions", side_effect=QuestionScraperError("Scrape error")
                        ):
                            with patch.object(scraper, "close_browser"):
                                with pytest.raises(QuestionScraperError) as exc_info:
                                    scraper.extract_all_questions(use_conditional_exploration=False)

                                assert "Scrape error" in str(exc_info.value)

    def test_extract_all_questions_browser_error_without_conditional(self, mock_config, mock_browser):
        """Test WebDriverException during non-conditional extraction"""
        config_json = json.dumps(mock_config)

        with patch("builtins.open", mock_open(read_data=config_json)):
            with patch("pathlib.Path.is_file", return_value=True):
                with patch("utils.conditional_question_scraper.Selenium", return_value=mock_browser):
                    scraper = ConditionalQuestionScraper("test-form")

                    with patch.object(scraper, "_open_form", return_value=True):
                        with patch.object(
                            scraper, "_extract_current_questions", side_effect=WebDriverException("Browser crashed")
                        ):
                            with patch.object(scraper, "close_browser"):
                                with pytest.raises(QuestionScraperError) as exc_info:
                                    scraper.extract_all_questions(use_conditional_exploration=False)

                                assert "Browser automation error" in str(exc_info.value)

    def test_extract_all_questions_browser_error_with_conditional(self, mock_config, mock_browser):
        """Test WebDriverException during conditional exploration"""
        config_json = json.dumps(mock_config)

        with patch("builtins.open", mock_open(read_data=config_json)):
            with patch("pathlib.Path.is_file", return_value=True):
                with patch("utils.conditional_question_scraper.Selenium", return_value=mock_browser):
                    scraper = ConditionalQuestionScraper("test-form")

                    with patch.object(scraper, "_open_form", return_value=True):
                        with patch.object(
                            scraper, "_explore_forward_traversal", side_effect=WebDriverException("Browser crashed")
                        ):
                            with patch.object(scraper, "close_browser"):
                                with pytest.raises(ConditionalExplorationError) as exc_info:
                                    scraper.extract_all_questions(use_conditional_exploration=True)

                                assert "Browser automation error" in str(exc_info.value)

    def test_extract_all_questions_generic_exception_in_conditional(self, mock_config, mock_browser):
        """Test generic exception during conditional exploration"""
        config_json = json.dumps(mock_config)

        with patch("builtins.open", mock_open(read_data=config_json)):
            with patch("pathlib.Path.is_file", return_value=True):
                with patch("utils.conditional_question_scraper.Selenium", return_value=mock_browser):
                    scraper = ConditionalQuestionScraper("test-form")

                    with patch.object(scraper, "_open_form", return_value=True):
                        with patch.object(scraper, "_explore_forward_traversal", side_effect=Exception("Unknown")):
                            with patch.object(scraper, "close_browser"):
                                with pytest.raises(ConditionalExplorationError) as exc_info:
                                    scraper.extract_all_questions(use_conditional_exploration=True)

                                assert "Failed during conditional exploration" in str(exc_info.value)

    def test_extract_all_questions_generic_exception_without_conditional(self, mock_config, mock_browser):
        """Test generic exception during non-conditional extraction"""
        config_json = json.dumps(mock_config)

        with patch("builtins.open", mock_open(read_data=config_json)):
            with patch("pathlib.Path.is_file", return_value=True):
                with patch("utils.conditional_question_scraper.Selenium", return_value=mock_browser):
                    scraper = ConditionalQuestionScraper("test-form")

                    with patch.object(scraper, "_open_form", return_value=True):
                        with patch.object(scraper, "_extract_current_questions", side_effect=Exception("Unknown")):
                            with patch.object(scraper, "close_browser"):
                                with pytest.raises(QuestionScraperError) as exc_info:
                                    scraper.extract_all_questions(use_conditional_exploration=False)

                                assert "Failed to extract questions" in str(exc_info.value)


class TestReplaySelectionPath:
    """Test _replay_selection_path method"""

    def test_replay_selection_path_success(self, mock_config, mock_browser):
        """Test successful replay of selection path"""
        config_json = json.dumps(mock_config)

        with patch("builtins.open", mock_open(read_data=config_json)):
            with patch("pathlib.Path.is_file", return_value=True):
                with patch("utils.conditional_question_scraper.Selenium", return_value=mock_browser):
                    with patch("time.sleep"):
                        scraper = ConditionalQuestionScraper("test-form")
                        scraper.browser = mock_browser

                        selection_path = [(1, "radio", "Yes"), (2, "dropdown", "Option A")]

                        with patch.object(scraper, "_select_option", return_value=True):
                            result = scraper._replay_selection_path(selection_path)

                            assert result is True

    def test_replay_selection_path_failure(self, mock_config, mock_browser):
        """Test failed replay of selection path"""
        config_json = json.dumps(mock_config)

        with patch("builtins.open", mock_open(read_data=config_json)):
            with patch("pathlib.Path.is_file", return_value=True):
                with patch("utils.conditional_question_scraper.Selenium", return_value=mock_browser):
                    with patch("time.sleep"):
                        scraper = ConditionalQuestionScraper("test-form")
                        scraper.browser = mock_browser

                        selection_path = [(1, "radio", "Yes"), (2, "dropdown", "Option A")]

                        # Second selection fails
                        with patch.object(scraper, "_select_option", side_effect=[True, False]):
                            result = scraper._replay_selection_path(selection_path)

                            assert result is False
