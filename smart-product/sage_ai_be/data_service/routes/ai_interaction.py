"""
AI Interaction API Routes Module
Handles HTTP requests for updating AI interaction acceptance status
"""

import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from data_service.db_connection.db import get_db
from data_service.service.ai_interaction_service import AIInteractionService
from data_service.exceptions.service_errors import ServiceError
from data_service.serializers.ai_interaction import (
    UpdateInteractionRequest,
    UpdateInteractionResponse,
    ErrorResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter(tags=["AI API"])


@router.patch(
    "/ai-interaction/update-acceptance",
    response_model=UpdateInteractionResponse,
    responses={
        400: {
            "model": ErrorResponse,
            "description": "Bad Request - Invalid input data",
        },
        404: {
            "model": ErrorResponse,
            "description": "AI interaction not found",
        },
        500: {
            "model": ErrorResponse,
            "description": "Internal Server Error - System error occurred",
        },
    },
    summary="Update AI interaction acceptance status",
    description="Updates whether users accepted or rejected AI-generated suggestions for multiple interactions",
)
async def update_interaction_acceptance(
    request: UpdateInteractionRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Update the acceptance status of multiple AI interactions.

    Args:
        request (UpdateInteractionRequest): Request containing dict of interaction_id to is_accepted mappings
        db (AsyncSession): Database session dependency

    Returns:
        UpdateInteractionResponse: Confirmation with count of updated interactions

    Raises:
        HTTPException: If database error occurs
    """
    try:
        service = AIInteractionService(db)
        updated_count = await service.update_interaction_acceptance(
            interactions=request.interactions,
        )

        return UpdateInteractionResponse(
            updated_count=updated_count,
            message=f"Successfully updated {updated_count} AI interaction(s)",
        )

    except ServiceError as e:
        raise HTTPException(
            status_code=e.status_code,
            detail={
                "error": e.error,
                "message": e.message,
                "status_code": e.status_code,
            },
        )
    except Exception as e:
        logger.exception("Unexpected error updating AI interaction acceptance status")
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Internal Server Error",
                "message": f"Failed to update AI interactions: {str(e)}",
                "status_code": 500,
            },
        )
