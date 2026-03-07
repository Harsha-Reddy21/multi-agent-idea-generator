"""Routes for enhancing answer text using AI services.

This module provides FastAPI endpoints for improving and enhancing user-submitted
answers through various text enhancement services.
"""

import logging

from fastapi import APIRouter, Body, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from data_service.configurations.settings import Settings, get_settings
from data_service.db_connection.db import get_db
from data_service.exceptions.service_errors import EnhanceAnswerServiceError
from data_service.serializers.enhance_answer import (
    EnhanceRequest,
    EnhanceResponse,
    ErrorResponse,
)
from data_service.service.enhance_answer import enhance_text_service

logger = logging.getLogger(__name__)

enhance_answer_router = APIRouter()


@enhance_answer_router.post(
    "/enhance-answer",
    tags=["AI API"],
    response_model=EnhanceResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Bad Request"},
        500: {"model": ErrorResponse, "description": "Internal server error"},
    },
    summary="Enhance user text using AI",
    description="Enhances the submitted user text and returns an AI-generated enhancement.",
)
async def enhance_answer(
    input_data: EnhanceRequest = Body(...),
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> EnhanceResponse:
    """
    Enhance user text using AI.

    Args:
        input_data: Enhancement request with question_id and user_text
        db: Database session dependency
        settings: Application settings dependency

    Returns:
        EnhanceResponse: Enhanced text result

    Raises:
        HTTPException: For validation errors and service failures
    """
    try:
        logger.info(
            "Received enhance request for question_id: %s",
            input_data.question_id,
        )

        if not input_data.question_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="question_id is required",
            )

        response = await enhance_text_service(input_data, db, settings)
        return response

    except EnhanceAnswerServiceError as e:
        logger.error("Service error: %s", e.message)
        raise HTTPException(status_code=e.status_code, detail=e.message) from e
    except Exception as e:
        logger.exception("Unexpected error in enhance_answer endpoint")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}",
        ) from e
