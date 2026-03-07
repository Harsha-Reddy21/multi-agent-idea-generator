"""
Centralized Cache Manager for Metadata Tables
==============================================
Provides a singleton cache layer for frequently accessed metadata tables
with configurable TTL and size limits.

This module implements a centralized caching strategy to avoid duplicate
cache instances across services and ensure consistent cache behavior.

Features:
- Singleton pattern ensures single cache instance across application
- 24-hour TTL for all metadata caches
- 1000 entry limit per cache with LRU eviction
- Thread-safe operations via cachetools.TTLCache
- Automatic cache invalidation on TTL expiry

Cached Tables:
- Questions: Question metadata and text (by question_id)
- Suggestions: Suggestion lists per question (by question_id) or by form_type
- QuestionScoringConfig: Scoring weights and rules per form type
- Text Questions: All TEXT-type questions filtered by question_type
- Suggestions by Form: All suggestions for a specific form_type

Cache Management:
    >>> # Clear specific entries
    >>> cache_manager.clear_question_cache("Q1")
    >>> cache_manager.clear_suggestions_cache("Q1")
    >>>
    >>> # Clear entire caches
    >>> cache_manager.clear_all_caches()
"""

import logging
from typing import Optional, List, Dict, Any
from cachetools import TTLCache
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession

from data_service.models.questions import Questions
from data_service.models.suggestions import Suggestions
from data_service.models.question_scoring_config import QuestionScoringConfig
from data_service.configurations.settings import Settings, get_settings

logger = logging.getLogger(__name__)


class MetadataCacheManager:
    """
    Singleton cache manager for metadata tables.

    Provides centralized caching for:
    - Questions table
    - Suggestions table
    - Question Scoring Config table

    All caches use 24-hour TTL to balance freshness with performance.
    """

    _instance: Optional["MetadataCacheManager"] = None

    def __new__(cls):
        """Singleton pattern implementation"""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self, settings: Optional[Settings] = None):
        """
        Initialize cache manager (only once due to singleton pattern).

        Args:
            settings: Optional Settings instance for configuration
        """
        if hasattr(self, "_initialized") and self._initialized:
            return

        if settings is None:
            settings = get_settings()

        # Cache configuration
        ttl = 86400  # 24 hours in seconds
        max_size = 1000

        # Initialize individual caches
        self._questions_cache: TTLCache = TTLCache(maxsize=max_size, ttl=ttl)
        self._suggestions_cache: TTLCache = TTLCache(maxsize=max_size, ttl=ttl)
        self._scoring_config_cache: TTLCache = TTLCache(maxsize=max_size, ttl=ttl)
        self._text_questions_cache: TTLCache = TTLCache(maxsize=max_size, ttl=ttl)
        self._suggestions_by_form_cache: TTLCache = TTLCache(maxsize=max_size, ttl=ttl)

        self._initialized = True
        logger.info(
            "MetadataCacheManager initialized: TTL=%ds, max_size=%d per cache",
            ttl,
            max_size,
        )

    async def get_question(
        self, question_id: str, db: AsyncSession
    ) -> Optional[Questions]:
        """
        Get question by ID with caching.

        Args:
            question_id: Question identifier
            db: Database session

        Returns:
            Questions object or None if not found
        """
        # Check cache
        if question_id in self._questions_cache:
            logger.debug("Cache hit: question_id=%s", question_id)
            return self._questions_cache[question_id]

        logger.debug("Cache miss: question_id=%s, fetching from DB", question_id)

        # Fetch from database
        query = select(Questions).where(Questions.id == question_id)
        result = await db.execute(query)
        question = result.scalar_one_or_none()

        if question:
            self._questions_cache[question_id] = question
            logger.info("Cached question: question_id=%s", question_id)
        else:
            logger.warning("Question not found: question_id=%s", question_id)

        return question

    async def get_suggestions(
        self, question_id: str, db: AsyncSession
    ) -> Optional[List[str]]:
        """
        Get suggestions by question ID with caching.

        Args:
            question_id: Question identifier
            db: Database session

        Returns:
            List of suggestion strings or None if not found
        """
        # Check cache
        if question_id in self._suggestions_cache:
            logger.debug("Cache hit: suggestions for question_id=%s", question_id)
            return self._suggestions_cache[question_id]

        logger.debug(
            "Cache miss: suggestions for question_id=%s, fetching from DB",
            question_id,
        )

        # Fetch from database
        query = select(Suggestions).where(Suggestions.question_id == question_id)
        result = await db.execute(query)
        suggestion_record = result.scalar_one_or_none()

        if not suggestion_record or not suggestion_record.suggestions:
            logger.warning("No suggestions found: question_id=%s", question_id)
            return None

        suggestions = suggestion_record.suggestions

        # Validate and cache
        if isinstance(suggestions, list):
            self._suggestions_cache[question_id] = suggestions
            logger.info(
                "Cached %d suggestions: question_id=%s",
                len(suggestions),
                question_id,
            )
            return suggestions

        logger.error(
            "Invalid suggestions format: question_id=%s, expected list, got %s",
            question_id,
            type(suggestions).__name__,
        )
        return None

    async def get_scoring_config(
        self, form_type: str, db: AsyncSession
    ) -> Optional[List[QuestionScoringConfig]]:
        """
        Get scoring configuration by form type with caching.

        Args:
            form_type: Form type identifier
            db: Database session

        Returns:
            List of QuestionScoringConfig objects or None if not found
        """
        # Check cache
        if form_type in self._scoring_config_cache:
            logger.debug("Cache hit: scoring_config for form_type=%s", form_type)
            return self._scoring_config_cache[form_type]

        logger.debug(
            "Cache miss: scoring_config for form_type=%s, fetching from DB",
            form_type,
        )

        # Fetch from database
        query = (
            select(QuestionScoringConfig)
            .where(QuestionScoringConfig.form_type == form_type)
            .order_by(QuestionScoringConfig.question_id)
        )
        result = await db.execute(query)
        config_records = result.scalars().all()

        if not config_records:
            logger.warning("No scoring config found: form_type=%s", form_type)
            return None

        # Cache the results
        config_list = list(config_records)
        self._scoring_config_cache[form_type] = config_list
        logger.info(
            "Cached %d scoring config records: form_type=%s",
            len(config_list),
            form_type,
        )

        return config_list

    async def get_text_questions(self, db: AsyncSession) -> List[Questions]:
        """
        Get all TEXT-type questions with caching.

        Args:
            db: Database session

        Returns:
            List of Questions objects with text-type questions
        """
        cache_key = "text_questions_all"

        # Check cache
        if cache_key in self._text_questions_cache:
            logger.debug("Cache hit: text_questions")
            return self._text_questions_cache[cache_key]

        logger.debug("Cache miss: text_questions, fetching from DB")

        # Fetch from database
        query = (
            select(Questions)
            .where(
                Questions.question_type.in_(["Text", "Text (Long Text)", "Long Text"])
            )
            .order_by(Questions.id)
        )
        result = await db.execute(query)
        questions = result.scalars().all()

        # Cache the results
        questions_list = list(questions)
        self._text_questions_cache[cache_key] = questions_list
        logger.info("Cached %d text questions", len(questions_list))

        return questions_list

    async def get_suggestions_by_form_type(
        self, form_type: str, db: AsyncSession
    ) -> Optional[List[Suggestions]]:
        """
        Get all suggestions for a specific form type with caching.

        Args:
            form_type: Form type identifier
            db: Database session

        Returns:
            List of Suggestions objects or None if not found
        """
        # Check cache
        if form_type in self._suggestions_by_form_cache:
            logger.debug("Cache hit: suggestions_by_form for form_type=%s", form_type)
            return self._suggestions_by_form_cache[form_type]

        logger.debug(
            "Cache miss: suggestions_by_form for form_type=%s, fetching from DB",
            form_type,
        )

        # Fetch from database
        query = select(Suggestions).where(Suggestions.form_type == form_type)
        result = await db.execute(query)
        suggestions_records = result.scalars().all()

        if not suggestions_records:
            logger.warning("No suggestions found for form_type=%s", form_type)
            return None

        # Cache the results
        suggestions_list = list(suggestions_records)
        self._suggestions_by_form_cache[form_type] = suggestions_list
        logger.info(
            "Cached %d suggestion records for form_type=%s",
            len(suggestions_list),
            form_type,
        )

        return suggestions_list

    async def get_question_with_suggestions(
        self, question_id: str, db: AsyncSession
    ) -> Dict[str, Any]:
        """
        Get question and its suggestions in a single call (both cached separately).

        Args:
            question_id: Question identifier
            db: Database session

        Returns:
            Dict containing question object and suggestions list
            {
                "question": Questions object or None,
                "suggestions": List[str] or None
            }
        """
        # Fetch both concurrently using individual cache methods
        question = await self.get_question(question_id, db)
        suggestions = await self.get_suggestions(question_id, db)

        return {
            "question": question,
            "suggestions": suggestions,
        }

    def clear_question_cache(self, question_id: Optional[str] = None) -> None:
        """
        Clear question cache.

        Args:
            question_id: Optional specific question ID to clear.
                        If None, clears entire cache.
        """
        if question_id:
            self._questions_cache.pop(question_id, None)
            logger.info("Cleared question cache: question_id=%s", question_id)
        else:
            self._questions_cache.clear()
            logger.info("Cleared entire question cache")

    def clear_suggestions_cache(self, question_id: Optional[str] = None) -> None:
        """
        Clear suggestions cache.

        Args:
            question_id: Optional specific question ID to clear.
                        If None, clears entire cache.
        """
        if question_id:
            self._suggestions_cache.pop(question_id, None)
            logger.info("Cleared suggestions cache: question_id=%s", question_id)
        else:
            self._suggestions_cache.clear()
            logger.info("Cleared entire suggestions cache")

    def clear_scoring_config_cache(self, form_type: Optional[str] = None) -> None:
        """
        Clear scoring config cache.

        Args:
            form_type: Optional specific form type to clear.
                      If None, clears entire cache.
        """
        if form_type:
            self._scoring_config_cache.pop(form_type, None)
            logger.info("Cleared scoring config cache: form_type=%s", form_type)
        else:
            self._scoring_config_cache.clear()
            logger.info("Cleared entire scoring config cache")

    def clear_text_questions_cache(self) -> None:
        """Clear text questions cache."""
        self._text_questions_cache.clear()
        logger.info("Cleared text questions cache")

    def clear_suggestions_by_form_cache(self, form_type: Optional[str] = None) -> None:
        """
        Clear suggestions by form type cache.

        Args:
            form_type: Optional specific form type to clear.
                      If None, clears entire cache.
        """
        if form_type:
            self._suggestions_by_form_cache.pop(form_type, None)
            logger.info("Cleared suggestions by form cache: form_type=%s", form_type)
        else:
            self._suggestions_by_form_cache.clear()
            logger.info("Cleared entire suggestions by form cache")

    def clear_all_caches(self) -> None:
        """Clear all metadata caches."""
        self._questions_cache.clear()
        self._suggestions_cache.clear()
        self._scoring_config_cache.clear()
        self._text_questions_cache.clear()
        self._suggestions_by_form_cache.clear()
        logger.info("Cleared all metadata caches")

    def get_cache_stats(self) -> Dict[str, Dict[str, int]]:
        """
        Get statistics about cache usage.

        Returns:
            Dict with cache statistics for each cache type
        """
        return {
            "questions_cache": {
                "size": len(self._questions_cache),
                "maxsize": self._questions_cache.maxsize,
                "ttl": self._questions_cache.ttl,
            },
            "suggestions_cache": {
                "size": len(self._suggestions_cache),
                "maxsize": self._suggestions_cache.maxsize,
                "ttl": self._suggestions_cache.ttl,
            },
            "scoring_config_cache": {
                "size": len(self._scoring_config_cache),
                "maxsize": self._scoring_config_cache.maxsize,
                "ttl": self._scoring_config_cache.ttl,
            },
            "text_questions_cache": {
                "size": len(self._text_questions_cache),
                "maxsize": self._text_questions_cache.maxsize,
                "ttl": self._text_questions_cache.ttl,
            },
            "suggestions_by_form_cache": {
                "size": len(self._suggestions_by_form_cache),
                "maxsize": self._suggestions_by_form_cache.maxsize,
                "ttl": self._suggestions_by_form_cache.ttl,
            },
        }


# Singleton instance
cache_manager = MetadataCacheManager()
