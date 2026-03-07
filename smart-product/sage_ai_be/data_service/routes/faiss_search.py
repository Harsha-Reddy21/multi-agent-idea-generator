"""
FAISS Search API Routes
========================
API endpoints for performing similarity search using FAISS index.
"""

import logging

from fastapi import APIRouter, Depends

from sqlalchemy.ext.asyncio import AsyncSession

from data_service.serializers.faiss import SearchResult, SearchRequest
from data_service.service.faiss_service import get_faiss_service
from data_service.db_connection.db import get_db

logger = logging.getLogger(__name__)

router = APIRouter(tags=["FAISS Search"])


# API Endpoints
@router.post(
    "/faiss/search",
    response_model=SearchResult,
    summary="Perform similarity search",
    description=(
        "Search for the most similar AIR using text query. "
        "Returns single best match or null if none found."
    ),
)
async def search(
    request: SearchRequest, db: AsyncSession = Depends(get_db)
) -> SearchResult:
    """
    Perform similarity search on the FAISS index using a text query.

    Returns the AIR with the highest similarity score.
    Returns null if no match found or if the best match is below threshold.
    Persists the similarity score as novelty_score in the submissions table.

    Args:
        request: Search request with form_data, optional submission_id
        db: Database session dependency

    Returns:
        SearchResult with air_number, title, and similarity_score, or None if no match

    Raises:
        FAISSServiceError: For all FAISS-related errors (handled by global handler)
    """
    service = get_faiss_service()

    query_text = " ".join(
        entry.answer for entry in request.form_data if entry.answer.strip()
    )

    result = service.search(
        query_text=query_text,
        top_k=request.top_k if hasattr(request, "top_k") else 1,
        threshold=request.threshold if hasattr(request, "threshold") else 0.8,
    )

    if result is None:
        return None

    # Persist novelty score to submissions table via service layer
    if request.submission_id:
        await service.persist_novelty_score(
            submission_id=request.submission_id,
            similarity_score=result["similarity_score"],
            db=db,
        )
    logging.info(
        "FAISS search completed for submission_id=%s with similarity_score=%.4f",
        request.submission_id,
        result["similarity_score"],
    )

    return SearchResult(
        air_number=result["air_number"],
        title=result["title"],
        similarity_score=result["similarity_score"],
    )
