"""Serializers for text enhancement service requests and responses."""

from typing import List, Optional, Any
from uuid import UUID

from pydantic import Field

from data_service.serializers.base import BaseSerializer


class FormDataEntry(BaseSerializer):
    """Individual form data entry model"""

    questionId: str
    question: str
    answer: List[str]


class EnhanceRequest(BaseSerializer):  # pylint: disable=R0903
    """Request model for text enhancement operations."""

    question_id: str = Field(..., example="q_12345")
    submission_id: Optional[str] = None
    form_id: Optional[str] = None
    user_text: str = Field(
        ..., example="We will use AI to make things better and faster."
    )
    form_data: Optional[List[FormDataEntry]] = None


class EnhanceResponse(BaseSerializer):
    """Response model for text enhancement operations."""

    question_id: str = Field(..., example="q_12345")
    original_text: str
    reviewed_text: Any
    rationale: Optional[str] = None
    interaction_id: Optional[UUID] = None


class ErrorResponse(BaseSerializer):  # pylint: disable=R0903
    """Response model for error information."""

    error: str
    message: str
    status_code: int
