"""
Browser Automation Module
==========================
Handles low-level browser interactions and form field filling using Selenium.
"""

import json
import time
import logging
from pathlib import Path
from typing import Optional
from RPA.Browser.Selenium import Selenium
from selenium.common.exceptions import (
    NoSuchElementException,
    TimeoutException,
    ElementNotInteractableException,
    StaleElementReferenceException,
)

logger = logging.getLogger(__name__)


class BrowserAutomation:
    """
    Handles browser automation for Microsoft Forms.
    Responsible for opening forms, filling fields, and browser lifecycle management.
    """

    def __init__(self, form_type: str = "ai-registry-form", config_path: Optional[str] = None):
        """
        Initialize browser automation.

        Args:
            form_type: Type of form to automate
            config_path: Optional path to config file
        """
        self.browser = None
        self.form_type = form_type

        cfg_path = Path(config_path) if config_path else Path(__file__).parent.parent / "rpa_config.json"
        if not cfg_path.is_file():
            raise FileNotFoundError(f"RPA config file not found at: {cfg_path}")
        with open(cfg_path, "r", encoding="utf-8-sig") as f:
            self.config = json.load(f)
        logger.info("Loaded RPA config from: %s", cfg_path)

    def open_form(self):
        """Open the Microsoft Form"""
        try:
            # Initialize browser fresh for each form opening
            if self.browser is None:
                self.browser = Selenium()

            form_url = self.config["form_urls"][self.form_type]
            browser_options = self.config.get("browser_options", {})
            headless = browser_options.get("headless", False)

            if headless:
                self.browser.open_available_browser(form_url, headless=True)
                window_size = browser_options.get("window_size", {"width": 1920, "height": 1080})
                self.browser.set_window_size(window_size["width"], window_size["height"])
            else:
                self.browser.open_available_browser(form_url)
                self.browser.maximize_browser_window()

            time.sleep(self.config["wait_times"]["page_load"])

            # Optional: wait for first question to appear (not critical if it fails)
            # Optional: wait for first question to appear (not critical if it times out)
            try:
                first_question = self.config["selectors"]["first_question"]
                self.browser.wait_until_element_is_visible(first_question, timeout=15)
                logger.debug("First question is visible")
            except TimeoutException:
                logger.debug("First question not visible within timeout, proceeding anyway")

            return True

        except Exception as e:
            logger.error("Error opening form: %s", e)
            return False

    def fill_text_field(self, question_num, value, field_name):
        """Fill text or textarea field"""
        if not value:
            return True

        logger.debug(
            "[TEXTBOX] Filling Q#%s field='%s' with value='%s'",
            question_num,
            field_name[:30],
            value[:50] if isinstance(value, str) else value,
        )

        selectors = [sel.format(question_num=question_num) for sel in self.config["selectors"]["text_fields"]]

        for i, selector in enumerate(selectors, 1):
            try:
                element = self.browser.find_element(selector)
                if element:
                    self.browser.clear_element_text(element)
                    self.browser.input_text(element, value)
                    logger.info("[TEXTBOX SUCCESS] Filled with selector #%d: %s", i, selector)
                    return True
            except (NoSuchElementException, TimeoutException):
                # Expected: element not found with this selector, try next
                logger.debug("[TEXTBOX] Selector #%d not found: %s", i, selector)
                continue
            except (ElementNotInteractableException, StaleElementReferenceException) as e:
                logger.warning("[TEXTBOX] Selector #%d found but not interactable (%s): %s", i, selector, e)
                continue
            except Exception as e:
                # Some selectors will naturally fail (e.g., textarea when input is needed)
                logger.debug("[TEXTBOX] Selector #%d not applicable (%s): %s", i, selector, e)
                continue

        logger.error(
            "[TEXTBOX FAILED] None of %d selectors worked for Q#%s field='%s'",
            len(selectors),
            question_num,
            field_name[:30],
        )
        return False

    def fill_dropdown(self, question_num, value, field_name):
        """
        Attempt to fill a dropdown.
        If trigger/options not found, fallback to radio handling by calling fill_radio.
        """
        logger.info("[DROPDOWN] Q#%s field='%s' value='%s'", question_num, field_name[:40], value[:60])
        try:
            question_container = self.config["selectors"]["question_container"].format(question_num=question_num)
            container = self.browser.find_element(question_container)
            if container:
                # Scroll the container into view
                self.browser.execute_javascript(
                    "arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});",
                    "ARGUMENTS",
                    container,
                )
                logger.debug("[DROPDOWN] Scrolled into view")
                time.sleep(self.config["wait_times"].get("after_scroll", 0.5))

            trigger_selectors = [
                sel.format(question_num=question_num) for sel in self.config["selectors"]["dropdown"]["triggers"]
            ]

            trigger_found = False
            for i, trigger_sel in enumerate(trigger_selectors, 1):
                try:
                    trigger_elem = self.browser.find_element(trigger_sel)
                    if trigger_elem:
                        self.browser.click_element(trigger_elem)
                        logger.info("[DROPDOWN] Clicked trigger #%d, waiting for options", i)
                        time.sleep(self.config["wait_times"].get("dropdown_open", 2))
                        trigger_found = True
                        break
                except (NoSuchElementException, TimeoutException, Exception) as e:
                    # Expected: trigger element not found with this selector
                    logger.debug("[DROPDOWN] Trigger #%d not found: %s", i, str(e)[:50])
                    continue

            if not trigger_found:
                logger.warning("[DROPDOWN] No trigger found => fallback to radio")
                return self.fill_radio(question_num, value, field_name)

            # Wait a bit longer for options to load
            logger.info("[DROPDOWN] Waiting for options list to appear...")
            time.sleep(1)

            # Try to find the option with various selectors
            # For long values, try partial match with first few words
            value_short = " ".join(value.split()[:3])  # First 3 words for partial match

            option_selectors = [
                sel.format(value=value, value_short=value_short)
                for sel in self.config["selectors"]["dropdown"]["options"]
            ]

            for i, option_sel in enumerate(option_selectors, 1):
                try:
                    option_elem = self.browser.find_element(option_sel)
                    if option_elem:
                        logger.info("[DROPDOWN] Found option with selector #%d, clicking...", i)
                        self.browser.click_element(option_elem)
                        logger.info("[DROPDOWN SUCCESS] Selected option with selector #%d", i)
                        return True
                except (NoSuchElementException, TimeoutException):
                    # Expected: option not found with this selector
                    logger.debug("[DROPDOWN] Option selector #%d not found", i)
                    continue
                except (ElementNotInteractableException, StaleElementReferenceException) as e:
                    logger.warning("[DROPDOWN] Option selector #%d found but not clickable: %s", i, e)
                    continue

            logger.error("[DROPDOWN FAILED] No option matched value='%s' => fallback to radio", value[:60])
            return self.fill_radio(question_num, value, field_name)

        except Exception as e:
            logger.error("[DROPDOWN] Exception occurred: %s => fallback to radio", str(e))
            logger.exception("Full exception details:")
            return self.fill_radio(question_num, value, field_name)

    def fill_radio(self, question_num, value, field_name):
        """Fill a radio button"""
        logger.info("[RADIO] Q#%s field='%s' value='%s'", question_num, field_name[:40], value[:60])

        selectors = [sel.format(question_num=question_num, value=value) for sel in self.config["selectors"]["radio"]]

        for i, selector in enumerate(selectors, 1):
            try:
                element = self.browser.find_element(selector)
                if element:
                    self.browser.click_element(element)
                    logger.info("[RADIO SUCCESS] Clicked with selector #%d", i)
                    return True
            except Exception as e:
                logger.debug("[RADIO] Selector #%d failed: %s", i, str(e)[:50])
                continue

        logger.error("[RADIO FAILED] None of %d selectors worked for value='%s'", len(selectors), value[:60])
        return False

    def fill_checkboxes(self, question_num, values, field_name):
        """Fill checkboxes"""
        logger.info("[CHECKBOX] Q#%s field='%s' values=%s", question_num, field_name[:40], values)

        # First, scroll to the question container
        try:
            question_container = self.config["selectors"]["question_container"].format(question_num=question_num)
            container = self.browser.find_element(question_container)
            if container:
                self.browser.execute_javascript(
                    "arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});",
                    "ARGUMENTS",
                    container,
                )
                logger.debug("[CHECKBOX] Scrolled to question container")
                time.sleep(self.config["wait_times"].get("after_scroll", 0.5))
        except Exception as e:
            logger.debug("[CHECKBOX] Could not scroll to container: %s", e)

        success_count = 0
        for value in values:
            value_partial = value[:50] if len(value) > 50 else value
            selectors = [
                sel.format(question_num=question_num, value=value, value_partial=value_partial)
                for sel in self.config["selectors"]["checkbox"]
            ]

            found = False
            for i, selector in enumerate(selectors, 1):
                try:
                    element = self.browser.find_element(selector)
                    if element:
                        self.browser.click_element(element)
                        logger.info("[CHECKBOX SUCCESS] Checked '%s' with selector #%d", value[:50], i)
                        success_count += 1
                        found = True
                        break
                except (NoSuchElementException, TimeoutException):
                    # Expected: checkbox not found with this selector
                    logger.debug("[CHECKBOX] Selector #%d not found for value '%s'", i, value[:50])
                    continue
                except (ElementNotInteractableException, StaleElementReferenceException) as e:
                    logger.warning("[CHECKBOX] Selector #%d found but not clickable for '%s': %s", i, value[:50], e)
                    continue
                except Exception as e:
                    logger.debug("[CHECKBOX] Selector #%d failed for '%s': %s", i, value[:50], str(e)[:50])
                    continue

            if not found:
                logger.error("[CHECKBOX FAILED] Could not find checkbox for value '%s' with any selector", value[:50])

        if success_count > 0:
            logger.info("[CHECKBOX] Successfully checked %d/%d checkboxes", success_count, len(values))
        else:
            logger.error("[CHECKBOX FAILED] None of the %d checkboxes were successfully checked", len(values))

        return success_count > 0

    def fill_datepicker(self, question_num, value, field_name):
        """Fill a date picker input (expects value like 'MM/DD/YYYY')."""
        try:
            if not value:
                return True
            date_str = value if isinstance(value, str) else (value[0] if isinstance(value, list) and value else "")
            if not date_str:
                return False

            logger.info("[DATEPICKER] Attempting to fill question %s with value: %s", question_num, date_str)

            if not self.browser:
                logger.error("[DATEPICKER] Browser instance is None!")
                return False

            # Scroll into view of the question container
            try:
                question_container = self.config["selectors"]["question_container"].format(question_num=question_num)
                container = self.browser.find_element(question_container)
                if container:
                    self.browser.execute_javascript(
                        "arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});",
                        container,
                    )
                    time.sleep(self.config["wait_times"].get("after_scroll", 0.5))
                    logger.debug("[DATEPICKER] Scrolled to question container")
            except (NoSuchElementException, TimeoutException):
                logger.debug("Could not find/scroll to datepicker container, proceeding anyway")
            except Exception as e:
                logger.debug("Unexpected error scrolling to datepicker: %s", e)

            # Candidate selectors for date input - Microsoft Forms uses role="combobox" with placeholder
            selectors = [
                sel.format(question_num=question_num) for sel in self.config["selectors"]["datepicker"]["inputs"]
            ]

            # Try to enable disabled inputs by clicking associated button if present
            try:
                button_sel = self.config["selectors"]["datepicker"]["calendar_button"].format(question_num=question_num)
                btn = self.browser.find_element(button_sel)
                if btn:
                    logger.debug("[DATEPICKER] Found calendar button, clicking to enable input")
                    self.browser.click_element(btn)
                    time.sleep(self.config["wait_times"].get("dropdown_open", 0.5))
            except (NoSuchElementException, TimeoutException):
                logger.debug("[DATEPICKER] No calendar button found, will try direct input")
            except ElementNotInteractableException:
                logger.debug("[DATEPICKER] Calendar button not clickable, will try direct input")
            except Exception as e:
                logger.error("[DATEPICKER] Unexpected error with calendar button: %s", e)

            logger.info("[DATEPICKER] Starting selector loop with %s selectors", len(selectors))
            selector_num = 0
            for selector in selectors:
                selector_num += 1
                logger.debug("[DATEPICKER] Trying selector #%s: %s", selector_num, selector)
                try:
                    element = self.browser.find_element(selector)
                    if element:
                        logger.info("[DATEPICKER] Found input with selector #%s", selector_num)
                        # if disabled, try removing disabled via JS and type
                        try:
                            disabled = self.browser.get_element_attribute(element, "disabled")
                            if disabled:
                                logger.debug("[DATEPICKER] Input is disabled, removing disabled attribute")
                                self.browser.execute_javascript("arguments[0].removeAttribute('disabled');", element)
                                time.sleep(0.1)
                        except Exception as e:
                            logger.debug("[DATEPICKER] Could not check/remove disabled attribute: %s", e)

                        # Clear existing value
                        try:
                            self.browser.clear_element_text(element)
                            logger.debug("[DATEPICKER] Cleared existing text")
                        except Exception as e:
                            logger.debug("[DATEPICKER] Could not clear text: %s", e)

                        # Input the date
                        self.browser.input_text(element, date_str)
                        logger.info("[DATEPICKER] Successfully entered date: %s", date_str)

                        # Trigger change event to ensure form validation
                        try:
                            self.browser.execute_javascript(
                                "arguments[0].dispatchEvent(new Event('change', { bubbles: true })); "
                                "arguments[0].dispatchEvent(new Event('blur', { bubbles: true }));",
                                element,
                            )
                            logger.debug("[DATEPICKER] Dispatched change and blur events")
                        except Exception as e:
                            logger.debug("[DATEPICKER] Could not dispatch events: %s", e)

                        time.sleep(0.5)  # Give time for validation
                        return True
                except (NoSuchElementException, TimeoutException):
                    # Expected: date input not found with this selector
                    logger.debug("[DATEPICKER] Selector #%s - element not found", selector_num)
                    continue
                except (ElementNotInteractableException, StaleElementReferenceException) as e:
                    logger.debug(
                        "[DATEPICKER] Selector #%s - element found but not interactable: %s",
                        selector_num,
                        e,
                    )
                    continue
                except Exception as e:
                    logger.error("[DATEPICKER] Selector #%s - unexpected error: %s", selector_num, e)
                    continue

            logger.error("[DATEPICKER] Failed to fill date field - tried %s selectors", selector_num)
            return False

        except Exception as e:
            logger.error("[DATEPICKER] Fatal error in fill_datepicker: %s", e, exc_info=True)
            return False

    def fill_field_by_type(self, question_num, field_type, answer, field_name):
        """Route to appropriate handler based on field type from database."""
        try:
            value = answer[0] if answer else ""
            if field_type in ["text", "textarea", "textbox"]:
                return self.fill_text_field(question_num, value, field_name)
            elif field_type in ["dropdown", "select"]:
                return self.fill_dropdown(question_num, value, field_name)
            elif field_type == "radio":
                return self.fill_radio(question_num, value, field_name)
            elif field_type in ["checkbox", "MultiSelect"]:
                return self.fill_checkboxes(question_num, answer, field_name)
            elif field_type in ["date", "datepicker"]:
                return self.fill_datepicker(question_num, value, field_name)
            elif field_type == "file":
                return True
            else:
                return False
        except Exception as e:
            logger.debug("[fill_field_by_type] Exception for field '%s': %s", field_name, e)
            return False

    def get_form_question_text(self, question_num):
        """Extract the actual question text from the form for a given question number"""
        try:
            question_selectors = [
                sel.format(question_num=question_num) for sel in self.config["selectors"]["question_title"]
            ]

            for selector in question_selectors:
                try:
                    element = self.browser.find_element(selector)
                    if element:
                        question_text = self.browser.get_text(element).strip()
                        if question_text and len(question_text) > 5:
                            return question_text
                except Exception:
                    continue

            return None

        except Exception:
            return None

    def count_form_questions(self):
        """Count the currently visible questions in the form"""
        try:
            question_containers = self.browser.find_elements(self.config["selectors"]["first_question"])
            return len(question_containers)
        except Exception:
            return 0

    def wait_for_new_questions(self, current_count, max_wait_time=10):
        """Wait for new questions to appear after filling a question"""
        try:
            start_time = time.time()
            while time.time() - start_time < max_wait_time:
                time.sleep(1)
                new_count = self.count_form_questions()
                if new_count > current_count:
                    return new_count
            return current_count
        except Exception:
            return current_count

    def check_validation_errors(self):
        """
        Check for validation errors after form submission.
        Returns list of error messages if validation failed, empty list if successful.
        """
        try:
            validation_error_selectors = self.config["selectors"]["validation_errors"]

            errors = []
            for selector in validation_error_selectors:
                try:
                    elements = self.browser.find_elements(selector)
                    if elements:
                        for elem in elements:
                            error_text = self.browser.get_text(elem).strip()
                            if error_text and len(error_text) > 0:
                                if error_text not in errors:
                                    errors.append(error_text)
                except Exception:
                    continue

            return errors
        except Exception as e:
            logger.debug("Error checking validation: %s", e)
            return []

    def submit_form(self):
        """Submit the form"""
        try:
            logger.info("Submitting form...")
            submit_selectors = self.config["selectors"]["submit"]

            for selector in submit_selectors:
                try:
                    element = self.browser.find_element(selector)
                    if element:
                        self.browser.click_element(element)
                        logger.info("Submit button clicked, waiting for response...")
                        time.sleep(self.config["wait_times"]["after_submit"])

                        # Check for validation errors after submission
                        validation_errors = self.check_validation_errors()
                        if validation_errors:
                            logger.error("Form validation failed! Missing required fields:")
                            for error in validation_errors:
                                logger.error("  - %s", error)
                            return False

                        logger.info("Form submitted successfully with no validation errors!")
                        return True
                except (NoSuchElementException, TimeoutException):
                    # Expected: submit button not found with this selector
                    continue
                except (ElementNotInteractableException, StaleElementReferenceException) as e:
                    logger.warning("Submit button found but not clickable (%s): %s", selector, e)
                    continue

            logger.warning("Submit button not found")
            return False

        except Exception as e:
            logger.error("Error submitting form: %s", e)
            return False

    def close_browser(self):
        """Close the browser and cleanup"""
        try:
            if hasattr(self, "browser") and self.browser:
                try:
                    self.browser.close_browser()
                    logger.info("Browser closed successfully")
                except Exception as close_error:
                    # Ignore connection errors when browser is already gone
                    error_msg = str(close_error).lower()
                    if "connection" in error_msg or "10061" in error_msg or "refused" in error_msg:
                        logger.debug("Browser already closed or connection lost: %s", close_error)
                    else:
                        logger.error("Error closing browser: %s", close_error)
                finally:
                    self.browser = None  # Always reset to None
            else:
                logger.warning("Browser was not initialized or already closed")
        except Exception as e:
            logger.error("Unexpected error in close_browser: %s", e)
            self.browser = None  # Reset even on error to prevent reuse attempts
