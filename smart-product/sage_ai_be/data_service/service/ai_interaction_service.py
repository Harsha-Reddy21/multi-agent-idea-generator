"""
AI Interaction Service Module
Handles business logic for AI interaction operations
"""

import logging
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from data_service.models.ai_interactions import AIInteractions
from data_service.exceptions.service_errors import ServiceError

logger = logging.getLogger(__name__)


class AIInteractionService:
    """Service for managing AI interaction operations"""

    def __init__(self, db: AsyncSession):
        """
        Initialize AIInteractionService.

        Args:
            db: Database session
        """
        self.db = db

    async def update_interaction_acceptance(
        self, interactions: dict[UUID, bool]
    ) -> int:
        """
        Update the acceptance status of multiple AI interactions.

        Args:
            interactions: Dictionary mapping interaction IDs to their acceptance status

        Returns:
            int: Count of interactions updated

        Raises:
            ServiceError: If database error occurs
        """
        try:
            updated_count = 0

            for interaction_id, is_accepted in interactions.items():
                result = await self.db.execute(
                    select(AIInteractions).where(AIInteractions.id == interaction_id)
                )
                interaction = result.scalar_one_or_none()

                if interaction:
                    interaction.is_accepted = is_accepted
                    updated_count += 1
                    logger.info(
                        "Updated AI interaction %s: is_accepted=%s",
                        interaction_id,
                        is_accepted,
                    )
                else:
                    logger.warning(
                        "AI interaction with ID %s not found, skipping",
                        interaction_id,
                    )

            await self.db.commit()

            logger.info("Updated %d AI interactions", updated_count)
            return updated_count

        except Exception as e:
            logger.exception("Error updating AI interaction acceptance status")
            await self.db.rollback()
            raise ServiceError(
                error="Internal Server Error",
                message=f"Failed to update AI interactions: {str(e)}",
                status_code=500,
            )
