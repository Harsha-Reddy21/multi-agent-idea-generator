"""
Scoring API Endpoints.

This module provides REST API endpoints for scoring form submissions
based on weighted questions, mandatory requirements, and AI-generated
suggestion coverage analysis.

Example:
    POST /score/scoring
    {
        "submission_id": "sub_123",
        "form_type": "work_form",
        "form_data": [...]
    }
"""

import logging

from fastapi import APIRouter, Body, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from data_service.configurations.settings import Settings, get_settings
from data_service.db_connection.db import get_db
from data_service.serializers.score import (
    ErrorResponse,
    ScoreRequest,
    ScoreResponse,
)
from data_service.service.scoring_service import get_scoring_service


logger = logging.getLogger(__name__)

score_router = APIRouter(prefix="/score", tags=["Confidence Score"])


@score_router.post(
    "/scoring",
    response_model=ScoreResponse,
    responses={
        400: {
            "model": ErrorResponse,
            "description": "Bad Request",
        },
        500: {
            "model": ErrorResponse,
            "description": "Internal server error",
        },
    },
    summary="Review user submission and give a score",
    description="Review user submission and give a score",
)
async def score_form(
    input_data: ScoreRequest = Body(...),
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> ScoreResponse:
    """
    Calculate and return confidence score for user form submission.

    Processes form submission data through the scoring service to generate
    a confidence score based on weighted questions, mandatory requirements,
    and AI-generated suggestion coverage analysis.

    Args:
        input_data: Score request containing submission data and form information
        db: Async database session for data persistence operations
        settings: Application settings with scoring configuration parameters

    Returns:
        ScoreResponse with submission_id and calculated total_score

    Raises:
        ScoringServiceError: For all scoring-related errors (handled by global handler)
    """
    scoring_service = get_scoring_service(db=db, settings=settings)
    return await scoring_service.calculate_score(input_data)
