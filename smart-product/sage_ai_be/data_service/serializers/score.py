"""Pydantic serializers for scoring requests and responses."""

from typing import Optional, Literal, List
from uuid import UUID

from pydantic import Field
from data_service.serializers.base import BaseSerializer


class FormDataEntry(BaseSerializer):
    """Single form data entry containing question and answers."""

    questionId: str
    question: str
    answer: List[str]
    ai_meta_data: Optional[str] = None
    type: str


class ScoreRequest(BaseSerializer):
    """Request model for scoring operations."""

    submission_id: UUID
    lambda_strict: Optional[float] = None
    missing_policy: Optional[Literal["ignore_and_renorm", "zero"]] = None
    form_data: List[FormDataEntry] = Field(
        ..., description="List of question and answer data"
    )
    form_type: str


class ScoreResponse(BaseSerializer):
    """Response model for scoring results."""

    submission_id: UUID
    total_score: float


class ErrorResponse(BaseSerializer):
    """Standard error response payload for score endpoints."""

    error: str
    message: str
    status_code: int
