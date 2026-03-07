"""
Check Suggestions Coverage API Routes Module
Handles HTTP requests for checking suggestion coverage based on user text and question ID
"""

import logging

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from data_service.configurations.settings import Settings, get_settings
from data_service.db_connection.db import get_db
from data_service.serializers.suggestions_coverage import (
    CheckSuggestionsCoverageRequest,
    CheckSuggestionsCoverageResponse,
    SuggestionItem,
    ErrorResponse,
)
from data_service.service.suggestions_coverage import SuggestionsCoverageService

logger = logging.getLogger(__name__)

router = APIRouter(tags=["AI API"])


@router.post(
    "/check-suggestions-coverage",
    response_model=CheckSuggestionsCoverageResponse,
    responses={
        400: {
            "model": ErrorResponse,
            "description": "Bad Request - Invalid input data",
        },
        404: {
            "model": ErrorResponse,
            "description": "Question or suggestions not found",
        },
        500: {
            "model": ErrorResponse,
            "description": "Internal Server Error - System error occurred",
        },
    },
    summary="Check suggestions coverage for user text",
    description="Analyzes user text against question suggestions to "
    "determine coverage and provide recommendations",
)
async def check_suggestions_coverage(
    request: CheckSuggestionsCoverageRequest,
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_settings),
):
    """
    Check suggestions coverage for user text against question suggestions.

    Args:
        request (CheckSuggestionsCoverageRequest): Request containing question_id and user_text
        db (AsyncSession): Database session dependency
        settings (Settings): Application settings dependency

    Returns:
        CheckSuggestionsCoverageResponse: Coverage analysis with completed and required suggestions

    Raises:
        SuggestionsCoverageServiceError: For all coverage-related errors (handled by global handler)
    """
    suggestions_service = SuggestionsCoverageService(settings=settings)

    # Service handles all DB queries, analysis, and score saving
    result = await suggestions_service.check_coverage_for_question(
        question_id=request.question_id,
        user_text=request.user_text,
        submission_id=request.submission_id,
        db=db,
    )

    # Convert dict items to Pydantic models for response
    required_suggestions = [
        SuggestionItem(**item) for item in result["required_suggestions"]
    ]
    completed_suggestions = [
        SuggestionItem(**item) for item in result["completed_suggestions"]
    ]

    return CheckSuggestionsCoverageResponse(
        required_suggestions=required_suggestions,
        completed_suggestions=completed_suggestions,
        interaction_id=result.get("interaction_id"),
    )
