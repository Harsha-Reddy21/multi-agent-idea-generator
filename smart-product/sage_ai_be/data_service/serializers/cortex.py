"""
Cortex API Serializers
======================
Request/Response models for Cortex API endpoints
"""

from typing import Any, Optional
from uuid import UUID

from pydantic import Field

from data_service.serializers.base import BaseSerializer


class DocumentExtractionResponse(BaseSerializer):
    """Response model for document extraction endpoint."""

    question_id: str = Field(..., description="Question ID (e.g., 'S-Q1', 'AI-Q3')")
    extracted_content: Any = Field(
        ..., description="Extracted content blocks from the document"
    )
    submission_id: str = Field(..., description="UUID of the submission")
    form_id: str = Field(..., description="UUID of the form")
    created_at: str = Field(
        ..., description="ISO format timestamp when extraction was created"
    )
    updated_at: str = Field(
        ..., description="ISO format timestamp when extraction was last updated"
    )
    interaction_id: Optional[UUID] = Field(
        None, description="AI interaction ID for feedback tracking"
    )
