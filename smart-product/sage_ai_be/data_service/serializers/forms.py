"""
Serializers for form-related data structures.

This module contains Pydantic models for serializing form data,
form schemas, submissions, and related form operations.
"""

from datetime import datetime
from typing import Any, Optional, List, Dict
from uuid import UUID
from pydantic import Field

from data_service.constants.constants import FormAction
from data_service.serializers.base import BaseSerializer


class FormDashboardSummary(BaseSerializer):
    """Model for form dashboard summary information."""

    id: str = Field(..., example="3d0e14f0-ceb3-4b55-9dc3-43db00ec7f8a")
    submission_id: str = Field(
        ..., alias="submission-id", example="3d0e14f0-ceb3-4b55-9dc3-43db00ec7f8a"
    )
    category_id: str = Field(..., alias="category-id", example="cat-001")
    status: str = Field(..., example="in-progress")
    form_type: str = Field(..., alias="form-type", example="general-idea")
    category: str = Field(
        ...,
        example="recommended",
        description="Form category based on rules: recommended or optional",
    )
    final_score: Optional[float] = Field(
        None,
        alias="final-score",
        example=85.5,
        description="Final score for the submission",
    )


class FormDashboardList(BaseSerializer):
    """Response wrapper containing dashboard list data and message."""

    message: str = Field(..., example="Forms fetched successfully")
    data: List[FormDashboardSummary]
    novelty_score: Optional[float] = Field(
        None,
        alias="novelty-score",
        example=0.85,
        description="FAISS similarity score for novelty assessment",
    )


class FormSerializer(BaseSerializer):
    """Serialized form instance details."""

    id: UUID
    submission_id: UUID
    form_schema_id: UUID
    form_type: str
    form_data: Any
    status: str
    final_score: Optional[float] = None
    submitted_at: Optional[datetime] = None
    files: Optional[Dict[str, List[str]]] = None


class FormResponse(BaseSerializer):
    """Top-level response containing a single form payload."""

    message: str = Field(..., example="Success Message")
    data: FormSerializer


class ErrorResponse(BaseSerializer):
    """Standard error response payload for form endpoints."""

    error: str = Field(..., example="Validation Error")
    message: str = Field(..., example="submission id is not valid")
    status_code: int = Field(..., example=400)


class QuestionData(BaseSerializer):
    """Model representing a single question and its answer set."""

    questionId: str = Field(alias="questionId")
    question: str
    answer: List[str]
    ai_meta_data: Optional[str] = Field(default=None, alias="ai_meta_data")
    type: str


class FormDataWrapper(BaseSerializer):
    """Wrapper for form data list to align with request shape."""

    form_data: List[QuestionData]


class SubmitFormRequest(BaseSerializer):
    """Request model for submitting or saving form data."""

    form_data: FormDataWrapper
    action: FormAction  # Uses enum for type safety and validation


class FormSummary(BaseSerializer):
    """Summary subset of form details returned after submit."""

    id: str
    submission_id: str
    status: str


class SubmitFormResponse(BaseSerializer):
    """Response for submit/save form operations containing status."""

    message: str
    data: FormSummary
