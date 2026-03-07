"""
Progress Streaming Routes
==========================
Server-Sent Events (SSE) endpoints for real-time extraction progress
"""

import logging

from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from data_service.db_connection.db import get_db
from data_service.models.submissions import Submissions
from data_service.models.users import Users
from data_service.utils.sse_progress_tracker import sse_progress_tracker

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/progress", tags=["Progress Streaming"])


@router.get("/stream/{submission_id}")
async def stream_extraction_progress(
    submission_id: str,
    email: str = Query(...),
    db: AsyncSession = Depends(get_db),
):
    """
    Stream real-time extraction progress using Server-Sent Events (SSE)
    Use this endpoint to receive live updates on document extraction progress.

    Args:
        submission_id: UUID of the submission to monitor
        email: User's email address (query parameter)
        db: Database session

    Returns:
        StreamingResponse with SSE data
    """
    try:
        logger.info("Email id: %s", email)
        if not email or "@" not in email:
            raise HTTPException(status_code=401, detail="Authentication required.")

        # Query with JOIN to get both submission and user data
        result = await db.execute(
            select(Submissions, Users)
            .join(Users, Submissions.submitter_id == Users.id)
            .where(Submissions.id == submission_id, Users.email == email)
        )

        row = result.first()

        if not row:
            raise HTTPException(status_code=404, detail="Submission not found")

        logger.info("Starting SSE stream for submission %s", submission_id)

        # Create the response with proper SSE headers
        response = StreamingResponse(
            sse_progress_tracker.subscribe(submission_id),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache, no-transform",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",  # Disable nginx buffering
                "Access-Control-Allow-Origin": "*",  # CORS for SSE
            },
        )

        logger.info("SSE StreamingResponse created for %s", submission_id)
        return response

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error setting up SSE stream for %s", submission_id)
        raise HTTPException(status_code=500, detail=str(e)) from e
