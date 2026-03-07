"""
Serializers for user submission data structures.

This module contains Pydantic models for handling user submission data,
submission lists, status responses, and related submission operations.
"""

from datetime import datetime
from typing import Optional, List

from pydantic import Field
from data_service.serializers.base import BaseSerializer


class SubmissionSummary(BaseSerializer):
    """Summary of a single submission for list endpoints."""

    id: str = Field(..., example="3d0e14f0-ceb3-4b55-9dc3-43db00ec7f8a")
    title: str = Field(..., example="My Innovation Idea")
    category_id: str = Field(..., example="cat-001")
    category_name: str = Field(..., example="Digital Risk Registry")
    status: str = Field(..., example="in-progress")
    submitted_at: Optional[datetime] = None
    ai_registry_form_status: Optional[str] = Field(None, example="completed")
    ai_registry_update_form_id: Optional[str] = Field(
        None, example="a1b2c3d4-5678-90ab-cdef-1234567890ab"
    )


class SubmissionsListResponse(BaseSerializer):
    """Response wrapper for list of submission summaries."""

    message: str = Field(..., example="Submissions fetched successfully")
    data: List[SubmissionSummary]


class ErrorResponse(BaseSerializer):
    """Standard error response payload for user submissions endpoints."""

    error: str = Field(..., example="Validation Error")
    message: str = Field(..., example="submission id is not valid")
    status_code: int = Field(..., example=400)


class SubmissionStatusResponse(BaseSerializer):
    """Status response for an individual submission including message."""

    submission_id: str = Field(..., example="3d0e14f0-ceb3-4b55-9dc3-43db00ec7f8a")
    status: str = Field(
        ...,
        example="PROCESSING",
        description="One of: PENDING, PROCESSING, COMPLETED, FAILED",
    )
    message: str = Field(
        ...,
        example="Processing your documents...",
        description="User-friendly status message",
    )
