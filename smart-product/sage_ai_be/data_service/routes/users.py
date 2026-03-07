"""
Routes for user management and information retrieval.

This module provides FastAPI endpoints for accessing user information,
managing user data, and handling user-related operations.
"""

import logging
from fastapi import APIRouter, Depends, Header
from sqlalchemy.ext.asyncio import AsyncSession

from data_service.db_connection.db import get_db
from data_service.serializers.users import UserInfoResponse, ErrorResponse
from data_service.service.users import get_users_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/users", tags=["User"])


@router.get(
    "/user_info",
    response_model=UserInfoResponse,
    responses={
        400: {
            "model": ErrorResponse,
            "description": "Invalid request - validation error",
        },
        401: {
            "model": ErrorResponse,
            "description": "Unauthorized - Missing or invalid authentication header",
        },
        500: {"model": ErrorResponse, "description": "Internal server error"},
        503: {
            "model": ErrorResponse,
            "description": "Service unavailable - Database temporarily unavailable",
        },
    },
)
async def get_user_info(
    x_user_email: str = Header(..., alias="X-WEBAUTH-EMAIL"),
    x_user_name: str = Header(None, alias="X-USER-NAME"),
    x_user_department: str = Header(None, alias="X-USER-DEPARTMENT"),
    x_user_title: str = Header(None, alias="X-USER-TITLE"),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve user information based on authentication headers."""
    users_service = get_users_service(db)
    return await users_service.get_user_info(
        x_user_email=x_user_email,
        x_user_name=x_user_name,
        x_user_department=x_user_department,
        x_user_title=x_user_title,
    )
