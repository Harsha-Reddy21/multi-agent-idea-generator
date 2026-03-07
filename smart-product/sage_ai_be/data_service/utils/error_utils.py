"""
Common error handling utilities for service layer.

Provides reusable exception handling for database and unexpected errors.
"""

import logging
import httpx
import requests
from sqlalchemy.exc import OperationalError, SQLAlchemyError
from botocore.exceptions import (
    ClientError,
    NoCredentialsError,
    PartialCredentialsError,
    EndpointConnectionError,
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
    if isinstance(exc, (ValueError, TypeError)):
        # Data validation/conversion errors
        logger.exception("Data validation error in %s", context)
        raise error_class(
            error="Validation Error",
            message=f"Invalid data format while {context}",
            status_code=400,
        )
    if isinstance(exc, httpx.HTTPStatusError):
        # HTTP error responses (4xx, 5xx)
        status_code = exc.response.status_code
        logger.exception(
            "HTTP %s error in %s: %s", status_code, context, exc.response.text
        )

        # Map HTTP status codes to appropriate error messages
        if status_code == 401:
            raise error_class(
                error="Unauthorized",
                message="Authentication failed for external service.",
                status_code=401,
            )
        if status_code == 403:
            raise error_class(
                error="Forbidden",
                message="Access denied to external service.",
                status_code=403,
            )
        if status_code == 404:
            raise error_class(
                error="Not Found",
                message=f"Resource not found while {context}",
                status_code=404,
            )
        if 400 <= status_code < 500:
            raise error_class(
                error="Bad Request",
                message=f"Invalid request while {context}",
                status_code=400,
            )
        # 5xx errors
        raise error_class(
            error="Service Unavailable",
            message="External service is experiencing issues. Please try again later.",
            status_code=503,
        )
    if isinstance(exc, httpx.TimeoutException):
        # API timeout errors
        logger.exception("Timeout error in %s", context)
        raise error_class(
            error="Gateway Timeout",
            message="External service request timed out. Please try again.",
            status_code=504,
        )
    if isinstance(exc, (httpx.RequestError, requests.RequestException)):
        # External API/network errors
        logger.exception("Network/API error in %s", context)
        raise error_class(
            error="Service Unavailable",
            message="Unable to connect to external service. Please try again later.",
            status_code=503,
        )
    if isinstance(exc, (NoCredentialsError, PartialCredentialsError)):
        # AWS credentials errors
        logger.exception("AWS credentials error in %s", context)
        raise error_class(
            error="Authentication Error",
            message="AWS credentials not found or incomplete",
            status_code=401,
        )
    if isinstance(exc, EndpointConnectionError):
        # AWS S3 endpoint connection errors
        logger.exception("S3 endpoint connection error in %s", context)
        raise error_class(
            error="Connection Error",
            message="Unable to connect to S3 service",
            status_code=503,
        )
    if isinstance(exc, ClientError):
        # AWS S3 client errors (403, 404, etc.)
        error_code = exc.response.get("Error", {}).get("Code", "Unknown")
        logger.exception("S3 ClientError in %s: %s", context, error_code)

        if error_code in ["403", "AccessDenied"]:
            raise error_class(
                error="Access Denied",
                message=f"Access denied while {context}",
                status_code=403,
            )
        if error_code in ["404", "NoSuchBucket", "NoSuchKey"]:
            raise error_class(
                error="Not Found",
                message=f"Resource not found while {context}",
                status_code=404,
            )
        raise error_class(
            error="S3 Error",
            message=f"S3 operation failed while {context}",
            status_code=503,
        )
    # Unexpected errors
    logger.exception("Unexpected error in %s", context)
    raise error_class(
        error="Internal Server Error",
        message=f"An unexpected error occurred while {context}",
        status_code=500,
    )
