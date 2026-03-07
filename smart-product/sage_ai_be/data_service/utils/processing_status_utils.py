"""
Processing Status Utility Functions
Provides shared utilities for managing submission processing status tracking.
"""

import logging
from typing import List, Dict, Any
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from data_service.constants.constants import ProcessingStatus
from data_service.models.form_extractions import FormExtractions
from data_service.models.form_schemas import FormSchemas
from data_service.models.submission_forms import SubmissionForms
from data_service.models.submission_processing_status import SubmissionProcessingStatus

logger = logging.getLogger(__name__)


async def update_processing_status(
    db: AsyncSession, submission_id: UUID, status: ProcessingStatus, message: str
) -> None:
    """
    Update or create processing status record

    Args:
        db: Database session
        submission_id: Submission ID
        status: New status value (ProcessingStatus enum)
        message: User-friendly status message (sent to frontend)
    """
    try:
        tracking = await db.get(SubmissionProcessingStatus, submission_id)

        if tracking:
            tracking.status = status
            tracking.message = message
            logger.info(
                "Updated processing status to %s for submission %s",
                status.value,
                submission_id,
            )
        else:
            tracking = SubmissionProcessingStatus(
                submission_id=submission_id, status=status, message=message
            )
            db.add(tracking)
            logger.warning(
                "Created missing tracking record for submission %s", submission_id
            )

        await db.commit()

    except Exception:
        logger.exception("Failed to update processing status for %s", submission_id)
        await db.rollback()
        raise


async def store_form_extractions(
    db: AsyncSession,
    submission_id: UUID,
    form_schemas: List[FormSchemas],
    submission_forms: List[SubmissionForms],
    form_jsons: Dict[str, Dict[str, Any]],
) -> tuple[int, int]:
    """
    Store extracted data in FormExtractions table

    Args:
        db: Database session
        submission_id: Submission ID
        form_schemas: Form schemas for the category
        submission_forms: Submission form instances
        form_jsons: Extracted data keyed by form schema name

    Returns:
        tuple: (stored_count, failed_count)
    """
    try:
        form_schema_to_instance_map = {
            str(instance.form_schema_id): instance.id for instance in submission_forms
        }

        stored_count = 0
        failed_count = 0

        for form_schema in form_schemas:
            try:
                extracted_data = form_jsons.get(form_schema.name, {})

                if not extracted_data:
                    logger.warning(
                        "No extracted data for form schema %s. Storing empty JSON.",
                        form_schema.name,
                    )

                submission_form_id = form_schema_to_instance_map.get(
                    str(form_schema.id)
                )

                if not submission_form_id:
                    logger.error(
                        "No submission_form found for form_schema_id %s", form_schema.id
                    )
                    failed_count += 1
                    continue

                extraction = FormExtractions(
                    submission_id=submission_id,
                    form_id=submission_form_id,
                    extracted_data=extracted_data,
                )

                db.add(extraction)
                stored_count += 1

                logger.info(
                    "Prepared extraction for %s, %d questions",
                    form_schema.name,
                    len(extracted_data),
                )

            except (KeyError, ValueError, TypeError, AttributeError) as e:
                logger.error(
                    "Failed to prepare extraction for %s: %s", form_schema.name, str(e)
                )
                failed_count += 1
                continue

        await db.commit()

        logger.info(
            "Stored %s extractions, %s failed for submission %s",
            stored_count,
            failed_count,
            submission_id,
        )

        if stored_count == 0:
            raise ValueError("Failed to store any extractions")

        return stored_count, failed_count

    except Exception:
        logger.exception("Failed to store form extractions")
        await db.rollback()
        raise
