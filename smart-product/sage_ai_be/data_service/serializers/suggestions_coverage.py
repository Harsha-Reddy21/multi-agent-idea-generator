"""Serializers for suggestions coverage feature.

Defines request and response Pydantic models used by the suggestions
coverage API endpoints.
"""

from uuid import UUID
from typing import List, Optional

from pydantic import BaseModel, Field


class CheckSuggestionsCoverageRequest(BaseModel):
    """Request model to check suggestions coverage for a question/user text."""

    submission_id: UUID
    question_id: str
    user_text: str


class SuggestionItem(BaseModel):
    """Single suggestion item with text and supporting rationale."""

    text: str
    rationale: str


class CheckSuggestionsCoverageResponse(BaseModel):
    """Response containing lists of required and completed suggestions."""

    required_suggestions: List[SuggestionItem]
    completed_suggestions: List[SuggestionItem]
    interaction_id: Optional[UUID] = None


class ErrorResponse(BaseModel):
    """Standard error response payload for suggestions coverage endpoints."""

    error: str = Field(..., example="Validation Error")
    message: str = Field(..., example="Question or suggestions not found")
    status_code: int = Field(..., example=400)
