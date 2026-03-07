"""
Common validation utilities for service layer.

Provides reusable validation functions for authentication, UUIDs, and other common checks.
"""

import logging
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from data_service.models.users import Users

logger = logging.getLogger(__name__)


def validate_auth_header(x_webauth_email: str, error_class) -> None:
    """
    Validate the X-WEBAUTH-EMAIL authentication header.

    Args:
        x_webauth_email: The email address from the authentication header.
        error_class: The exception class to raise on validation failure.

    Raises:
        error_class: If the email is missing or invalid.
    """
    if (
        not x_webauth_email
        or not isinstance(x_webauth_email, str)
        or "@" not in x_webauth_email
    ):
        logger.warning("Missing or invalid authentication header")
        raise error_class(
            error="Unauthorized",
            message="X-WEBAUTH-EMAIL header is required",
            status_code=401,
        )


def validate_uuid_format(value: str, field_name: str, error_class) -> UUID:
    """
    Validate that a string is a valid UUID format.

    Args:
        value: The string value to validate.
        field_name: The name of the field being validated (for error messages).
        error_class: The exception class to raise on validation failure.

    Returns:
        UUID: The validated UUID object.

    Raises:
        error_class: If the value is not a valid UUID format.
    """
    try:
        return UUID(value)
    except (ValueError, TypeError) as exc:
        logger.warning("Invalid %s format: %s", field_name, value)
        raise error_class(
            error="Validation Error",
            message=f"{field_name} is not valid",
            status_code=400,
        ) from exc


async def validate_and_get_user(x_webauth_email: str, db: AsyncSession, error_class):
    """
    Validate authentication and fetch the user from the database.

    This combines authentication header validation and user lookup into a single operation.

    Args:
        x_webauth_email: The email address from the authentication header.
        db: The database session.
        error_class: The exception class to raise on validation failure.

    Returns:
        User: The user object from the database.

    Raises:
        error_class: If the email is invalid or user is not found.
    """
    # Validate the authentication header
    validate_auth_header(x_webauth_email, error_class)

    # Look up the user by email (case-insensitive)
    user_result = await db.execute(
        select(Users).where(Users.email == x_webauth_email.lower())
    )
    user = user_result.scalars().first()

    if not user:
        logger.warning("User not found: %s", x_webauth_email)
        raise error_class(
            error="Unauthorized",
            message="User not found",
            status_code=401,
        )

    return user
