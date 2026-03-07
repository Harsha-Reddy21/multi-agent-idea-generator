"""
Suggestions Service Module
=========================
Contains business logic for providing AI-powered suggestions for form fields
based on question context.
"""

import logging
from typing import List, Dict, Any

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from data_service.utils.cache_manager import cache_manager
from data_service.exceptions import SuggestionsServiceError
from data_service.utils.error_utils import handle_service_exception
from data_service.models.suggestions import Suggestions

logger = logging.getLogger(__name__)


class SuggestionsService:
    """
    Service class for handling AI-powered form field suggestions.

    This service retrieves suggestions from the database based on question
    prompts and form types.
    """

    def __init__(self, db: AsyncSession) -> None:
        """
        Initialize the suggestions service

        Args:
            db: Database session for query execution

        Raises:
            ValueError: If db session is invalid
        """
        if db is None:
            raise SuggestionsServiceError(
                error="Validation Error",
                message="Database session cannot be None",
                status_code=400,
            )
        self.db = db
        logger.debug("SuggestionsService initialized")

    async def get_suggestions_by_form_type(
        self, form_type: str
    ) -> List[Dict[str, Any]]:
        """
        Fetch all question_id and suggestions for a given form_type.

        Args:
            form_type: The form type to filter suggestions(e.g., "idea-sub-form")

        Returns:
            list: List of dicts with question_id and suggestions.

        Raises:
            SuggestionsServiceError: If form_type is invalid or database errors occur
        """
        try:
            # Validate form_type is provided and not empty
            if not form_type or not isinstance(form_type, str):
                logger.warning("Invalid form_type provided: %s", form_type)
                raise SuggestionsServiceError(
                    error="Validation Error",
                    message="form_type is required and must be a non-empty string",
                    status_code=400,
                )

            logger.info("Fetching suggestions for form_type=%s", form_type)

            # Use cache manager for suggestions
            suggestions = await cache_manager.get_suggestions_by_form_type(
                form_type, self.db
            )

            if not suggestions:
                logger.info("No suggestions found for form_type=%s", form_type)
                return []

            logger.info(
                "Found %d suggestions for form_type=%s", len(suggestions), form_type
            )

            return [
                {"question_id": s.question_id, "suggestions": s.suggestions}
                for s in suggestions
            ]

        except SuggestionsServiceError:
            # Re-raise our own business logic errors
            raise

        except Exception as e:
            # Handle database and unexpected errors
            handle_service_exception(
                e, SuggestionsServiceError, "fetch suggestions by form type"
            )
