"""
Suggestions Models
Pydantic models for suggestion requests and responses
"""

from typing import List

from pydantic import BaseModel


class ErrorResponse(BaseModel):
    """Response model for error information."""

    error: str
    message: str
    status_code: int


class SuggestionsFormType(BaseModel):
    """Model for form type suggestions data."""

    question_id: str
    suggestions: List[str]


class FormTypeSuggestionsResponse(BaseModel):
    """Response model for form type suggestions."""

    form_type: str
    data: List[SuggestionsFormType]
