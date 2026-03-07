"""Serializers for AI interaction feature.

Defines request and response Pydantic models used by the AI interaction
API endpoints.
"""

from uuid import UUID
from typing import Dict

from pydantic import BaseModel, Field


class UpdateInteractionRequest(BaseModel):
    """Request model for updating AI interaction acceptance status"""

    interactions: Dict[UUID, bool] = Field(
        ...,
        description="Dictionary mapping interaction IDs to their acceptance status",
        example={
            "123e4567-e89b-12d3-a456-426614174000": True,
            "223e4567-e89b-12d3-a456-426614174001": False,
        },
    )


class UpdateInteractionResponse(BaseModel):
    """Response model for AI interaction update"""

    updated_count: int
    message: str


class ErrorResponse(BaseModel):
    """Standard error response payload for AI interaction endpoints."""

    error: str = Field(..., example="Not Found")
    message: str = Field(..., example="AI interaction not found")
    status_code: int = Field(..., example=404)
