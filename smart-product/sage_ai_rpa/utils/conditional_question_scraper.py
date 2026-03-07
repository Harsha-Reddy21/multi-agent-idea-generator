"""
Conditional Question Scraper
=============================
Utility to extract ALL questions from Microsoft Forms, including conditional questions
that appear based on specific answer selections.
"""

import time
import logging
import json
import re
from typing import List, Dict, Any, Optional, Set
from pathlib import Path
from RPA.Browser.Selenium import Selenium
from selenium.common.exceptions import (
    TimeoutException,
    WebDriverException,
    NoSuchElementException,
    StaleElementReferenceException,
)
from exceptions import (
    ConfigurationError,
    FormLoadError,
    QuestionScraperError,
    ConditionalExplorationError,
)

logger = logging.getLogger(__name__)


class ConditionalQuestionScraper:
    """
    Scraper to extract all questions from MS Forms including conditional questions.

    Microsoft Forms can have conditional logic where certain questions only appear
    based on the user's selection of specific options in previous questions.
    This scraper systematically explores all possible paths to discover all questions.
    """

    def __init__(self, form_type: str = "ai-registry-form", config_path: Optional[str] = None):
        """
        Initialize the conditional question scraper.

        Args:
            form_type: Type of form to scrape
            config_path: Optional path to config file
        """
        self.browser = None
        self.form_type = form_type
        self.discovered_questions: Dict[int, Dict[str, Any]] = {}
        self.all_questions_by_text: Dict[str, Dict[str, Any]] = {}  # Track by question text to avoid duplicates
        self.visited_states: Set[str] = set()

        # Load configuration
        cfg_path = Path(config_path) if config_path else Path(__file__).parent.parent / "rpa_config.json"
        if not cfg_path.is_file():
            raise ConfigurationError("RPA config file not found", config_path=str(cfg_path))
        try:
            with open(cfg_path, "r", encoding="utf-8-sig") as f:
                self.config = json.load(f)
        except json.JSONDecodeError as e:
            raise ConfigurationError(f"Invalid JSON in config file: {e}", config_path=str(cfg_path))
        except Exception as e:
            raise ConfigurationError(f"Failed to load config: {e}", config_path=str(cfg_path))
        logger.info("Loaded RPA config from: %s", cfg_path)

    def _initialize_browser(self):
        """Initialize the browser if not already initialized."""
        if self.browser is None:
            self.browser = Selenium()

    def _open_form(self) -> bool:
        """
        Open the Microsoft Form in browser.

        Returns:
            True if successful, False otherwise
        """
        try:
            self._initialize_browser()

            # Check if form_type exists in config
            if self.form_type not in self.config.get("form_urls", {}):
                raise FormLoadError("Form type not found in configuration", form_type=self.form_type)

            form_url = self.config["form_urls"][self.form_type]
            browser_options = self.config.get("browser_options", {})
            headless = browser_options.get("headless", False)

            try:
                if headless:
                    self.browser.open_available_browser(form_url, headless=True)
                    window_size = browser_options.get("window_size", {"width": 1920, "height": 1080})
                    self.browser.set_window_size(window_size["width"], window_size["height"])
                else:
                    self.browser.open_available_browser(form_url)
                    self.browser.maximize_browser_window()
            except WebDriverException as e:
                logger.exception("WebDriver error opening browser for form %s", self.form_type)
                raise FormLoadError(f"Browser automation error: {str(e)}", form_type=self.form_type)
            except (KeyError, TypeError) as e:
                logger.exception("Configuration error during browser setup")
                raise ConfigurationError(f"Invalid browser configuration: {str(e)}", config_path="browser_options")
            except Exception as e:
                logger.exception("Unexpected error opening browser")
                raise FormLoadError(f"Failed to open browser or navigate to form: {e}", form_type=self.form_type)

            time.sleep(self.config["wait_times"]["page_load"])

            # Wait for first question to appear
            try:
                first_question = self.config["selectors"]["first_question"]
                self.browser.wait_until_element_is_visible(first_question, timeout=15)
                logger.debug("Form loaded successfully")
            except TimeoutException:
                raise FormLoadError(
                    "First question not visible within timeout - form may not have loaded correctly",
                    form_type=self.form_type,
                )

            return True

        except FormLoadError:
            raise
        except Exception as e:
            raise FormLoadError(f"Unexpected error opening form: {e}", form_type=self.form_type)

    @staticmethod
    def _clean_question_text(text: str) -> str:
        """
        Remove question number prefix from question text.

        Args:
            text: Raw question text (e.g., "1.\\nSubmission ID")

        Returns:
            Cleaned question text without number prefix (e.g., "Submission ID")
        """
        # Remove patterns like "1.\n", "10.\n", "1. ", etc.
        cleaned = re.sub(r"^\d+\.\s*", "", text)
        return cleaned.strip()

    def _get_question_text(self, question_num: int) -> Optional[str]:
        """
        Extract question text for a specific question number.

        Args:
            question_num: The question number to extract

        Returns:
            Question text or None if not found
        """
        try:
            # Try multiple selectors to find question text
            selectors = [
                f"xpath:(//div[@data-automation-id='questionItem'])[{question_num}]//div[@data-automation-id='questionTitle']",
                f"xpath:(//div[@data-automation-id='questionItem'])[{question_num}]//span[@role='heading']",
                f"xpath:(//div[@data-automation-id='questionItem'])[{question_num}]//div[contains(@class, 'questionText')]",
                f"xpath:(//div[@data-automation-id='questionItem'])[{question_num}]//label",
            ]

            for selector in selectors:
                try:
                    element = self.browser.find_element(selector)
                    if element:
                        text = self.browser.get_text(selector)
                        if text and text.strip():
                            # Clean the question text to remove number prefix
                            return self._clean_question_text(text.strip())
                except Exception:
                    continue

            return None

        except Exception as e:
            logger.debug(f"Error getting question text for Q#{question_num}: {e}")
            return None

    def _get_question_type(self, question_num: int) -> str:
        """
        Determine the type of question (text, radio, dropdown, checkbox, date, etc.)

        Args:
            question_num: The question number to analyze

        Returns:
            Question type as string
        """
        try:
            # Check for checkboxes FIRST (most specific check)
            checkbox_selectors = [
                f"xpath:(//div[@data-automation-id='questionItem'])[{question_num}]//input[@type='checkbox']",
                f"xpath:(//div[@data-automation-id='questionItem'])[{question_num}]//div[@data-automation-id='choiceItem']//input[@type='checkbox']",
                f"xpath:(//div[@data-automation-id='questionItem'])[{question_num}]//div[@role='checkbox']",
            ]
            for selector in checkbox_selectors:
                if self._element_exists(selector):
                    logger.debug(f"Q#{question_num}: Detected as checkbox using selector: {selector}")
                    return "checkbox"

            # Check for radio buttons (specific input type check)
            radio_selectors = [
                f"xpath:(//div[@data-automation-id='questionItem'])[{question_num}]//input[@type='radio']",
                f"xpath:(//div[@data-automation-id='questionItem'])[{question_num}]//div[@data-automation-id='choiceItem']//input[@type='radio']",
                f"xpath:(//div[@data-automation-id='questionItem'])[{question_num}]//div[@role='radio']",
            ]
            for selector in radio_selectors:
                if self._element_exists(selector):
                    logger.debug(f"Q#{question_num}: Detected as radio button using selector: {selector}")
                    return "radio"

            # Check for dropdown
            dropdown_triggers = self.config["selectors"]["dropdown"]["triggers"]
            for trigger_template in dropdown_triggers:
                trigger = trigger_template.format(question_num=question_num)
                if self._element_exists(trigger):
                    logger.debug(f"Q#{question_num}: Detected as dropdown")
                    return "dropdown"

            # Check for text/textarea (check this AFTER radio/checkbox to avoid false positives)
            text_selectors = self.config["selectors"]["text_fields"]
            for selector_template in text_selectors:
                selector = selector_template.format(question_num=question_num)
                if self._element_exists(selector):
                    element = self.browser.find_element(selector)
                    tag_name = element.tag_name if element else ""
                    if tag_name == "textarea":
                        return "textarea"
                    return "text"

            # Check for datepicker
            date_selectors = self.config["selectors"]["datepicker"]["inputs"]
            for selector_template in date_selectors:
                selector = selector_template.format(question_num=question_num)
                if self._element_exists(selector):
                    return "date"

            # Check for file upload
            file_selector = f"xpath:(//div[@data-automation-id='questionItem'])[{question_num}]//input[@type='file']"
            if self._element_exists(file_selector):
                return "file"

            return "unknown"

        except Exception as e:
            logger.debug(f"Error determining question type for Q#{question_num}: {e}")
            return "unknown"

    def _get_question_options(self, question_num: int, question_type: str) -> List[str]:
        """
        Extract available options for choice-based questions (radio, checkbox, dropdown).

        Args:
            question_num: The question number
            question_type: Type of the question

        Returns:
            List of option texts
        """
        options = []

        try:
            if question_type in ["radio", "checkbox"]:
                # Get all choice items in the question
                choice_selector = f"xpath:(//div[@data-automation-id='questionItem'])[{question_num}]//div[@data-automation-id='choiceItem']"
                try:
                    elements = self.browser.find_elements(choice_selector)
                    for elem in elements:
                        try:
                            # Try to get text from the choice item
                            text_selector = f"xpath:(//div[@data-automation-id='questionItem'])[{question_num}]//div[@data-automation-id='choiceItem']//span[@data-automation-id='choiceText']"
                            text_elements = self.browser.find_elements(text_selector)
                            for text_elem in text_elements:
                                text = self.browser.get_text(text_elem)
                                if text and text.strip() and text.strip() not in options:
                                    options.append(text.strip())
                        except Exception:
                            continue
                except Exception:
                    pass

                # Alternative: get labels
                if not options:
                    label_selector = f"xpath:(//div[@data-automation-id='questionItem'])[{question_num}]//label"
                    try:
                        elements = self.browser.find_elements(label_selector)
                        for elem in elements:
                            text = self.browser.get_text(elem)
                            if text and text.strip() and text.strip() not in options:
                                options.append(text.strip())
                    except Exception:
                        pass

            elif question_type == "dropdown":
                # Click dropdown to reveal options
                dropdown_triggers = self.config["selectors"]["dropdown"]["triggers"]
                clicked = False

                for trigger_template in dropdown_triggers:
                    if clicked:
                        break
                    trigger = trigger_template.format(question_num=question_num)
                    try:
                        if self._element_exists(trigger):
                            self.browser.click_element(trigger)
                            time.sleep(1)
                            clicked = True
                            break
                    except Exception:
                        continue

                if clicked:
                    # Get all dropdown options
                    option_selectors = [
                        "xpath://div[@role='option']",
                        "xpath://button[@role='option']",
                        "xpath://li[@role='option']",
                    ]

                    for selector in option_selectors:
                        try:
                            elements = self.browser.find_elements(selector)
                            for elem in elements:
                                text = self.browser.get_text(elem)
                                if text and text.strip() and text.strip() not in options:
                                    options.append(text.strip())
                        except Exception:
                            continue

                    # Click away to close dropdown
                    try:
                        self.browser.click_element("xpath://body")
                        time.sleep(0.5)
                    except Exception:
                        pass

        except Exception as e:
            logger.debug(f"Error getting options for Q#{question_num}: {e}")

        return options

    def _element_exists(self, selector: str) -> bool:
        """
        Check if an element exists without throwing exceptions.

        Args:
            selector: Selenium selector

        Returns:
            True if element exists, False otherwise
        """
        try:
            element = self.browser.find_element(selector)
            return element is not None
        except Exception:
            return False

    def _count_visible_questions(self) -> int:
        """
        Count the number of currently visible questions on the form.

        Returns:
            Number of visible questions
        """
        try:
            question_selector = "xpath://div[@data-automation-id='questionItem']"
            elements = self.browser.find_elements(question_selector)
            return len(elements) if elements else 0
        except Exception:
            return 0

    def _scroll_to_bottom(self):
        """Scroll to the bottom of the page to load any lazy-loaded questions."""
        try:
            self.browser.execute_javascript("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(self.config["wait_times"]["after_scroll"])
        except Exception as e:
            logger.debug(f"Error scrolling: {e}")

    def _select_option(self, question_num: int, question_type: str, option_value: str) -> bool:
        """
        Select a specific option for a question to trigger conditional questions.

        Args:
            question_num: The question number
            question_type: Type of the question
            option_value: The option value to select

        Returns:
            True if selection successful, False otherwise
        """
        try:
            if question_type == "radio":
                # Try to click radio button
                radio_selectors = self.config["selectors"]["radio"]
                for selector_template in radio_selectors:
                    selector = selector_template.format(question_num=question_num, value=option_value)
                    try:
                        if self._element_exists(selector):
                            self.browser.click_element(selector)
                            time.sleep(self.config["wait_times"]["new_questions_appear"])
                            return True
                    except Exception:
                        continue

            elif question_type == "dropdown":
                # Click dropdown trigger
                dropdown_triggers = self.config["selectors"]["dropdown"]["triggers"]
                clicked = False

                for trigger_template in dropdown_triggers:
                    if clicked:
                        break
                    trigger = trigger_template.format(question_num=question_num)
                    try:
                        if self._element_exists(trigger):
                            self.browser.click_element(trigger)
                            time.sleep(self.config["wait_times"]["dropdown_open"])
                            clicked = True
                            break
                    except Exception:
                        continue

                if clicked:
                    # Select the option
                    option_selectors = self.config["selectors"]["dropdown"]["options"]
                    for selector_template in option_selectors:
                        selector = selector_template.format(value=option_value, value_short=option_value[:20])
                        try:
                            if self._element_exists(selector):
                                self.browser.click_element(selector)
                                time.sleep(self.config["wait_times"]["new_questions_appear"])
                                return True
                        except Exception:
                            continue

            elif question_type == "checkbox":
                # Click checkbox
                checkbox_selectors = self.config["selectors"]["checkbox"]
                for selector_template in checkbox_selectors:
                    selector = selector_template.format(
                        question_num=question_num, value=option_value, value_partial=option_value[:30]
                    )
                    try:
                        if self._element_exists(selector):
                            self.browser.click_element(selector)
                            time.sleep(self.config["wait_times"]["new_questions_appear"])
                            return True
                    except Exception:
                        continue

            return False

        except Exception as e:
            logger.debug(f"Error selecting option for Q#{question_num}: {e}")
            return False

    def _extract_current_questions(self) -> Dict[int, Dict[str, Any]]:
        """
        Extract all currently visible questions from the form.

        Returns:
            Dictionary mapping question numbers to question details
        """
        questions = {}

        # Scroll to make sure all questions are loaded
        self._scroll_to_bottom()

        num_questions = self._count_visible_questions()
        logger.info(f"Found {num_questions} visible questions")

        for i in range(1, num_questions + 1):
            question_text = self._get_question_text(i)
            if not question_text:
                logger.debug(f"Q#{i}: No question text found, skipping")
                continue

            logger.debug(f"Q#{i}: Extracting question - {question_text[:80]}...")

            question_type = self._get_question_type(i)
            logger.debug(f"Q#{i}: Type = {question_type}")
            options = []

            if question_type in ["radio", "checkbox", "dropdown"]:
                options = self._get_question_options(i, question_type)
                logger.debug(f"Q#{i}: Found {len(options)} options")
                for idx, option in enumerate(options, 1):
                    logger.debug(f"Q#{i}: Option {idx}: {option}")

            questions[i] = {
                "question_number": i,
                "question_text": question_text,
                "question_type": question_type,
                "options": options,
                "has_conditional_logic": question_type in ["radio", "dropdown"]
                and len(options) > 0,  # Radio buttons and dropdowns can trigger conditional questions
            }

            # Also track by text to identify unique questions
            self.all_questions_by_text[question_text] = questions[i]

            logger.debug(f"Q#{i}: Successfully extracted")

        return questions

    def _replay_selection_path(self, selection_path: List[tuple]) -> bool:
        """
        Replay a sequence of selections to reach a specific form state.

        Args:
            selection_path: List of (question_num, question_type, option_value) tuples

        Returns:
            True if all selections were successful
        """
        for qnum, qtype, option in selection_path:
            logger.debug(f"Replaying: Q#{qnum} select '{option[:30]}...'")
            if not self._select_option(qnum, qtype, option):
                logger.warning(f"Failed to replay selection: Q#{qnum} - {option[:30]}...")
                return False
            time.sleep(1)  # Brief wait between selections
        return True

    def _get_visible_question_ids(self) -> Set[str]:
        """
        Get a set of unique identifiers for currently visible questions.
        Uses question text as identifier to detect truly new questions.

        Returns:
            Set of question text identifiers
        """
        visible_ids = set()
        num_questions = self._count_visible_questions()

        for i in range(1, num_questions + 1):
            question_text = self._get_question_text(i)
            if question_text:
                visible_ids.add(question_text)

        return visible_ids

    def _explore_forward_traversal(self, max_options_per_question: int = 10):
        """
        Efficiently explore the form using forward-only traversal.

        This method:
        1. Extracts all currently visible questions
        2. For each radio/dropdown question, tries each option
        3. Detects if new questions appear after selection
        4. If new questions appear, extracts them and continues forward
        5. Uses a set to track unique questions by text

        This is much faster than the reload-and-replay approach.

        Args:
            max_options_per_question: Maximum number of options to test per question
        """
        logger.info("Starting forward traversal exploration")

        # Track which question indices we've already processed
        processed_question_indices = set()
        iteration = 0
        max_iterations = 100  # Safety limit

        while iteration < max_iterations:
            iteration += 1
            logger.debug(f"\n=== Iteration {iteration} ===")

            # Get current state
            self._scroll_to_bottom()
            current_questions = self._extract_current_questions()

            if not current_questions:
                logger.info("No more questions found, exploration complete")
                break

            # Track baseline question set
            baseline_questions = self._get_visible_question_ids()
            baseline_count = len(baseline_questions)
            logger.debug(f"Current unique questions: {baseline_count}")

            # Find the first unprocessed question with options that might trigger conditional logic
            found_question_to_explore = False

            for qnum in sorted(current_questions.keys()):
                qdata = current_questions[qnum]

                # Skip if already processed
                if qnum in processed_question_indices:
                    continue

                # Only explore radio and dropdown questions
                if qdata["question_type"] not in ["radio", "dropdown"]:
                    processed_question_indices.add(qnum)
                    continue

                if not qdata["options"] or len(qdata["options"]) == 0:
                    processed_question_indices.add(qnum)
                    continue

                found_question_to_explore = True
                options_to_test = qdata["options"][:max_options_per_question]
                question_type_label = "Radio" if qdata["question_type"] == "radio" else "Dropdown"

                logger.debug(f"\nExploring Q#{qnum} ({question_type_label}): {qdata['question_text'][:60]}...")
                logger.debug(f"  Testing up to {len(options_to_test)} options")

                # Try each option and detect if new questions appear
                option_revealed_new_questions = False

                for idx, option in enumerate(options_to_test, 1):
                    logger.debug(f"  Testing option {idx}/{len(options_to_test)}: '{option[:40]}...'")

                    # Select the option
                    if self._select_option(qnum, qdata["question_type"], option):
                        # Check if new questions appeared
                        time.sleep(self.config["wait_times"]["new_questions_appear"])
                        self._scroll_to_bottom()

                        new_questions = self._get_visible_question_ids()
                        new_count = len(new_questions)

                        if new_count > baseline_count:
                            # New questions appeared!
                            newly_appeared = new_questions - baseline_questions
                            logger.debug(f"Option '{option[:40]}...' revealed {len(newly_appeared)} NEW questions!")

                            # Extract the new questions
                            updated_questions = self._extract_current_questions()

                            # Update baseline for subsequent options
                            baseline_questions = new_questions
                            baseline_count = new_count
                            option_revealed_new_questions = True

                            # Continue exploring from this new state
                            # (the outer while loop will pick up new questions)
                        else:
                            logger.debug("  - No new questions from this option")
                            # If first option doesn't reveal new questions, skip remaining options
                            if idx == 1:
                                logger.debug(
                                    f"  → Skipping remaining {len(options_to_test) - 1} options (no conditional logic detected)"
                                )
                                break
                    else:
                        logger.debug("  - Failed to select option")
                        # If we couldn't even select the first option, try one more
                        if idx < 2:
                            continue
                        else:
                            break

                # Mark this question as processed
                processed_question_indices.add(qnum)

                # If any option revealed new questions, break to re-scan from the top
                if option_revealed_new_questions:
                    logger.debug("New questions found, re-scanning form...")
                    break

            # If we didn't find any question to explore, we're done
            if not found_question_to_explore:
                logger.info("No more questions with options to explore")
                break

        if iteration >= max_iterations:
            logger.warning(f"Reached max iterations ({max_iterations}), stopping exploration")

        logger.info(f"Forward traversal complete after {iteration} iterations")

    def extract_all_questions(
        self, use_conditional_exploration: bool = True, max_depth: int = 5, max_options: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Extract all questions from the form, including conditional questions.

        Args:
            use_conditional_exploration: Whether to explore conditional paths (slower but complete)
            max_depth: Maximum depth for conditional exploration (default: 5, deprecated for forward traversal)
            max_options: Maximum radio options to test per question (default: 10)

        Returns:
            List of all discovered questions
        """
        logger.info(f"Starting question extraction for form: {self.form_type}")
        logger.info(f"Conditional exploration: {'enabled' if use_conditional_exploration else 'disabled'}")
        if use_conditional_exploration:
            logger.info(f"Max options per question: {max_options}")

        try:
            # Open the form
            try:
                if not self._open_form():
                    raise FormLoadError("Failed to open form", form_type=self.form_type)
            except FormLoadError:
                raise
            except WebDriverException as e:
                logger.exception("Browser error during form opening")
                raise FormLoadError(f"Browser automation error: {str(e)}", form_type=self.form_type)
            except Exception as e:
                logger.exception("Unexpected error opening form")
                raise FormLoadError(f"Unexpected error opening form: {e}", form_type=self.form_type)

            if use_conditional_exploration:
                # Use efficient forward traversal (stays on same browser session)
                try:
                    self._explore_forward_traversal(max_options_per_question=max_options)
                except TimeoutException as e:
                    logger.exception("Timeout during conditional exploration")
                    raise ConditionalExplorationError(f"Browser timeout during exploration: {str(e)}")
                except (NoSuchElementException, StaleElementReferenceException) as e:
                    logger.exception("Element error during conditional exploration")
                    raise ConditionalExplorationError(f"Form element error during exploration: {str(e)}")
                except WebDriverException as e:
                    logger.exception("Browser error during conditional exploration")
                    raise ConditionalExplorationError(f"Browser automation error: {str(e)}")
                except ConditionalExplorationError:
                    raise
                except Exception as e:
                    logger.exception("Unexpected error during conditional exploration")
                    raise ConditionalExplorationError(f"Failed during conditional exploration: {e}")
            else:
                # Just extract visible questions
                try:
                    self.discovered_questions = self._extract_current_questions()
                except (NoSuchElementException, StaleElementReferenceException) as e:
                    logger.exception("Element error extracting questions")
                    raise QuestionScraperError(f"Form element error: {str(e)}")
                except WebDriverException as e:
                    logger.exception("Browser error extracting questions")
                    raise QuestionScraperError(f"Browser automation error: {str(e)}")
                except QuestionScraperError:
                    raise
                except Exception as e:
                    logger.exception("Unexpected error extracting questions")
                    raise QuestionScraperError(f"Failed to extract questions: {e}")

            # Convert all unique questions (by text) to a sorted list
            all_questions = list(self.all_questions_by_text.values())

            # Sort by question number if available, otherwise by text
            all_questions.sort(key=lambda q: (q.get("question_number", 999), q["question_text"]))

            # Re-number questions sequentially
            for idx, question in enumerate(all_questions, 1):
                question["question_number"] = idx

            return all_questions

        except (FormLoadError, QuestionScraperError, ConditionalExplorationError):
            raise
        except Exception as e:
            logger.exception("Unexpected error during question extraction")
            raise QuestionScraperError(f"Failed to extract questions: {e}")

        finally:
            self.close_browser()

    def close_browser(self):
        """Close the browser and cleanup."""
        try:
            if self.browser:
                self.browser.close_browser()
                self.browser = None
        except Exception as e:
            logger.debug(f"Error closing browser: {e}")
