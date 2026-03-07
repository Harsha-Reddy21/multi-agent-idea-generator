"""
Cortex API Routes
API endpoints for Cortex API model operations.
"""

from fastapi import APIRouter, HTTPException, status, Depends, Header, Query
from sqlalchemy.ext.asyncio import AsyncSession
from data_service.clients.cortex_client import cortex_client
from data_service.db_connection.db import get_db
from data_service.service.doc_extract_service import doc_extraction_service
from data_service.serializers.cortex import DocumentExtractionResponse

cortex_router = APIRouter(prefix="/cortex", tags=["Cortex"])


@cortex_router.get("/model-classes")
async def get_cortex_model_classes(is_admin: bool = False):
    """Get model classes from Cortex API"""
    result = cortex_client.get_model_classes(is_admin=is_admin)

    if isinstance(result, dict) and "error" in result:
        error_msg = result["error"]
        if "500" in error_msg:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=error_msg
            )
        if "401" in error_msg or "invalid token" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail=error_msg
            )
        if "403" in error_msg:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=error_msg)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=error_msg
        )

    return result


@cortex_router.get(
    "/get-doc-extracts",
    response_model=DocumentExtractionResponse,
    responses={
        202: {
            "description": "Accepted - Document processing is pending or in progress"
        },
        400: {
            "description": "Invalid request - validation error, processing failed, "
            "or resource not found"
        },
        401: {"description": "Unauthorized - Missing or invalid authentication header"},
        404: {
            "description": "Not Found - Processing status or extraction data not found"
        },
        500: {"description": "Internal server error"},
        503: {"description": "Service unavailable - Database temporarily unavailable"},
    },
)
async def get_doc_extracts(
    submission_id: str = Query(
        ..., alias="submission-id", description="UUID of the submission"
    ),
    form_id: str = Query(
        ..., alias="form-id", description="UUID of the form (SubmissionForms.id)"
    ),
    question_id: str = Query(
        ...,
        alias="question-id",
        description="Question ID (e.g., 'S-Q1', 'D-Q3', 'AI-Q1')",
    ),
    db: AsyncSession = Depends(get_db),
    x_webauth_email: str = Header(..., alias="X-WEBAUTH-EMAIL"),
) -> DocumentExtractionResponse:
    """
    Retrieve extraction data for a specific question from a specific form

    This endpoint first checks if document processing is complete before returning
    the extracted data. If processing is still in progress, it returns a 202 status.

    Args:
        submission_id: UUID of the submission (query parameter: submission-id)
        form_id: UUID of the form (query parameter: form-id)
        question_id: Question ID (e.g., 'S-Q1', 'D-Q3', 'AI-Q1')
        db: Database session
        x_webauth_email: Email header used for user authentication
    """
    return await doc_extraction_service.get_question_extraction(
        submission_id=submission_id,
        form_id=form_id,
        question_id=question_id,
        db=db,
        x_webauth_email=x_webauth_email,
    )
