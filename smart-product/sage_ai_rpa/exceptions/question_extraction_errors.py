"""
Custom exceptions for question extraction and comparison operations.
"""

from .base import ServiceError


class QuestionExtractionError(ServiceError):
    """
    Base exception for all question extraction related errors.

    Used for errors during:
    - Question scraping from MS Forms
    - Conditional question exploration
    - Question text extraction
    - Browser automation during extraction
    """

    def __init__(self, message: str, error: str = "Question Extraction Error", status_code: int = 500):
        super().__init__(error=error, message=message, status_code=status_code)


class FormLoadError(QuestionExtractionError):
    """
    Exception raised when the form cannot be loaded or accessed.

    Examples:
    - Form URL is invalid or inaccessible
    - Browser fails to open the form
    - Network timeout loading the form
    - Form requires authentication
    """

    def __init__(self, message: str, form_type: str = None):
        self.form_type = form_type
        error_msg = "Failed to load form"
        if form_type:
            error_msg += f" '{form_type}'"
        error_msg += f": {message}"
        super().__init__(message=error_msg, error="Form Load Error", status_code=503)


class QuestionScraperError(QuestionExtractionError):
    """
    Exception raised for errors during question scraping.

    Examples:
    - Element selectors not found
    - Question text extraction failed
    - Question type detection failed
    - Options extraction failed
    """

    def __init__(self, message: str, question_number: int = None):
        self.question_number = question_number
        error_msg = message
        if question_number:
            error_msg = f"Question #{question_number}: {message}"
        super().__init__(message=error_msg, error="Question Scraper Error")


class ConditionalExplorationError(QuestionExtractionError):
    """
    Exception raised during conditional question exploration.

    Examples:
    - Failed to select option to trigger conditional questions
    - Failed to detect new conditional questions
    - Maximum depth/iterations reached
    - State tracking errors
    """

    def __init__(self, message: str, question_number: int = None, option_value: str = None):
        self.question_number = question_number
        self.option_value = option_value
        error_msg = message
        if question_number:
            error_msg = f"Q#{question_number}"
            if option_value:
                error_msg += f" (option: '{option_value[:30]}...')"
            error_msg += f": {message}"
        super().__init__(message=error_msg, error="Conditional Exploration Error")


class QuestionComparisonError(ServiceError):
    """
    Exception raised for errors during question comparison operations.

    Examples:
    - JSON file not found or invalid
    - Form type not found in JSON
    - Comparison logic errors
    - Invalid question format
    """

    def __init__(self, message: str, form_type: str = None, status_code: int = 500):
        self.form_type = form_type
        error_msg = message
        if form_type:
            error_msg = f"Form '{form_type}': {message}"
        super().__init__(error="Question Comparison Error", message=error_msg, status_code=status_code)


class EmailNotificationError(ServiceError):
    """
    Exception raised when email notification fails.

    Examples:
    - Email configuration missing or invalid
    - Failed to send email
    - Email template rendering error
    """

    def __init__(self, message: str, recipient: str = None):
        self.recipient = recipient
        error_msg = message
        if recipient:
            error_msg = f"Failed to send email to '{recipient}': {message}"
        super().__init__(error="Email Notification Error", message=error_msg, status_code=500)


class ConfigurationError(ServiceError):
    """
    Exception raised for configuration-related errors.

    Examples:
    - RPA config file not found
    - Invalid JSON in config file
    - Required configuration missing
    - Invalid form type specified
    """

    def __init__(self, message: str, config_path: str = None):
        self.config_path = config_path
        error_msg = message
        if config_path:
            error_msg = f"Config '{config_path}': {message}"
        super().__init__(error="Configuration Error", message=error_msg, status_code=500)
