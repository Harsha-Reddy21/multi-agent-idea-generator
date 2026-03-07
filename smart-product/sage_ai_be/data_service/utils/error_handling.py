"""
Centralized error handling utilities.

This module provides standardized error handling functions for consistent
error processing and logging across the application.
"""

from typing import Any

from data_service.utils import logger as app_logger  # assuming logger module


def log_error(message: str) -> None:
    """Log an error message using application logger."""
    app_logger.logging.error(message)  # type: ignore[attr-defined]


def handle_error(error: Any) -> dict:
    """Return standardized error payload after logging."""
    log_error(str(error))
    return {"success": False, "error": str(error)}


def raise_custom_error(message: str) -> None:
    """Raise a custom error with a message (ValueError)."""
    raise ValueError(message)
