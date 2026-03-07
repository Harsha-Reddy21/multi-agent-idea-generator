"""
Suggestions API Routes
Handles form field suggestion endpoints based on question context.
"""

import logging

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession


from data_service.db_connection.db import get_db
from data_service.serializers.suggestions import (
    ErrorResponse,
    FormTypeSuggestionsResponse,
)
from data_service.service.suggestions import SuggestionsService

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get(
    "/suggestions",
    response_model=FormTypeSuggestionsResponse,
    responses={
        400: {
            "model": ErrorResponse,
            "description": "Bad Request - Invalid form_type parameter",
        },
        500: {
            "model": ErrorResponse,
            "description": "Internal Server Error - Database or system error",
        },
        503: {
            "model": ErrorResponse,
            "description": "Service Unavailable - Database temporarily unavailable",
        },
    },
    tags=["AI API"],
    summary="Get suggestions by form type",
    description="Retrieves all questions and their suggestions for a given form_type.",
)
async def get_suggestions_by_form_type(
    form_type: str, db: AsyncSession = Depends(get_db)
):
    """
    Get all questions and their suggestions for a given form_type.

    Args:
        form_type (str): The form type to filter suggestions.
        db (AsyncSession): Database session.

    Returns:
        FormTypeSuggestionsResponse: All questions and suggestions for the form_type.
    """
    service = SuggestionsService(db)
    suggestions = await service.get_suggestions_by_form_type(form_type)
    return FormTypeSuggestionsResponse(form_type=form_type, data=suggestions)
