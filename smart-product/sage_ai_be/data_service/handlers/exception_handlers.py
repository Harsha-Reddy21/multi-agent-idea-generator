"""
Global exception handlers for FastAPI application.
"""

import logging
from fastapi import Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from data_service.exceptions import ServiceError
from data_service.serializers.forms import ErrorResponse

logger = logging.getLogger(__name__)


async def service_error_handler(_request: Request, exc: ServiceError) -> JSONResponse:
    """
    Handle all service-level custom exceptions.

    Service layer has already logged the error with full context.
    This handler just converts the exception to a standardized HTTP response.
    """
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            error=exc.error,
            message=exc.message,
            status_code=exc.status_code,
        ).dict(),
    )


async def unhandled_exception_handler(
    request: Request, _exc: Exception
) -> JSONResponse:
    """
    Catch-all handler for unexpected exceptions.

    This should rarely be triggered if service layers properly handle their errors.
    """
    logger.exception("Unhandled exception in %s %s", request.method, request.url.path)

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=ErrorResponse(
            error="Internal Server Error",
            message="An unexpected error occurred. Please try again later.",
            status_code=500,
        ).dict(),
    )


async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    """
    Handle Pydantic validation errors (422).

    Converts FastAPI's detailed validation errors into our standard ErrorResponse format.
    This provides a consistent API response structure for all error types.
    """
    # Extract first validation error for the message
    first_error = exc.errors()[0] if exc.errors() else {}
    field_path = " -> ".join(str(loc) for loc in first_error.get("loc", []))
    error_msg = first_error.get("msg", "Validation error")

    # Construct user-friendly message
    message = (
        f"Validation error in {field_path}: {error_msg}" if field_path else error_msg
    )

    logger.warning(
        "Validation error in %s %s: %s",
        request.method,
        request.url.path,
        message,
    )

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=ErrorResponse(
            error="Validation Error",
            message=message,
            status_code=422,
        ).dict(),
    )


def register_exception_handlers(app):
    """
    Register all exception handlers with the FastAPI application.

    Call this function in main.py after creating the FastAPI app instance.
    """
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(ServiceError, service_error_handler)
    app.add_exception_handler(Exception, unhandled_exception_handler)
