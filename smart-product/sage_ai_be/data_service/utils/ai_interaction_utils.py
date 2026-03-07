"""
AI Interaction Utility Functions
=================================
Utility functions for creating and managing AI interactions
"""

import logging
from typing import Dict, Any, Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession

from data_service.models.ai_interactions import AIInteractions
from data_service.serializers.ai_feedback import AIFeatureType

logger = logging.getLogger(__name__)


async def create_ai_interaction(
    db: AsyncSession,
    submission_id: UUID,
    question_id: str,
    ai_feature_type: AIFeatureType,
    ai_generated_content: Dict[str, Any],
    *,  # Force keyword-only arguments after this
    form_id: Optional[UUID] = None,
    user_input: Optional[str] = None,
    is_accepted: Optional[bool] = None,
    commit: bool = True
) -> AIInteractions:
    """
    Create a new AI interaction record when AI generates content

    This utility is called by the backend when AI features produce responses.
    It stores the context of the AI interaction for later feedback collection.

    Args:
        db: Database session
        submission_id: Submission UUID
        question_id: Question ID (e.g., "AI-Q5")
        form_id: Form ID (UUID from submission_forms, optional)
        ai_feature_type: AI feature type enum (suggestions/enhance_answer/data_extracts/
            check_coverage)
        ai_generated_content: AI's response as JSON
        user_input: User's current answer when AI was triggered (optional, see usage
            notes)
        is_accepted: Whether user accepted the AI suggestion (optional, set by FE
            later)
        commit: Whether to commit the transaction (default: True)

    Returns:
        AIInteractions: Created interaction record

    Raises:
        Exception: If database operation fails
    """
    try:
        interaction = AIInteractions(
            submission_id=submission_id,
            question_id=question_id,
            form_id=form_id,
            user_input=user_input,
            ai_feature_type=ai_feature_type.value,
            ai_generated_content=ai_generated_content,
            is_accepted=is_accepted,
        )

        db.add(interaction)

        if commit:
            await db.commit()
            await db.refresh(interaction)
        else:
            await db.flush()  # Get ID without committing

        user_input_status = "with user_input" if user_input else "without user_input"
        logger.info(
            "Created AI interaction: %s (submission: %s, question: %s, feature: %s, %s)",
            interaction.id,
            submission_id,
            question_id,
            ai_feature_type.value,
            user_input_status,
        )

        return interaction

    except Exception:
        logger.exception("Failed to create AI interaction")
        if commit:
            await db.rollback()
        raise
