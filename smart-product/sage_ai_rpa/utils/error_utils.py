"""
Common error handling utilities for service layer.

Provides reusable exception handling for database and unexpected errors.
"""

import logging
import json
from pathlib import Path
from sqlalchemy.exc import OperationalError, SQLAlchemyError
from selenium.common.exceptions import (
    WebDriverException,
    TimeoutException,
    NoSuchElementException,
    StaleElementReferenceException,
    ElementNotInteractableException,
)

logger = logging.getLogger(__name__)


def handle_service_exception(exc: Exception, error_class, context: str) -> None:
    """
    Handle common service exceptions and convert them to service-specific errors.

    This function inspects the exception type and raises an appropriate service error
    with proper status codes and messages.

    Args:
        exc: The exception that was caught.
        error_class: The service-specific exception class to raise.
        context: A description of the operation being performed (for logging).

    Raises:
        error_class: Always raises with appropriate error details based on exception type.
    """
    if isinstance(exc, OperationalError):
        # Database connection/operational issues
        logger.exception("Database connection error in %s", context)
        raise error_class(
            error="Service Unavailable",
            message="Database is temporarily unavailable. Please try again later.",
            status_code=503,
        )
    if isinstance(exc, SQLAlchemyError):
        # Other database errors (integrity, query issues, etc.)
        logger.exception("Database error in %s", context)
        raise error_class(
            error="Database Error",
            message=f"Unable to {context}",
            status_code=500,
        )
    if isinstance(exc, TimeoutException):
        # Selenium timeout errors
        logger.exception("Browser timeout error in %s", context)
        raise error_class(
            error="Browser Timeout",
            message=f"Browser operation timed out while {context}. Please try again.",
            status_code=504,
        )
    if isinstance(exc, (NoSuchElementException, StaleElementReferenceException)):
        # Selenium element not found or stale
        logger.exception("Browser element error in %s", context)
        raise error_class(
            error="Browser Element Error",
            message=f"Unable to locate or interact with form element while {context}",
            status_code=500,
        )
    if isinstance(exc, ElementNotInteractableException):
        # Selenium element not interactable
        logger.exception("Browser interaction error in %s", context)
        raise error_class(
            error="Browser Interaction Error",
            message=f"Form element not interactable while {context}",
            status_code=500,
        )
    if isinstance(exc, WebDriverException):
        # Other Selenium/browser errors
        logger.exception("Browser automation error in %s", context)
        raise error_class(
            error="Browser Automation Error",
            message=f"Browser automation failed while {context}. Please try again.",
            status_code=503,
        )
    if isinstance(exc, FileNotFoundError):
        # File not found errors
        logger.exception("File not found in %s", context)
        raise error_class(
            error="Configuration Error",
            message=f"Required file not found while {context}",
            status_code=500,
        )
    if isinstance(exc, json.JSONDecodeError):
        # JSON parsing errors
        logger.exception("JSON decode error in %s", context)
        raise error_class(
            error="Configuration Error",
            message=f"Invalid JSON format while {context}",
            status_code=500,
        )
    if isinstance(exc, (IOError, OSError)):
        # File I/O errors
        logger.exception("I/O error in %s", context)
        raise error_class(
            error="I/O Error",
            message=f"File operation failed while {context}",
            status_code=500,
        )
    if isinstance(exc, (ValueError, TypeError)):
        # Data validation/conversion errors
        logger.exception("Data validation error in %s", context)
        raise error_class(
            error="Validation Error",
            message=f"Invalid data provided for {context}",
            status_code=400,
        )
    if isinstance(exc, KeyError):
        # Missing key in dictionary
        logger.exception("Missing key error in %s", context)
        raise error_class(
            error="Configuration Error",
            message=f"Required configuration key missing while {context}",
            status_code=500,
        )
    # Unexpected errors
    logger.exception("Unexpected error in %s: %s", context, str(exc))
    raise error_class(
        error="Internal Server Error",
        message=f"An unexpected error occurred while trying to {context}",
        status_code=500,
    )
