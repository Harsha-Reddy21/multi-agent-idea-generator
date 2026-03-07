"""
ServiceNow Routes Module
=========================
API endpoints for ServiceNow approved ideas operations.
"""

import logging

from fastapi import APIRouter, Query

from data_service.serializers.service_now import (
    ApprovedIdeasDashboardResponse,
    ErrorResponse,
)
from data_service.service.service_now import service_now_service

logger = logging.getLogger(__name__)

service_now_router = APIRouter(prefix="/service-now", tags=["ServiceNow"])


@service_now_router.get(
    "/approved-ideas-dashboard",
    response_model=ApprovedIdeasDashboardResponse,
    responses={
        400: {
            "model": ErrorResponse,
            "description": "Bad Request - Invalid query parameters",
        },
        500: {
            "model": ErrorResponse,
            "description": "Internal Server Error - System error occurred",
        },
        503: {
            "model": ErrorResponse,
            "description": "Service Unavailable - ServiceNow API temporarily unavailable",
        },
        504: {
            "model": ErrorResponse,
            "description": "Gateway Timeout - ServiceNow API request timed out",
        },
    },
    summary="Get approved ideas dashboard data",
    description="Returns combined dashboard data including count and top approved AI systems.",
)
async def get_approved_ideas_dashboard(
    days: int = Query(
        default=30, ge=1, le=365, description="Number of days for count (1-365)"
    ),
    limit: int = Query(
        default=2, ge=1, le=10, description="Number of top ideas to return (1-10)"
    ),
):
    """
    Get complete dashboard data for approved AI systems.

    Combines two queries:
    1. Count of approved ideas in the last N days
    2. Top M approved ideas with user details

    Args:
        days: Number of days to look back for count (default: 30, range: 1-365)
        limit: Number of top ideas to return (default: 2, range: 1-10)

    Returns:
        ApprovedIdeasDashboardResponse: Contains count and list of top ideas

    Example:
        GET /api/service-now/approved-ideas-dashboard?days=30&limit=2
    """
    return await service_now_service.get_approved_ideas_dashboard(
        days=days, top_limit=limit
    )
