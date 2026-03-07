"""
AI Feedback API Routes
======================
Handles AI feedback submission endpoints
"""

import logging
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from data_service.db_connection.db import get_db
from data_service.serializers.ai_feedback import (
    CreateAIFeedbackRequest,
    CreateAIFeedbackResponse,
    FeedbackData,
)
from data_service.serializers.forms import ErrorResponse
from data_service.service.ai_feedback import AIFeedbackService
from data_service.models.users import Users
from data_service.utils.auth import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post(
    "/ai-feedback",
    response_model=CreateAIFeedbackResponse,
    status_code=201,
    tags=["AI Feedback"],
    responses={
        201: {
            "description": "Feedback created successfully",
            "model": CreateAIFeedbackResponse,
        },
        400: {
            "description": "Bad Request - Invalid input data",
            "model": ErrorResponse,
        },
        401: {
            "description": "Unauthorized - Missing or invalid authentication",
            "model": ErrorResponse,
        },
        404: {
            "description": "Not Found - Submission or Question not found",
            "model": ErrorResponse,
        },
        409: {
            "description": "Conflict - Duplicate feedback for interaction",
            "model": ErrorResponse,
        },
        500: {"description": "Internal Server Error", "model": ErrorResponse},
    },
)
async def create_ai_feedback(
    request: CreateAIFeedbackRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Users = Depends(get_current_user),  # pylint: disable=unused-argument
):
    """
    Find existing AI interaction and create feedback for it

    Backend creates interactions automatically when AI generates content.
    Frontend uses this endpoint to submit feedback for those interactions.

    Lookup logic:
    - Finds interaction by: submission_id + question_id + ai_feature_type (+ optional form_id)
    - Updates is_accepted field if provided
    - Creates new feedback record linked to the interaction
    - Multiple feedbacks can be created for the same interaction

    Args:
        request: Feedback creation request
        db: Database session dependency
        current_user: Current authenticated user from X-WEBAUTH-EMAIL header

    Returns:
        CreateAIFeedbackResponse: Updated interaction record and new feedback record

    Raises:
        401: Unauthorized - Missing or invalid authentication
        404: AI interaction not found (BE must create it first when AI generates content)
        500: Database error
    """
    service = AIFeedbackService(db)

    _, feedback = await service.create_feedback(
        x_webauth_email=current_user.email,
        is_accepted=request.is_accepted,
        feedback_type=request.feedback_type.value if request.feedback_type else None,
        feedback_tags=request.feedback_tags,
        user_comment=request.user_comment,
        interaction_id=request.interaction_id,
    )

    return CreateAIFeedbackResponse(
        message="success" if feedback else "fail",
        data=FeedbackData(feedback_id=feedback.id if feedback else None),
    )
