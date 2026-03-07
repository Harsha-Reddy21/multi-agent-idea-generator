"""
Routes for form dashboard data retrieval and management.

Provides endpoints for accessing form dashboard information including form
statistics, submission counts, and related dashboard metrics.
"""

import logging
from typing import Optional

from fastapi import APIRouter, Depends, Query, Header

from data_service.db_connection.db import get_db
from data_service.serializers.forms import (
    FormDashboardList,
    ErrorResponse,
)
from data_service.service.form_dashboard import get_form_dashboard_service

logger = logging.getLogger(__name__)

form_dashboard_router = APIRouter(tags=["Form API's"])


@form_dashboard_router.get(
    "/form-dashboard",
    response_model=FormDashboardList,
    responses={
        400: {
            "model": ErrorResponse,
            "description": "Invalid request - validation error or resource not found",
        },
        401: {
            "model": ErrorResponse,
            "description": "Unauthorized - Missing or invalid authentication header",
        },
        500: {"model": ErrorResponse, "description": "Internal server error"},
    },
    summary="Get dashboard form data and status by submission id",
    description="Returns all form data and their statuses for the form dashboard.",
)
async def get_form_dashboard(
    submission_id: str = Query(
        ...,
        alias="submission-id",
        description="The ID of the submission to filter forms by",
    ),
    x_webauth_email: Optional[str] = Header(None, alias="X-WEBAUTH-EMAIL"),
    db=Depends(get_db),
):
    """Return form data and statuses filtered by submission id."""
    dashboard_service = get_form_dashboard_service(db)
    return await dashboard_service.get_form_dashboard_data(
        submission_id=submission_id,
        x_webauth_email=x_webauth_email,
    )
