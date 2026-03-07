"""
Unit tests for cache_manager.py
================================
Tests the MetadataCacheManager singleton and its caching methods.
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from data_service.utils.cache_manager import MetadataCacheManager


@pytest.fixture
def fresh_cache_manager():
    """Create a fresh cache manager instance for testing."""
    # Reset singleton for testing
    MetadataCacheManager._instance = None
    manager = MetadataCacheManager()
    yield manager
    # Cleanup
    manager.clear_all_caches()
    MetadataCacheManager._instance = None


class TestMetadataCacheManager:
    """Tests for MetadataCacheManager class."""

    def test_singleton_pattern(self, fresh_cache_manager):
        """Test that cache manager follows singleton pattern."""
        manager1 = fresh_cache_manager
        manager2 = MetadataCacheManager()
        assert manager1 is manager2

    def test_initialization(self, fresh_cache_manager):
        """Test cache manager initializes correctly."""
        manager = fresh_cache_manager
        assert manager._initialized is True
        assert manager._questions_cache is not None
        assert manager._suggestions_cache is not None
        assert manager._scoring_config_cache is not None
        assert manager._text_questions_cache is not None
        assert manager._suggestions_by_form_cache is not None

    def test_get_cache_stats(self, fresh_cache_manager):
        """Test get_cache_stats returns correct structure."""
        stats = fresh_cache_manager.get_cache_stats()

        assert "questions_cache" in stats
        assert "suggestions_cache" in stats
        assert "scoring_config_cache" in stats
        assert "text_questions_cache" in stats
        assert "suggestions_by_form_cache" in stats

        # Check each cache has expected keys
        for cache_name, cache_stats in stats.items():
            assert "size" in cache_stats
            assert "maxsize" in cache_stats
            assert "ttl" in cache_stats
            assert cache_stats["maxsize"] == 1000
            assert cache_stats["ttl"] == 86400

    def test_clear_question_cache_all(self, fresh_cache_manager):
        """Test clearing entire question cache."""
        manager = fresh_cache_manager
        # Add something to cache
        manager._questions_cache["q1"] = MagicMock()
        manager._questions_cache["q2"] = MagicMock()
        assert len(manager._questions_cache) == 2

        manager.clear_question_cache()
        assert len(manager._questions_cache) == 0

    def test_clear_question_cache_specific(self, fresh_cache_manager):
        """Test clearing specific question from cache."""
        manager = fresh_cache_manager
        manager._questions_cache["q1"] = MagicMock()
        manager._questions_cache["q2"] = MagicMock()

        manager.clear_question_cache("q1")
        assert "q1" not in manager._questions_cache
        assert "q2" in manager._questions_cache

    def test_clear_suggestions_cache_all(self, fresh_cache_manager):
        """Test clearing entire suggestions cache."""
        manager = fresh_cache_manager
        manager._suggestions_cache["q1"] = ["s1", "s2"]
        manager._suggestions_cache["q2"] = ["s3"]

        manager.clear_suggestions_cache()
        assert len(manager._suggestions_cache) == 0

    def test_clear_suggestions_cache_specific(self, fresh_cache_manager):
        """Test clearing specific suggestion from cache."""
        manager = fresh_cache_manager
        manager._suggestions_cache["q1"] = ["s1", "s2"]
        manager._suggestions_cache["q2"] = ["s3"]

        manager.clear_suggestions_cache("q1")
        assert "q1" not in manager._suggestions_cache
        assert "q2" in manager._suggestions_cache

    def test_clear_scoring_config_cache_all(self, fresh_cache_manager):
        """Test clearing entire scoring config cache."""
        manager = fresh_cache_manager
        manager._scoring_config_cache["form1"] = [MagicMock()]
        manager._scoring_config_cache["form2"] = [MagicMock()]

        manager.clear_scoring_config_cache()
        assert len(manager._scoring_config_cache) == 0

    def test_clear_scoring_config_cache_specific(self, fresh_cache_manager):
        """Test clearing specific form type from scoring config cache."""
        manager = fresh_cache_manager
        manager._scoring_config_cache["form1"] = [MagicMock()]
        manager._scoring_config_cache["form2"] = [MagicMock()]

        manager.clear_scoring_config_cache("form1")
        assert "form1" not in manager._scoring_config_cache
        assert "form2" in manager._scoring_config_cache

    def test_clear_text_questions_cache(self, fresh_cache_manager):
        """Test clearing text questions cache."""
        manager = fresh_cache_manager
        manager._text_questions_cache["key"] = [MagicMock()]

        manager.clear_text_questions_cache()
        assert len(manager._text_questions_cache) == 0

    def test_clear_suggestions_by_form_cache_all(self, fresh_cache_manager):
        """Test clearing entire suggestions by form cache."""
        manager = fresh_cache_manager
        manager._suggestions_by_form_cache["form1"] = [MagicMock()]
        manager._suggestions_by_form_cache["form2"] = [MagicMock()]

        manager.clear_suggestions_by_form_cache()
        assert len(manager._suggestions_by_form_cache) == 0

    def test_clear_suggestions_by_form_cache_specific(self, fresh_cache_manager):
        """Test clearing specific form type from suggestions by form cache."""
        manager = fresh_cache_manager
        manager._suggestions_by_form_cache["form1"] = [MagicMock()]
        manager._suggestions_by_form_cache["form2"] = [MagicMock()]

        manager.clear_suggestions_by_form_cache("form1")
        assert "form1" not in manager._suggestions_by_form_cache
        assert "form2" in manager._suggestions_by_form_cache

    def test_clear_all_caches(self, fresh_cache_manager):
        """Test clearing all caches at once."""
        manager = fresh_cache_manager
        manager._questions_cache["q1"] = MagicMock()
        manager._suggestions_cache["q1"] = ["s1"]
        manager._scoring_config_cache["form1"] = [MagicMock()]
        manager._text_questions_cache["key"] = [MagicMock()]
        manager._suggestions_by_form_cache["form1"] = [MagicMock()]

        manager.clear_all_caches()

        assert len(manager._questions_cache) == 0
        assert len(manager._suggestions_cache) == 0
        assert len(manager._scoring_config_cache) == 0
        assert len(manager._text_questions_cache) == 0
        assert len(manager._suggestions_by_form_cache) == 0


class TestCacheManagerAsyncMethods:
    """Tests for async cache methods."""

    @pytest.mark.asyncio
    async def test_get_question_cache_hit(self, fresh_cache_manager):
        """Test get_question returns cached value on cache hit."""
        manager = fresh_cache_manager
        mock_question = MagicMock()
        mock_question.id = "q1"
        manager._questions_cache["q1"] = mock_question

        mock_db = AsyncMock()
        result = await manager.get_question("q1", mock_db)

        assert result is mock_question
        mock_db.execute.assert_not_called()

    @pytest.mark.asyncio
    async def test_get_question_cache_miss(self, fresh_cache_manager):
        """Test get_question fetches from DB on cache miss."""
        manager = fresh_cache_manager
        mock_question = MagicMock()
        mock_question.id = "q1"

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_question

        mock_db = AsyncMock()
        mock_db.execute.return_value = mock_result

        result = await manager.get_question("q1", mock_db)

        assert result is mock_question
        assert "q1" in manager._questions_cache
        mock_db.execute.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_question_not_found(self, fresh_cache_manager):
        """Test get_question returns None when not found."""
        manager = fresh_cache_manager

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None

        mock_db = AsyncMock()
        mock_db.execute.return_value = mock_result

        result = await manager.get_question("nonexistent", mock_db)

        assert result is None

    @pytest.mark.asyncio
    async def test_get_suggestions_cache_hit(self, fresh_cache_manager):
        """Test get_suggestions returns cached value on cache hit."""
        manager = fresh_cache_manager
        manager._suggestions_cache["q1"] = ["suggestion1", "suggestion2"]

        mock_db = AsyncMock()
        result = await manager.get_suggestions("q1", mock_db)

        assert result == ["suggestion1", "suggestion2"]
        mock_db.execute.assert_not_called()

    @pytest.mark.asyncio
    async def test_get_suggestions_cache_miss(self, fresh_cache_manager):
        """Test get_suggestions fetches from DB on cache miss."""
        manager = fresh_cache_manager
        mock_suggestion = MagicMock()
        mock_suggestion.suggestions = ["s1", "s2"]

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_suggestion

        mock_db = AsyncMock()
        mock_db.execute.return_value = mock_result

        result = await manager.get_suggestions("q1", mock_db)

        assert result == ["s1", "s2"]
        assert "q1" in manager._suggestions_cache

    @pytest.mark.asyncio
    async def test_get_suggestions_not_found(self, fresh_cache_manager):
        """Test get_suggestions returns None when not found."""
        manager = fresh_cache_manager

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None

        mock_db = AsyncMock()
        mock_db.execute.return_value = mock_result

        result = await manager.get_suggestions("nonexistent", mock_db)

        assert result is None

    @pytest.mark.asyncio
    async def test_get_suggestions_invalid_format(self, fresh_cache_manager):
        """Test get_suggestions returns None for invalid format."""
        manager = fresh_cache_manager
        mock_suggestion = MagicMock()
        mock_suggestion.suggestions = "not a list"  # Invalid - should be list

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_suggestion

        mock_db = AsyncMock()
        mock_db.execute.return_value = mock_result

        result = await manager.get_suggestions("q1", mock_db)

        assert result is None

    @pytest.mark.asyncio
    async def test_get_question_with_suggestions(self, fresh_cache_manager):
        """Test get_question_with_suggestions returns both."""
        manager = fresh_cache_manager

        mock_question = MagicMock()
        mock_question.id = "q1"
        manager._questions_cache["q1"] = mock_question
        manager._suggestions_cache["q1"] = ["s1", "s2"]

        mock_db = AsyncMock()
        result = await manager.get_question_with_suggestions("q1", mock_db)

        assert result["question"] is mock_question
        assert result["suggestions"] == ["s1", "s2"]

    @pytest.mark.asyncio
    async def test_get_suggestions_by_form_type_cache_hit(self, fresh_cache_manager):
        """Test get_suggestions_by_form_type returns cached value."""
        manager = fresh_cache_manager
        mock_suggestions = [MagicMock(), MagicMock()]
        manager._suggestions_by_form_cache["idea"] = mock_suggestions

        mock_db = AsyncMock()
        result = await manager.get_suggestions_by_form_type("idea", mock_db)

        assert result is mock_suggestions
        mock_db.execute.assert_not_called()

    @pytest.mark.asyncio
    async def test_get_suggestions_by_form_type_cache_miss(self, fresh_cache_manager):
        """Test get_suggestions_by_form_type fetches from DB on miss."""
        manager = fresh_cache_manager
        mock_suggestions = [MagicMock(), MagicMock()]

        mock_result = MagicMock()
        mock_scalars = MagicMock()
        mock_scalars.all.return_value = mock_suggestions
        mock_result.scalars.return_value = mock_scalars

        mock_db = AsyncMock()
        mock_db.execute.return_value = mock_result

        result = await manager.get_suggestions_by_form_type("idea", mock_db)

        assert result == mock_suggestions
        assert "idea" in manager._suggestions_by_form_cache

    @pytest.mark.asyncio
    async def test_get_suggestions_by_form_type_not_found(self, fresh_cache_manager):
        """Test get_suggestions_by_form_type returns None when not found."""
        manager = fresh_cache_manager

        mock_result = MagicMock()
        mock_scalars = MagicMock()
        mock_scalars.all.return_value = []
        mock_result.scalars.return_value = mock_scalars

        mock_db = AsyncMock()
        mock_db.execute.return_value = mock_result

        result = await manager.get_suggestions_by_form_type("nonexistent", mock_db)

        assert result is None
