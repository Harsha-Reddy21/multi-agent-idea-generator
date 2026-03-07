"""
Tests for SSE Progress Tracker
==============================
Tests the SSEProgressTracker class for progress tracking.
"""

import pytest
import asyncio
from unittest.mock import patch, MagicMock, AsyncMock

from data_service.utils.sse_progress_tracker import (
    SSEProgressTracker,
    ProgressStatus,
)


class TestProgressStatus:
    """Tests for ProgressStatus enum."""

    def test_pending_value(self):
        """Test PENDING status value."""
        assert ProgressStatus.PENDING.value == "pending"

    def test_started_value(self):
        """Test STARTED status value."""
        assert ProgressStatus.STARTED.value == "started"

    def test_extracting_blocks_value(self):
        """Test EXTRACTING_BLOCKS status value."""
        assert ProgressStatus.EXTRACTING_BLOCKS.value == "extracting_blocks"

    def test_blocks_extracted_value(self):
        """Test BLOCKS_EXTRACTED status value."""
        assert ProgressStatus.BLOCKS_EXTRACTED.value == "blocks_extracted"

    def test_fetching_questions_value(self):
        """Test FETCHING_QUESTIONS status value."""
        assert ProgressStatus.FETCHING_QUESTIONS.value == "fetching_questions"

    def test_questions_fetched_value(self):
        """Test QUESTIONS_FETCHED status value."""
        assert ProgressStatus.QUESTIONS_FETCHED.value == "questions_fetched"

    def test_processing_questions_value(self):
        """Test PROCESSING_QUESTIONS status value."""
        assert ProgressStatus.PROCESSING_QUESTIONS.value == "processing_questions"

    def test_question_processed_value(self):
        """Test QUESTION_PROCESSED status value."""
        assert ProgressStatus.QUESTION_PROCESSED.value == "question_processed"

    def test_storing_results_value(self):
        """Test STORING_RESULTS status value."""
        assert ProgressStatus.STORING_RESULTS.value == "storing_results"

    def test_success_value(self):
        """Test SUCCESS status value."""
        assert ProgressStatus.SUCCESS.value == "success"

    def test_failed_value(self):
        """Test FAILED status value."""
        assert ProgressStatus.FAILED.value == "failed"

    def test_warning_value(self):
        """Test WARNING status value."""
        assert ProgressStatus.WARNING.value == "warning"

    def test_status_is_string_enum(self):
        """Test that ProgressStatus inherits from str."""
        assert isinstance(ProgressStatus.PENDING, str)
        assert ProgressStatus.PENDING == "pending"


class TestSSEProgressTrackerInit:
    """Tests for SSEProgressTracker initialization."""

    @patch.dict("os.environ", {}, clear=True)
    def test_init_without_redis_host(self):
        """Test initialization without REDIS_HOST."""
        tracker = SSEProgressTracker()

        assert tracker._progress_store == {}
        assert tracker._use_redis is False
        assert tracker._redis_initialized is False

    @patch.dict("os.environ", {"REDIS_HOST": "localhost:6379"})
    def test_init_with_redis_host_no_scheme(self):
        """Test initialization with REDIS_HOST without scheme."""
        tracker = SSEProgressTracker()

        assert tracker._redis_url == "redis://localhost:6379"

    @patch.dict("os.environ", {"REDIS_HOST": "redis://localhost:6379"})
    def test_init_with_redis_host_with_scheme(self):
        """Test initialization with REDIS_HOST with scheme."""
        tracker = SSEProgressTracker()

        assert tracker._redis_url == "redis://localhost:6379"


class TestSSEProgressTrackerHelpers:
    """Tests for SSEProgressTracker helper methods."""

    def test_get_progress_key(self):
        """Test _get_progress_key static method."""
        key = SSEProgressTracker._get_progress_key("test-uuid-123")

        assert key == "progress:test-uuid-123"

    def test_get_channel_key(self):
        """Test _get_channel_key static method."""
        key = SSEProgressTracker._get_channel_key("test-uuid-123")

        assert key == "progress_channel:test-uuid-123"


class TestSSEProgressTrackerEnsureRedis:
    """Tests for SSEProgressTracker._ensure_redis method."""

    @patch.dict("os.environ", {}, clear=True)
    @pytest.mark.asyncio
    async def test_ensure_redis_without_redis(self):
        """Test _ensure_redis returns False when Redis not configured."""
        tracker = SSEProgressTracker()

        result = await tracker._ensure_redis()

        assert result is False

    @patch.dict("os.environ", {}, clear=True)
    @pytest.mark.asyncio
    async def test_ensure_redis_already_initialized(self):
        """Test _ensure_redis returns True when already initialized."""
        tracker = SSEProgressTracker()
        tracker._use_redis = True
        tracker._redis_initialized = True

        result = await tracker._ensure_redis()

        assert result is True


class TestSSEProgressTrackerUpdateProgress:
    """Tests for SSEProgressTracker.update_progress method."""

    @patch.dict("os.environ", {}, clear=True)
    @pytest.mark.asyncio
    async def test_update_progress_in_memory(self):
        """Test update_progress stores in memory when Redis unavailable."""
        tracker = SSEProgressTracker()

        await tracker.update_progress(
            submission_id="test-123",
            status=ProgressStatus.STARTED,
            message="Test message",
        )

        assert "test-123" in tracker._progress_store
        assert tracker._progress_store["test-123"]["status"] == "started"
        assert tracker._progress_store["test-123"]["message"] == "Test message"

    @patch.dict("os.environ", {}, clear=True)
    @pytest.mark.asyncio
    async def test_update_progress_with_metadata(self):
        """Test update_progress stores metadata."""
        tracker = SSEProgressTracker()

        await tracker.update_progress(
            submission_id="test-123",
            status=ProgressStatus.PROCESSING_QUESTIONS,
            message="Processing",
            metadata={"question_id": "q1"},
        )

        assert tracker._progress_store["test-123"]["metadata"] == {"question_id": "q1"}

    @patch.dict("os.environ", {}, clear=True)
    @pytest.mark.asyncio
    async def test_update_progress_with_step_numbers(self):
        """Test update_progress calculates percentage."""
        tracker = SSEProgressTracker()

        await tracker.update_progress(
            submission_id="test-123",
            status=ProgressStatus.QUESTION_PROCESSED,
            message="Question 2 of 4",
            step_number=2,
            total_steps=4,
        )

        progress = tracker._progress_store["test-123"]["progress"]
        assert progress["step"] == 2
        assert progress["total"] == 4
        assert progress["percentage"] == 50.0

    @patch.dict("os.environ", {}, clear=True)
    @pytest.mark.asyncio
    async def test_update_progress_notifies_subscribers(self):
        """Test update_progress notifies local subscribers."""
        tracker = SSEProgressTracker()
        queue = asyncio.Queue(maxsize=10)
        tracker._subscribers["test-123"].append(queue)

        await tracker.update_progress(
            submission_id="test-123",
            status=ProgressStatus.SUCCESS,
            message="Completed",
        )

        # Check queue received the update
        data = await asyncio.wait_for(queue.get(), timeout=1.0)
        assert data["status"] == "success"


class TestSSEProgressTrackerGetProgress:
    """Tests for SSEProgressTracker.get_progress method."""

    @patch.dict("os.environ", {}, clear=True)
    @pytest.mark.asyncio
    async def test_get_progress_from_memory(self):
        """Test get_progress retrieves from in-memory store."""
        tracker = SSEProgressTracker()
        tracker._progress_store["test-123"] = {
            "status": "started",
            "message": "Test",
        }

        result = await tracker.get_progress("test-123")

        assert result["status"] == "started"

    @patch.dict("os.environ", {}, clear=True)
    @pytest.mark.asyncio
    async def test_get_progress_not_found(self):
        """Test get_progress returns None when not found."""
        tracker = SSEProgressTracker()

        result = await tracker.get_progress("nonexistent")

        assert result is None


class TestSSEProgressTrackerQuestionProgress:
    """Tests for SSEProgressTracker.update_question_progress method."""

    @patch.dict("os.environ", {}, clear=True)
    @pytest.mark.asyncio
    async def test_update_question_progress_basic(self):
        """Test update_question_progress stores question metadata."""
        tracker = SSEProgressTracker()

        await tracker.update_question_progress(
            submission_id="test-123",
            question_id="q1",
            question_index=0,
            total_questions=5,
            status="processing",
            message="Processing question 1",
        )

        data = tracker._progress_store["test-123"]
        assert data["metadata"]["current_question"] == "q1"
        assert data["metadata"]["question_index"] == 1  # 1-based for display
        assert data["metadata"]["total_questions"] == 5
        assert data["metadata"]["question_progress_percentage"] == 20.0

    @patch.dict("os.environ", {}, clear=True)
    @pytest.mark.asyncio
    async def test_update_question_progress_last_question(self):
        """Test update_question_progress for last question (100%)."""
        tracker = SSEProgressTracker()

        await tracker.update_question_progress(
            submission_id="test-123",
            question_id="q5",
            question_index=4,
            total_questions=5,
            status="completed",
            message="Processing question 5 of 5",
        )

        data = tracker._progress_store["test-123"]
        assert data["metadata"]["current_question"] == "q5"
        assert data["metadata"]["question_index"] == 5  # 1-based
        assert data["metadata"]["question_progress_percentage"] == 100.0

    @patch.dict("os.environ", {}, clear=True)
    @pytest.mark.asyncio
    async def test_update_question_progress_middle_question(self):
        """Test update_question_progress for middle question."""
        tracker = SSEProgressTracker()

        await tracker.update_question_progress(
            submission_id="test-123",
            question_id="q3",
            question_index=2,
            total_questions=10,
            status="in_progress",
            message="Processing question 3 of 10",
        )

        data = tracker._progress_store["test-123"]
        assert data["metadata"]["current_question"] == "q3"
        assert data["metadata"]["question_index"] == 3  # 1-based
        assert data["metadata"]["total_questions"] == 10
        assert data["metadata"]["question_progress_percentage"] == 30.0
