"""Utility functions for creating submission records and initializing blank forms."""

import logging
from typing import Optional, Dict, Any

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from data_service.models.form_schemas import FormSchemas
from data_service.models.submission_forms import SubmissionForms
from data_service.models.submissions import Submissions

logger = logging.getLogger(__name__)


async def create_submission_with_forms(
    db: AsyncSession,
    user_id: str,
    category_id: str,
    form_schemas: list[FormSchemas],
    description: str = "",
    status: str = "draft",
    form_data: Optional[Dict[str, Any]] = None,
) -> dict:
    """Create a submission and initialize blank submission forms."""
    if not category_id:
        raise HTTPException(status_code=400, detail="No category_id provided.")

    new_submission = Submissions(
        title="",
        description=description,
        status=status,
        submission_journey=form_data or {},
        submitter_id=user_id,
        category_id=category_id,
    )
    db.add(new_submission)
    await db.flush()

    submission_form_ids: list[str] = []
    for schema in form_schemas:
        new_submission_form = SubmissionForms(
            submission_id=new_submission.id,
            form_schema_id=schema.id,
            form_type=schema.name,
            form_data={},
            status="not_started",
        )
        db.add(new_submission_form)
        submission_form_ids.append(new_submission_form.id)
    await db.commit()
    return {
        "submission_id": new_submission.id,
        "submission_form_ids": submission_form_ids,
        "category_id": category_id,
        "message": (
            "Submission created with submission_journey. "
            "All forms created as blank with status 'not_started'."
        ),
    }
