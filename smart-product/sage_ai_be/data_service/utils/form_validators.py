"""
Form-specific validation utilities.

Provides reusable validation functions for form-related business logic,
including ownership validation, status checks, and rule evaluation.
"""

import logging
from typing import Tuple
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from data_service.constants.constants import (
    FormStatus,
    FormType,
)
from data_service.models.ai_interactions import AIInteractions
from data_service.models.submission_forms import SubmissionForms
from data_service.models.submissions import Submissions
from data_service.models.users import Users


logger = logging.getLogger(__name__)


async def validate_submission_ownership_interaction(
    interaction_id: str,
    db: AsyncSession,
    error_class,
) -> tuple[AIInteractions, Submissions, Users]:
    """
    Validate that an AI interaction exists and return the interaction, its
    parent submission, and the submission's owner user — using a single joined
    query to avoid multiple round trips to the database.

    Args:
        interaction_id: string id (UUID string) of the AI interaction
        db: AsyncSession database session
        error_class: application-specific error class to raise on validation

    Returns:
        (interaction, submission, user)

    Raises:
        error_class when any of the entities are missing.
    """

    # Single query that joins AIInteractions -> Submissions -> Users
    query = (
        select(AIInteractions, Submissions, Users)
        .select_from(AIInteractions)
        .join(Submissions, AIInteractions.submission_id == Submissions.id)
        .join(Users, Submissions.submitter_id == Users.id)
        .where(AIInteractions.id == interaction_id)
    )

    result = await db.execute(query)
    row = result.first()

    if not row:
        # Interaction not found (or does not link to a submission/user)
        raise error_class(
            error="Validation Error",
            message=f"AI interaction with id '{interaction_id}' not found",
            status_code=400,
        )

    interaction, submission, user = row

    # Additional safety checks (shouldn't happen because of join) — keep explicit
    if not interaction:
        raise error_class(
            error="Validation Error",
            message=f"AI interaction with id '{interaction_id}' not found",
            status_code=400,
        )

    if not submission:
        raise error_class(
            error="Validation Error",
            message=f"Submission related to interaction '{interaction_id}' not found",
            status_code=400,
        )

    if not user:
        raise error_class(
            error="Validation Error",
            message=f"User for submission related to interaction '{interaction_id}' not found",
            status_code=400,
        )

    return interaction, submission, user


async def validate_submission_ownership(
    submission_id: UUID,
    db: AsyncSession,
    error_class,
    user_id: UUID = None,
) -> Submissions:
    """
    Validate that a submission exists and belongs to the specified user.

    Args:
        submission_id: UUID of the submission to validate.
        user_id: UUID of the user who should own the submission.
        db: Database session.
        error_class: Exception class to raise on validation failure.

    Returns:
        Submissions: The validated submission object.

    Raises:
        error_class: If submission doesn't exist or doesn't belong to user.
    """
    submission_result = await db.execute(
        select(Submissions).where(Submissions.id == submission_id)
    )
    submission = submission_result.scalars().first()

    if not submission:
        logger.warning("Submission not found: %s", submission_id)
        raise error_class(
            error="Validation Error",
            message="Submission not found",
            status_code=400,
        )

    if user_id and submission.submitter_id != user_id:
        logger.warning(
            "Authorization failed: user %s attempted to access submission %s owned by %s",
            user_id,
            submission_id,
            submission.submitter_id,
        )
        raise error_class(
            error="Validation Error",
            message="Submission does not belong to the user",
            status_code=400,
        )

    return submission


async def validate_form_ownership_and_status(
    form_id: UUID,
    submission_id: UUID,
    user_id: UUID,
    db: AsyncSession,
    error_class,
) -> Tuple[SubmissionForms, Submissions]:
    """
    Validate form exists, belongs to submission, and user has access.

    This is an optimized validator that fetches form, submission, and user
    in a single query to avoid N+1 issues.

    Args:
        form_id: UUID of the form to validate.
        submission_id: UUID of the submission.
        user_id: UUID of the user.
        db: Database session.
        error_class: Exception class to raise on validation failure.

    Returns:
        Tuple[SubmissionForms, Submissions]: The validated form and submission.

    Raises:
        error_class: If validation fails.
    """
    # Single query to fetch form, submission, and user
    query_result = await db.execute(
        select(SubmissionForms, Submissions, Users)
        .join(Submissions, SubmissionForms.submission_id == Submissions.id)
        .join(Users, Submissions.submitter_id == Users.id)
        .where(SubmissionForms.id == form_id)
        .where(SubmissionForms.submission_id == submission_id)
    )
    result = query_result.first()

    if not result:
        # Check what's missing for better error message
        form_check = await db.execute(
            select(SubmissionForms).where(SubmissionForms.id == form_id)
        )
        if not form_check.scalars().first():
            logger.warning("Form not found: %s", form_id)
            raise error_class(
                error="Validation Error",
                message=f"Form with ID '{form_id}' not found",
                status_code=400,
            )
        # Form exists but doesn't belong to submission
        logger.warning(
            "Form %s does not belong to submission %s", form_id, submission_id
        )
        raise error_class(
            error="Validation Error",
            message=f"Form with ID '{form_id}' does not belong to submission '{submission_id}'",
            status_code=400,
        )

    form, submission, submitter = result

    # Verify user authorization
    if submitter.id != user_id:
        logger.warning(
            "Authorization failed: user %s attempted to modify submission %s owned by %s",
            user_id,
            submission_id,
            submitter.id,
        )
        raise error_class(
            error="Unauthorized",
            message="User does not match the user who created the submission",
            status_code=401,
        )

    return form, submission


def validate_form_not_completed(
    form: SubmissionForms,
    error_class,
) -> None:
    """
    Validate that a form is not already completed.

    Args:
        form: The form to validate.
        error_class: Exception class to raise on validation failure.

    Raises:
        error_class: If the form is already completed.
    """
    if (
        form.status == FormStatus.COMPLETED
        and form.form_type != FormType.AI_REGISTRY_UPDATE
    ):
        logger.warning(
            "Cannot edit completed form: form_id=%s, submission_id=%s",
            form.id,
            form.submission_id,
        )
        raise error_class(
            error="Validation Error",
            message="Cannot edit form. Form has already been submitted and is marked as completed.",
            status_code=400,
        )


async def validate_ai_registry_update_form_allowed(
    form, submission, db: AsyncSession, error_class
):
    """
    Validate that ai-registry-update-form can only be updated
    if ai-registry-form status is COMPLETED.

    Args:
        form: The form to validate (SubmissionForms instance).
        submission: The parent submission (Submissions instance).
        db: Database session for querying.
        error_class: Exception class to raise on validation failure.

    Raises:
        error_class: If the form is ai-registry-update-form and the
            ai-registry-form is not COMPLETED.
    """
    if getattr(form, "form_type", None) == FormType.AI_REGISTRY_UPDATE:
        # Query the status of the ai-registry-form (not the update form)
        # from sage_ai_submission_forms table
        ai_registry_form_result = await db.execute(
            select(SubmissionForms.status)
            .where(SubmissionForms.submission_id == submission.id)
            .where(SubmissionForms.form_type == FormType.AI_REGISTRY)
        )
        ai_registry_form_status = ai_registry_form_result.scalar_one_or_none()

        # Only block if the ai-registry-form exists and is not completed
        # If it doesn't exist yet, allow (forms are created in pending state)
        if (
            ai_registry_form_status is not None
            and ai_registry_form_status != FormStatus.COMPLETED
        ):
            raise error_class(
                error="Dependency Error",
                message=(
                    "Cannot update AI Registry Update form unless the "
                    "AI Registry form is completed."
                ),
                status_code=400,
            )
