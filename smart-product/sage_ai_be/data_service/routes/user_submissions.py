"""
Routes for user submission management and status tracking.

This module provides FastAPI endpoints for retrieving user submissions,
tracking submission status, and managing submission-related operations.
"""

import logging
from fastapi import APIRouter, Depends, Header, Query
from sqlalchemy.ext.asyncio import AsyncSession

from data_service.db_connection.db import get_db
from data_service.serializers.user_submissions import (
    SubmissionsListResponse,
    ErrorResponse,
    SubmissionStatusResponse,
)
from data_service.service.user_submissions import get_user_submissions_service

logger = logging.getLogger(__name__)

user_submissions_router = APIRouter(tags=["Form API's"])


@user_submissions_router.get(
    "/get-user-submissions",
    response_model=SubmissionsListResponse,
    responses={
        401: {
            "model": ErrorResponse,
            "description": "Unauthorized - Missing or invalid authentication header",
        },
        500: {"model": ErrorResponse, "description": "Internal server error"},
        503: {
            "model": ErrorResponse,
            "description": "Service Unavailable - Database temporarily unavailable",
        },
    },
    summary="Get user submissions",
    description="Returns a list of submitted ideas by the logged in user.",
)
async def get_user_submissions(
    db: AsyncSession = Depends(get_db),
    x_webauth_email: str = Header(..., alias="X-WEBAUTH-EMAIL"),
):
    """
    Get all submissions made by the logged in user.
    Returns an empty data list if no submissions exist.
    """
    user_submissions_service = get_user_submissions_service(db)
    return await user_submissions_service.get_user_submissions(x_webauth_email)


@user_submissions_router.get(
    "/submission-status",
    response_model=SubmissionStatusResponse,
    responses={
        400: {
            "model": ErrorResponse,
            "description": "Bad Request - Invalid submission ID format",
        },
        401: {
            "model": ErrorResponse,
            "description": "Unauthorized - Missing or invalid authentication header",
        },
        500: {"model": ErrorResponse, "description": "Internal server error"},
        503: {
            "model": ErrorResponse,
            "description": "Service Unavailable - Database temporarily unavailable",
        },
    },
    summary="Get submission processing status",
    description="Retrieves the current status of document extraction "
    "for a submission. Used for polling during background processing.",
)
async def get_submission_status(
    submission_id: str = Query(
        ..., alias="submission-id", description="UUID of the submission"
    ),
    db: AsyncSession = Depends(get_db),
    x_webauth_email: str = Header(..., alias="X-WEBAUTH-EMAIL"),
):
    """
    Get the current processing status for a submission's document extraction.

    This endpoint is designed for polling by the frontend to track the progress
    of background document extraction.

    Args:
        submission_id: UUID of the submission (query parameter: submission-id)
        x_webauth_email: User email from X-WEBAUTH-EMAIL header (required)
        db: Database session dependency

    Returns:
        {
            "submission_id": "...",
            "status": "PROCESSING",
            "message": "[BACKGROUND] Processing 2 document(s)...",
            "created_at": "2025-11-16T10:30:00",
            "updated_at": "2025-11-16T10:30:15"
        }

    Status values:
        - PENDING: Documents queued for processing
        - PROCESSING: Extraction in progress
        - COMPLETED: Extraction finished successfully
        - FAILED: Extraction encountered an error
    """
    user_submissions_service = get_user_submissions_service(db)
    return await user_submissions_service.get_submission_status(
        submission_id=submission_id, x_webauth_email=x_webauth_email
    )
