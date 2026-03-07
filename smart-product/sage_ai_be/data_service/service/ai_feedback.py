"""
AI Feedback Service
===================
Business logic for creating and managing AI feedback
"""

import logging
from typing import Dict, Any, Optional, List, Tuple
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from fastapi import HTTPException

from data_service.exceptions import AIFeedbackServiceError
from data_service.utils.error_utils import handle_service_exception
from data_service.utils.validation import validate_and_get_user
from data_service.utils.form_validators import (
    validate_submission_ownership,
    validate_submission_ownership_interaction,
)

from data_service.models.ai_interactions import AIInteractions
from data_service.models.ai_feedback import AIFeedback
from data_service.models.submissions import Submissions
from data_service.models.questions import Questions
from data_service.models.form_schemas import FormSchemas
from data_service.constants.constants import FormType
from data_service.constants.extraction_mapping import PREFIX_TO_FORM

from data_service.utils.query_optimizer import QueryOptimizer

logger = logging.getLogger(__name__)


class AIFeedbackService:
    """Service for handling AI feedback operations"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def _validate_entities_batch(
        self, submission_id: UUID, question_id: str, form_type: str
    ) -> None:
        """
        Validate form type, submission, and question in a single optimized query.

        Args:
            submission_id: Submission UUID
            question_id: Question ID
            form_type: Form type

        Raises:
            HTTPException: If any validation fails
        """
        # Single query with OUTER JOINs to validate all entities
        validation_query = (
            select(
                FormSchemas.form_type.label("schema_form_type"),
                FormSchemas.is_active.label("schema_is_active"),
                Submissions.id.label("submission_id"),
                Questions.id.label("question_id"),
            )
            .select_from(FormSchemas)
            .outerjoin(Submissions, Submissions.id == submission_id)
            .outerjoin(Questions, Questions.id == question_id)
            .where(
                and_(
                    FormSchemas.form_type == form_type, FormSchemas.is_active.is_(True)
                )
            )
        )

        result = await self.db.execute(validation_query)
        row = result.first()

        # Validate all entities exist
        if not row or not row.schema_form_type:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Invalid form type '{form_type}'. "
                    "Please use one of the available form types: "
                    f"{FormType.AI_REGISTRY}, {FormType.SECURITY_ARCH}, {FormType.WWTP}, "
                    f"{FormType.DLO}, or {FormType.IDEA_SUB}."
                ),
            )

        if not row.submission_id:
            raise HTTPException(
                status_code=404,
                detail=f"Submission with id '{submission_id}' not found",
            )

        if not row.question_id:
            raise HTTPException(
                status_code=404, detail=f"Question with id '{question_id}' not found"
            )

        # Validate question belongs to the specified form type
        question_prefix = question_id.split("-")[0] if "-" in question_id else ""
        expected_form_type = PREFIX_TO_FORM.get(question_prefix)

        if expected_form_type != form_type:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Question '{question_id}' does not belong to "
                    f"form type '{form_type}'. "
                    f"It belongs to '{expected_form_type}'."
                ),
            )

    async def _get_or_create_interaction(
        self, submission_id: UUID, question_id: str
    ) -> AIInteractions:
        """
        Get existing interaction or create new one.

        Args:
            submission_id: Submission UUID
            question_id: Question ID

        Returns:
            AIInteractions object
        """
        # Use QueryOptimizer for standardized single object fetch
        interaction = await QueryOptimizer.fetch_single_with_relationships(
            self.db,
            AIInteractions,
            and_(
                AIInteractions.submission_id == submission_id,
                AIInteractions.question_id == question_id,
            ),
        )

        if interaction:
            logger.info("Reusing existing AI interaction: %s", interaction.id)
        else:
            # Create new interaction record
            interaction = AIInteractions(
                submission_id=submission_id, question_id=question_id
            )
            self.db.add(interaction)
            await self.db.flush()  # Get interaction.id without committing
            logger.info("Created new AI interaction: %s", interaction.id)

        return interaction

    # pylint: disable=too-many-arguments,too-many-positional-arguments,too-many-locals
    async def create_feedback(
        self,
        x_webauth_email: str,
        is_accepted: Optional[bool],
        feedback_type: Optional[str],
        feedback_tags: Optional[List[str]],
        user_comment: Optional[str],
        interaction_id: str,
    ) -> Tuple[AIInteractions, Optional[AIFeedback]]:
        """
        Find existing AI interaction and optionally create feedback for it

        Args:
            submission_id: Submission ID string
            question_id: Question ID
            form_id: Form ID (optional, for additional filtering)
            ai_feature_type: AI feature type
            x_webauth_email: User's email from authentication header
            is_accepted: Whether user accepted the AI suggestion
            feedback_type: Like or dislike (optional)
            feedback_tags: Feedback tags
            user_comment: User's comment

        Returns:
            Tuple of (AIInteractions, AIFeedback)

        Raises:
            AIFeedbackServiceError: If interaction not found or database error occurs
        """
        try:
            # Validate authentication and get user
            user = await validate_and_get_user(
                x_webauth_email, self.db, AIFeedbackServiceError
            )

            # Validate that the submission exists and belongs to the user

            # Ensure the interaction exists and belongs to the authenticated user's submission
            interaction, submission, submitter = (
                await validate_submission_ownership_interaction(
                    interaction_id=interaction_id,
                    db=self.db,
                    error_class=AIFeedbackServiceError,
                )
            )

            # Confirm the authenticated user matches the owner of the submission
            if submitter.id != user.id:
                logger.warning(
                    "Authorization failed: user %s attempted to create feedback for submission %s owned by %s",
                    user.id,
                    submission.id,
                    submitter.id,
                )
                raise AIFeedbackServiceError(
                    error="Unauthorized",
                    message="User does not match the owner of the submission for this interaction",
                    status_code=401,
                )

            # Update is_accepted if provided
            if is_accepted is not None:
                interaction.is_accepted = is_accepted
                logger.info(
                    "Updated is_accepted=%s for interaction %s",
                    is_accepted,
                    interaction.id,
                )

            # Create new feedback record only if feedback_type is provided
            feedback = None
            if feedback_type:
                # Prevent duplicate feedback of the same type for the same interaction.
                # Enforce a uniqueness constraint at the service level so UI cannot
                # insert multiple 'like'/'dislike' entries for one interaction.
                dup_check_q = select(AIFeedback.id).where(
                    and_(
                        AIFeedback.interaction_id == interaction.id,
                        AIFeedback.feedback_type == feedback_type,
                    )
                )
                dup_res = await self.db.execute(dup_check_q)
                if dup_res.first():
                    # Conflict: a feedback with this (interaction_id, feedback_type) already exists
                    raise AIFeedbackServiceError(
                        error="Conflict",
                        message=(
                            f"A feedback of type '{feedback_type}' already exists for interaction {interaction.id}"
                        ),
                        status_code=409,
                    )
                feedback = AIFeedback(
                    interaction_id=interaction.id,
                    feedback_type=feedback_type,
                    feedback_tags=feedback_tags,
                    user_comment=user_comment,
                )
                self.db.add(feedback)
                logger.info("Creating feedback for interaction %s", interaction.id)
            else:
                logger.info("No feedback provided %s", interaction.id)

            # Commit transaction
            await self.db.commit()
            await self.db.refresh(interaction)
            if feedback:
                await self.db.refresh(feedback)
                logger.info(
                    "Created feedback %s for interaction %s",
                    feedback.id,
                    interaction.id,
                )

            return interaction, feedback

        except AIFeedbackServiceError:
            await self.db.rollback()
            raise
        except Exception as e:
            await self.db.rollback()
            handle_service_exception(e, AIFeedbackServiceError, "create AI feedback")
