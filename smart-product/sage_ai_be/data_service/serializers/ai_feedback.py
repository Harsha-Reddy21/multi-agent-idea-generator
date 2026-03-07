"""
AI Feedback Serializers
=======================
Request/Response models for AI feedback endpoints
"""

from datetime import datetime
from enum import Enum
from typing import Optional, List, Dict, Any
from uuid import UUID

from pydantic import Field, ConfigDict

from data_service.serializers.base import BaseSerializer


class AIFeatureType(str, Enum):
    """AI feature types"""

    SUGGESTIONS = "suggestions"
    ENHANCE_ANSWER = "enhance_answer"
    DATA_EXTRACT = "data_extracts"
    CHECK_COVERAGE = "check_coverage"


class FeedbackType(str, Enum):
    """Feedback types"""

    LIKE = "like"
    DISLIKE = "dislike"


class CreateAIFeedbackRequest(BaseSerializer):
    """Request model for creating AI feedback."""

    # submission_id: UUID = Field(..., description="Submission ID")
    # question_id: str = Field(..., description="Question ID")
    # form_id: Optional[UUID] = Field(
    #     None, description="Form ID (optional, for additional filtering)"
    # )
    interaction_id: str = Field(..., description="Interaction ID")
    is_accepted: Optional[bool] = Field(
        None, description="Whether user accepted/used the AI suggestion"
    )
    feedback_type: Optional[FeedbackType] = Field(None, description="Like or dislike")
    feedback_tags: Optional[List[str]] = Field(None, description="Feedback tags")
    user_comment: Optional[str] = Field(None, description="User's comment")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                # "submission_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
                # "question_id": "q_12345",
                # "form_id": "1a2b3c4d-5678-90ab-cdef-1234567890ab",
                "interaction_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
                "is_accepted": True,
                "feedback_type": "like",
                "feedback_tags": ["Relevant", "Accurate"],
                "user_comment": "These suggestions were very helpful!",
            }
        },
    )


class AIInteractionResponse(BaseSerializer):  # pylint: disable=R0903
    """Response model for AI interaction containing identifiers and timestamps."""

    id: UUID
    submission_id: UUID
    question_id: str
    form_id: Optional[UUID]
    user_input: Optional[str]
    ai_feature_type: str
    ai_generated_content: Dict[str, Any]
    is_accepted: Optional[bool]
    created_at: datetime


class AIFeedbackResponse(BaseSerializer):  # pylint: disable=R0903
    """Response model for AI feedback details and metadata."""

    id: UUID
    interaction_id: UUID
    feedback_type: str
    feedback_tags: Optional[List[str]]
    user_comment: Optional[str]
    created_at: datetime
    updated_at: datetime


class FeedbackData(BaseSerializer):  # pylint: disable=R0903
    """Data object containing feedback ID."""

    feedback_id: Optional[UUID] = Field(None, description="ID of the created feedback")


class CreateAIFeedbackResponse(BaseSerializer):  # pylint: disable=R0903
    """Simple response for feedback creation."""

    message: str = Field(..., description="Success or failure message")
    data: FeedbackData = Field(..., description="Feedback data")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "message": "success",
                "data": {"feedback_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"},
            }
        },
    )


class ErrorResponse(BaseSerializer):  # pylint: disable=R0903
    """Standard error response for AI feedback endpoints."""

    error: str
    message: str
    status_code: int
