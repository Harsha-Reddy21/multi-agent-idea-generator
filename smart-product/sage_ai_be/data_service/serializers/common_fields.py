"""
Common field definitions and shared serializers.

This module contains Pydantic models and field definitions that are shared
across multiple serializers to ensure consistency in API requests and responses.
"""

from typing import List
from uuid import UUID

from pydantic import Field

from data_service.serializers.base import BaseSerializer


class CommonFieldsRequest(BaseSerializer):  # pylint: disable=R0903
    """Common fields used in various form-related requests."""

    form_type: str = Field(..., example="AI Registry")
    submission_id: UUID = Field(..., example="b3b7c8e2-8c1a-4e2a-9c1a-123456789abc")
    form_id: UUID = Field(..., example="a1b2c3d4-5678-90ab-cdef-1234567890ab")


class SourceField(BaseSerializer):  # pylint: disable=R0903
    """Information about a source field that contributed to a common field."""

    question_id: str = Field(..., example="S1-Q1")
    question: str = Field(
        ...,
        example="What is the source question?",
        description="The source question text",
    )
    answer: str = Field(..., example="Source answer")
    priority: int = Field(..., example=1, description="Priority order of this source")
    form_type: str = Field(
        ...,
        example="idea-sub-form",
        description="The form type where this source question exists",
    )


class CommonFieldItem(BaseSerializer):  # pylint: disable=R0903
    """Single common field item containing the question id and its answer."""

    question_id: str = Field(..., example="AI-Q1")
    question: str = Field(
        ..., example="What is your question?", description="The question text"
    )
    answer: str = Field(..., example="")
    multi_source: bool = Field(
        default=False,
        example=False,
        description="True if this field was populated from multiple source mappings (many-to-one)",
    )
    source_fields: List[SourceField] = Field(
        default_factory=list,
        description=(
            "List of source fields that contributed to this answer "
            "(only for multi-source fields)"
        ),
    )


class CommonFieldsResponse(BaseSerializer):  # pylint: disable=R0903
    """Response wrapper containing a list of common field items."""

    common_fields: List[CommonFieldItem]
