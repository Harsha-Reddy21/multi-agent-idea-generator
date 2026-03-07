"""
Service-specific exception classes.
"""

from .base import ServiceError


class FormAutomationServiceError(ServiceError):
    """
    Exception raised for errors in the form automation service.

    Used for business logic errors such as:
    - Queue job validation errors
    - Form data retrieval errors
    - Database errors during RPA processing
    - Browser automation failures
    - Unexpected errors in form automation operations
    """
