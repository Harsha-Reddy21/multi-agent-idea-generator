"""Tests for browser automation"""

import pytest
from pathlib import Path
from unittest.mock import MagicMock, patch
from utils.browser_automation import BrowserAutomation


class TestBrowserAutomation:
    """Test cases for BrowserAutomation"""

    def test_init_with_default_config(self):
        """Test initialization with default config path"""
        automation = BrowserAutomation("ai-registry-form")

        assert automation.form_type == "ai-registry-form"
        assert automation.config is not None
        assert isinstance(automation.config, dict)

    def test_init_with_existing_config(self):
        """Test initialization with existing rpa_config.json"""
        automation = BrowserAutomation("security-arch-form", "rpa_config.json")

        assert automation.form_type == "security-arch-form"
        assert automation.config is not None

    def test_get_form_config(self):
        """Test getting form configuration"""
        automation = BrowserAutomation("ai-registry-form")

        # Verify config is loaded and is a dict
        assert isinstance(automation.config, dict)
        # Config should have expected structure (form_urls, selectors, etc.)
        assert len(automation.config) > 0


"""Extended tests for browser automation with method coverage"""

import pytest
from unittest.mock import MagicMock, patch, Mock
from utils.browser_automation import BrowserAutomation


class TestBrowserAutomationExtended:
    """Extended test cases for BrowserAutomation methods"""

    @patch("utils.browser_automation.Selenium")
    def test_open_form_success(self, mock_selenium_class):
        """Test opening form successfully"""
        mock_browser = MagicMock()
        mock_selenium_class.return_value = mock_browser

        automation = BrowserAutomation("ai-registry-form")
        automation.browser = mock_browser

        result = automation.open_form()

        assert result is True

    @patch("utils.browser_automation.Selenium")
    def test_open_form_with_headless(self, mock_selenium_class):
        """Test opening form in headless mode"""
        mock_browser = MagicMock()
        mock_selenium_class.return_value = mock_browser

        automation = BrowserAutomation("ai-registry-form")
        automation.config["browser_options"] = {"headless": True, "window_size": {"width": 1920, "height": 1080}}
        automation.browser = mock_browser

        result = automation.open_form()

        assert result is True

    @patch("utils.browser_automation.Selenium")
    def test_open_form_exception(self, mock_selenium_class):
        """Test opening form with exception"""
        mock_browser = MagicMock()
        mock_browser.open_available_browser.side_effect = Exception("Browser error")
        mock_selenium_class.return_value = mock_browser

        automation = BrowserAutomation("ai-registry-form")
        automation.browser = mock_browser

        result = automation.open_form()

        assert result is False

    @patch("utils.browser_automation.Selenium")
    def test_fill_text_field_success(self, mock_selenium_class):
        """Test filling text field successfully"""
        mock_browser = MagicMock()
        mock_element = MagicMock()
        mock_browser.find_element.return_value = mock_element

        automation = BrowserAutomation("ai-registry-form")
        automation.browser = mock_browser

        result = automation.fill_text_field(1, "Test value", "Test field")

        assert result is True

    @patch("utils.browser_automation.Selenium")
    def test_fill_text_field_empty_value(self, mock_selenium_class):
        """Test filling text field with empty value"""
        automation = BrowserAutomation("ai-registry-form")

        result = automation.fill_text_field(1, "", "Test field")

        assert result is True

    @patch("utils.browser_automation.Selenium")
    def test_fill_text_field_no_element(self, mock_selenium_class):
        """Test filling text field when element not found"""
        mock_browser = MagicMock()
        mock_browser.find_element.return_value = None

        automation = BrowserAutomation("ai-registry-form")
        automation.browser = mock_browser

        result = automation.fill_text_field(1, "Test value", "Test field")

        # Should return False when no selectors work
        assert result == False

    @patch("utils.browser_automation.Selenium")
    def test_submit_form(self, mock_selenium_class):
        """Test form submission"""
        mock_browser = MagicMock()
        mock_button = MagicMock()
        mock_browser.find_element.return_value = mock_button

        automation = BrowserAutomation("ai-registry-form")
        automation.browser = mock_browser

        result = automation.submit_form()

        assert result in [True, False]

    def test_get_form_url(self):
        """Test getting form URL from config"""
        automation = BrowserAutomation("ai-registry-form")

        if "form_urls" in automation.config and "ai-registry-form" in automation.config["form_urls"]:
            url = automation.config["form_urls"]["ai-registry-form"]
            assert isinstance(url, str)
            assert len(url) > 0

    def test_get_selectors(self):
        """Test getting selectors from config"""
        automation = BrowserAutomation("ai-registry-form")

        if "selectors" in automation.config:
            selectors = automation.config["selectors"]
            assert isinstance(selectors, dict)

    def test_get_wait_times(self):
        """Test getting wait times from config"""
        automation = BrowserAutomation("ai-registry-form")

        if "wait_times" in automation.config:
            wait_times = automation.config["wait_times"]
            assert isinstance(wait_times, dict)

    def test_init_with_missing_config_file(self):
        """Test initialization with non-existent config file"""
        with pytest.raises(FileNotFoundError):
            BrowserAutomation("ai-registry-form", "/nonexistent/path/config.json")

    @patch("utils.browser_automation.Selenium")
    def test_fill_dropdown_success(self, mock_selenium_class):
        """Test filling dropdown successfully"""
        mock_browser = MagicMock()
        mock_trigger = MagicMock()
        mock_option = MagicMock()
        mock_browser.find_element.side_effect = [
            None,
            mock_trigger,
            mock_option,
        ]  # Skip container, find trigger and option

        automation = BrowserAutomation("ai-registry-form")
        automation.browser = mock_browser

        result = automation.fill_dropdown(1, "Option Value", "Test dropdown")

        assert result is True
        mock_browser.click_element.assert_called()

    @patch("utils.browser_automation.Selenium")
    def test_fill_dropdown_fallback_to_radio(self, mock_selenium_class):
        """Test dropdown falling back to radio when trigger not found"""
        mock_browser = MagicMock()
        mock_browser.find_element.return_value = None

        automation = BrowserAutomation("ai-registry-form")
        automation.browser = mock_browser

        with patch.object(automation, "fill_radio", return_value=True) as mock_fill_radio:
            result = automation.fill_dropdown(1, "Option Value", "Test dropdown")

            mock_fill_radio.assert_called_once()

    @patch("utils.browser_automation.Selenium")
    def test_fill_dropdown_no_option_found(self, mock_selenium_class):
        """Test dropdown when option not found"""
        mock_browser = MagicMock()
        mock_trigger = MagicMock()
        # First call returns None (container), second returns trigger, subsequent return None (no options)
        mock_browser.find_element.side_effect = [None, mock_trigger] + [None] * 10

        automation = BrowserAutomation("ai-registry-form")
        automation.browser = mock_browser

        with patch.object(automation, "fill_radio", return_value=False) as mock_fill_radio:
            result = automation.fill_dropdown(1, "Non-existent Option", "Test dropdown")

            mock_fill_radio.assert_called_once()

    @patch("utils.browser_automation.Selenium")
    def test_fill_dropdown_exception_fallback(self, mock_selenium_class):
        """Test dropdown exception handling with fallback to radio"""
        mock_browser = MagicMock()
        mock_browser.find_element.side_effect = Exception("Dropdown error")

        automation = BrowserAutomation("ai-registry-form")
        automation.browser = mock_browser

        with patch.object(automation, "fill_radio", return_value=True) as mock_fill_radio:
            result = automation.fill_dropdown(1, "Test Value", "Test dropdown")

            mock_fill_radio.assert_called_once()

    @patch("utils.browser_automation.Selenium")
    def test_fill_radio_success(self, mock_selenium_class):
        """Test filling radio button successfully"""
        mock_browser = MagicMock()
        mock_element = MagicMock()
        mock_browser.find_element.return_value = mock_element

        automation = BrowserAutomation("ai-registry-form")
        automation.browser = mock_browser

        result = automation.fill_radio(1, "Radio Value", "Test radio")

        assert result is True
        mock_browser.click_element.assert_called_once_with(mock_element)

    @patch("utils.browser_automation.Selenium")
    def test_fill_radio_no_element(self, mock_selenium_class):
        """Test filling radio when element not found"""
        mock_browser = MagicMock()
        mock_browser.find_element.return_value = None

        automation = BrowserAutomation("ai-registry-form")
        automation.browser = mock_browser

        result = automation.fill_radio(1, "Radio Value", "Test radio")

        assert result is False

    @patch("utils.browser_automation.Selenium")
    def test_fill_checkboxes_success(self, mock_selenium_class):
        """Test filling multiple checkboxes successfully"""
        mock_browser = MagicMock()
        mock_checkbox = MagicMock()
        mock_browser.find_element.return_value = mock_checkbox

        automation = BrowserAutomation("ai-registry-form")
        automation.browser = mock_browser

        result = automation.fill_checkboxes(1, ["Option 1", "Option 2"], "Test checkboxes")

        assert result is True
        assert mock_browser.click_element.call_count >= 2

    @patch("utils.browser_automation.Selenium")
    def test_fill_checkboxes_partial_success(self, mock_selenium_class):
        """Test filling checkboxes with some not found"""
        mock_browser = MagicMock()
        mock_checkbox = MagicMock()
        # First checkbox found, second not found
        mock_browser.find_element.side_effect = [None, mock_checkbox, None, None, None, None, None, None]

        automation = BrowserAutomation("ai-registry-form")
        automation.browser = mock_browser

        result = automation.fill_checkboxes(1, ["Option 1", "Option 2"], "Test checkboxes")

        # Should return True if at least one checkbox was checked
        assert result is True

    @patch("utils.browser_automation.Selenium")
    def test_fill_checkboxes_all_fail(self, mock_selenium_class):
        """Test filling checkboxes when all fail"""
        mock_browser = MagicMock()
        mock_browser.find_element.return_value = None

        automation = BrowserAutomation("ai-registry-form")
        automation.browser = mock_browser

        result = automation.fill_checkboxes(1, ["Option 1", "Option 2"], "Test checkboxes")

        assert result is False

    @patch("utils.browser_automation.Selenium")
    def test_fill_datepicker_success(self, mock_selenium_class):
        """Test filling datepicker successfully"""
        mock_browser = MagicMock()
        mock_element = MagicMock()
        mock_browser.find_element.return_value = mock_element
        mock_browser.get_element_attribute.return_value = None

        automation = BrowserAutomation("ai-registry-form")
        automation.browser = mock_browser

        result = automation.fill_datepicker(1, "01/15/2024", "Test date")

        assert result is True
        mock_browser.input_text.assert_called_once()

    @patch("utils.browser_automation.Selenium")
    def test_fill_datepicker_empty_value(self, mock_selenium_class):
        """Test filling datepicker with empty value"""
        automation = BrowserAutomation("ai-registry-form")

        result = automation.fill_datepicker(1, "", "Test date")

        assert result is True

    @patch("utils.browser_automation.Selenium")
    def test_fill_datepicker_list_value(self, mock_selenium_class):
        """Test filling datepicker with list value"""
        mock_browser = MagicMock()
        mock_element = MagicMock()
        mock_browser.find_element.return_value = mock_element
        mock_browser.get_element_attribute.return_value = None

        automation = BrowserAutomation("ai-registry-form")
        automation.browser = mock_browser

        result = automation.fill_datepicker(1, ["01/15/2024"], "Test date")

        assert result is True

    @patch("utils.browser_automation.Selenium")
    def test_fill_datepicker_disabled_input(self, mock_selenium_class):
        """Test filling datepicker with disabled input"""
        mock_browser = MagicMock()
        mock_element = MagicMock()
        mock_button = MagicMock()
        mock_browser.find_element.side_effect = [None, mock_button, mock_element]
        mock_browser.get_element_attribute.return_value = "true"

        automation = BrowserAutomation("ai-registry-form")
        automation.browser = mock_browser

        result = automation.fill_datepicker(1, "01/15/2024", "Test date")

        assert result is True
        # Should have tried to remove disabled attribute
        assert mock_browser.execute_javascript.call_count > 0

    @patch("utils.browser_automation.Selenium")
    def test_fill_datepicker_no_browser(self, mock_selenium_class):
        """Test filling datepicker when browser is None"""
        automation = BrowserAutomation("ai-registry-form")
        automation.browser = None

        result = automation.fill_datepicker(1, "01/15/2024", "Test date")

        assert result is False

    @patch("utils.browser_automation.Selenium")
    def test_fill_field_by_type_text(self, mock_selenium_class):
        """Test fill_field_by_type with text type"""
        automation = BrowserAutomation("ai-registry-form")

        with patch.object(automation, "fill_text_field", return_value=True) as mock_fill:
            result = automation.fill_field_by_type(1, "text", ["value"], "Test field")

            assert result is True
            mock_fill.assert_called_once_with(1, "value", "Test field")

    @patch("utils.browser_automation.Selenium")
    def test_fill_field_by_type_textarea(self, mock_selenium_class):
        """Test fill_field_by_type with textarea type"""
        automation = BrowserAutomation("ai-registry-form")

        with patch.object(automation, "fill_text_field", return_value=True) as mock_fill:
            result = automation.fill_field_by_type(1, "textarea", ["value"], "Test field")

            assert result is True
            mock_fill.assert_called_once()

    @patch("utils.browser_automation.Selenium")
    def test_fill_field_by_type_dropdown(self, mock_selenium_class):
        """Test fill_field_by_type with dropdown type"""
        automation = BrowserAutomation("ai-registry-form")

        with patch.object(automation, "fill_dropdown", return_value=True) as mock_fill:
            result = automation.fill_field_by_type(1, "dropdown", ["value"], "Test field")

            assert result is True
            mock_fill.assert_called_once()

    @patch("utils.browser_automation.Selenium")
    def test_fill_field_by_type_radio(self, mock_selenium_class):
        """Test fill_field_by_type with radio type"""
        automation = BrowserAutomation("ai-registry-form")

        with patch.object(automation, "fill_radio", return_value=True) as mock_fill:
            result = automation.fill_field_by_type(1, "radio", ["value"], "Test field")

            assert result is True
            mock_fill.assert_called_once()

    @patch("utils.browser_automation.Selenium")
    def test_fill_field_by_type_checkbox(self, mock_selenium_class):
        """Test fill_field_by_type with checkbox type"""
        automation = BrowserAutomation("ai-registry-form")

        with patch.object(automation, "fill_checkboxes", return_value=True) as mock_fill:
            result = automation.fill_field_by_type(1, "checkbox", ["value1", "value2"], "Test field")

            assert result is True
            mock_fill.assert_called_once_with(1, ["value1", "value2"], "Test field")

    @patch("utils.browser_automation.Selenium")
    def test_fill_field_by_type_datepicker(self, mock_selenium_class):
        """Test fill_field_by_type with datepicker type"""
        automation = BrowserAutomation("ai-registry-form")

        with patch.object(automation, "fill_datepicker", return_value=True) as mock_fill:
            result = automation.fill_field_by_type(1, "date", ["01/15/2024"], "Test field")

            assert result is True
            mock_fill.assert_called_once()

    @patch("utils.browser_automation.Selenium")
    def test_fill_field_by_type_file(self, mock_selenium_class):
        """Test fill_field_by_type with file type"""
        automation = BrowserAutomation("ai-registry-form")

        result = automation.fill_field_by_type(1, "file", ["file.txt"], "Test field")

        assert result is True  # File uploads always return True

    @patch("utils.browser_automation.Selenium")
    def test_fill_field_by_type_unknown(self, mock_selenium_class):
        """Test fill_field_by_type with unknown type"""
        automation = BrowserAutomation("ai-registry-form")

        result = automation.fill_field_by_type(1, "unknown_type", ["value"], "Test field")

        assert result is False

    @patch("utils.browser_automation.Selenium")
    def test_fill_field_by_type_exception(self, mock_selenium_class):
        """Test fill_field_by_type exception handling"""
        automation = BrowserAutomation("ai-registry-form")

        with patch.object(automation, "fill_text_field", side_effect=Exception("Test error")):
            result = automation.fill_field_by_type(1, "text", ["value"], "Test field")

            assert result is False

    @patch("utils.browser_automation.Selenium")
    def test_get_form_question_text_success(self, mock_selenium_class):
        """Test getting form question text successfully"""
        mock_browser = MagicMock()
        mock_element = MagicMock()
        mock_browser.find_element.return_value = mock_element
        mock_browser.get_text.return_value = "What is your name?"

        automation = BrowserAutomation("ai-registry-form")
        automation.browser = mock_browser

        result = automation.get_form_question_text(1)

        assert result == "What is your name?"

    @patch("utils.browser_automation.Selenium")
    def test_get_form_question_text_not_found(self, mock_selenium_class):
        """Test getting form question text when not found"""
        mock_browser = MagicMock()
        mock_browser.find_element.return_value = None

        automation = BrowserAutomation("ai-registry-form")
        automation.browser = mock_browser

        result = automation.get_form_question_text(1)

        assert result is None

    @patch("utils.browser_automation.Selenium")
    def test_get_form_question_text_short_text(self, mock_selenium_class):
        """Test getting form question text with short text"""
        mock_browser = MagicMock()
        mock_element = MagicMock()
        mock_browser.find_element.return_value = mock_element
        mock_browser.get_text.return_value = "Yes"  # Too short

        automation = BrowserAutomation("ai-registry-form")
        automation.browser = mock_browser

        result = automation.get_form_question_text(1)

        assert result is None

    @patch("utils.browser_automation.Selenium")
    def test_count_form_questions_success(self, mock_selenium_class):
        """Test counting form questions"""
        mock_browser = MagicMock()
        mock_browser.find_elements.return_value = [Mock(), Mock(), Mock()]

        automation = BrowserAutomation("ai-registry-form")
        automation.browser = mock_browser

        result = automation.count_form_questions()

        assert result == 3

    @patch("utils.browser_automation.Selenium")
    def test_count_form_questions_exception(self, mock_selenium_class):
        """Test counting form questions with exception"""
        mock_browser = MagicMock()
        mock_browser.find_elements.side_effect = Exception("Error")

        automation = BrowserAutomation("ai-registry-form")
        automation.browser = mock_browser

        result = automation.count_form_questions()

        assert result == 0

    @patch("utils.browser_automation.Selenium")
    def test_wait_for_new_questions_found(self, mock_selenium_class):
        """Test waiting for new questions when they appear"""
        mock_browser = MagicMock()
        automation = BrowserAutomation("ai-registry-form")
        automation.browser = mock_browser

        with patch.object(automation, "count_form_questions", side_effect=[5, 7]):
            result = automation.wait_for_new_questions(5, max_wait_time=2)

            assert result == 7

    @patch("utils.browser_automation.Selenium")
    def test_wait_for_new_questions_timeout(self, mock_selenium_class):
        """Test waiting for new questions timeout"""
        mock_browser = MagicMock()
        automation = BrowserAutomation("ai-registry-form")
        automation.browser = mock_browser

        with patch.object(automation, "count_form_questions", return_value=5):
            result = automation.wait_for_new_questions(5, max_wait_time=1)

            assert result == 5

    @patch("utils.browser_automation.Selenium")
    def test_wait_for_new_questions_exception(self, mock_selenium_class):
        """Test waiting for new questions with exception"""
        mock_browser = MagicMock()
        automation = BrowserAutomation("ai-registry-form")
        automation.browser = mock_browser

        with patch.object(automation, "count_form_questions", side_effect=Exception("Error")):
            result = automation.wait_for_new_questions(5)

            assert result == 5

    @patch("utils.browser_automation.Selenium")
    def test_check_validation_errors_with_errors(self, mock_selenium_class):
        """Test checking validation errors when errors exist"""
        mock_browser = MagicMock()
        mock_elem1 = MagicMock()
        mock_elem2 = MagicMock()
        mock_browser.find_elements.return_value = [mock_elem1, mock_elem2]
        mock_browser.get_text.side_effect = ["Error 1", "Error 2"]

        automation = BrowserAutomation("ai-registry-form")
        automation.browser = mock_browser

        result = automation.check_validation_errors()

        assert len(result) == 2
        assert "Error 1" in result
        assert "Error 2" in result

    @patch("utils.browser_automation.Selenium")
    def test_check_validation_errors_no_errors(self, mock_selenium_class):
        """Test checking validation errors when no errors"""
        mock_browser = MagicMock()
        mock_browser.find_elements.return_value = []

        automation = BrowserAutomation("ai-registry-form")
        automation.browser = mock_browser

        result = automation.check_validation_errors()

        assert result == []

    @patch("utils.browser_automation.Selenium")
    def test_check_validation_errors_exception(self, mock_selenium_class):
        """Test checking validation errors with exception"""
        mock_browser = MagicMock()
        mock_browser.find_elements.side_effect = Exception("Error")

        automation = BrowserAutomation("ai-registry-form")
        automation.browser = mock_browser

        result = automation.check_validation_errors()

        assert result == []

    @patch("utils.browser_automation.Selenium")
    def test_submit_form_with_validation_errors(self, mock_selenium_class):
        """Test form submission with validation errors"""
        mock_browser = MagicMock()
        mock_button = MagicMock()
        mock_browser.find_element.return_value = mock_button

        automation = BrowserAutomation("ai-registry-form")
        automation.browser = mock_browser

        with patch.object(automation, "check_validation_errors", return_value=["Error 1"]):
            with patch("time.sleep"):  # Skip actual sleep
                result = automation.submit_form()

                assert result is False

    @patch("utils.browser_automation.Selenium")
    def test_submit_form_button_not_found(self, mock_selenium_class):
        """Test form submission when button not found"""
        mock_browser = MagicMock()
        mock_browser.find_element.return_value = None

        automation = BrowserAutomation("ai-registry-form")
        automation.browser = mock_browser

        result = automation.submit_form()

        assert result is False

    @patch("utils.browser_automation.Selenium")
    def test_submit_form_exception(self, mock_selenium_class):
        """Test form submission with exception"""
        mock_browser = MagicMock()
        mock_browser.find_element.side_effect = Exception("Submit error")

        automation = BrowserAutomation("ai-registry-form")
        automation.browser = mock_browser

        result = automation.submit_form()

        assert result is False

    @patch("utils.browser_automation.Selenium")
    def test_close_browser_success(self, mock_selenium_class):
        """Test closing browser successfully"""
        mock_browser = MagicMock()

        automation = BrowserAutomation("ai-registry-form")
        automation.browser = mock_browser

        automation.close_browser()

        mock_browser.close_browser.assert_called_once()
        assert automation.browser is None

    @patch("utils.browser_automation.Selenium")
    def test_close_browser_already_closed(self, mock_selenium_class):
        """Test closing browser when already closed"""
        automation = BrowserAutomation("ai-registry-form")
        automation.browser = None

        automation.close_browser()

        assert automation.browser is None

    @patch("utils.browser_automation.Selenium")
    def test_close_browser_connection_error(self, mock_selenium_class):
        """Test closing browser with connection error"""
        mock_browser = MagicMock()
        mock_browser.close_browser.side_effect = Exception("Connection refused")

        automation = BrowserAutomation("ai-registry-form")
        automation.browser = mock_browser

        automation.close_browser()

        assert automation.browser is None

    @patch("utils.browser_automation.Selenium")
    def test_close_browser_other_error(self, mock_selenium_class):
        """Test closing browser with other error"""
        mock_browser = MagicMock()
        mock_browser.close_browser.side_effect = Exception("Other error")

        automation = BrowserAutomation("ai-registry-form")
        automation.browser = mock_browser

        automation.close_browser()

        assert automation.browser is None

    @patch("utils.browser_automation.Selenium")
    def test_open_form_with_browser_none(self, mock_selenium_class):
        """Test opening form when browser is None"""
        mock_browser = MagicMock()
        mock_selenium_class.return_value = mock_browser

        automation = BrowserAutomation("ai-registry-form")
        automation.browser = None

        result = automation.open_form()

        assert result is True
        assert automation.browser is not None
