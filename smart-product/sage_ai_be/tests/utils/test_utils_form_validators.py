"""Tests for form validator utilities."""

from types import SimpleNamespace
import pytest
import asyncio
from data_service.constants.constants import SubmissionStatus, FormStatus
from data_service.utils.form_validators import (
    validate_ai_registry_update_form_allowed,
    validate_form_not_completed,
    validate_submission_ownership,
    validate_form_ownership_and_status,
    validate_submission_ownership_interaction,
)
from data_service.utils.sse_progress_tracker import SSEProgressTracker, ProgressStatus


class DummyError(Exception):
    """Dummy error for testing."""

    def __init__(self, error, message, status_code):
        self.error = error
        self.message = message
        self.status_code = status_code


class FakeResult:
    def __init__(self, value):
        self._value = value

    def scalar_one_or_none(self):
        return self._value


class FakeDB:
    def __init__(self, value):
        self._value = value

    async def execute(self, *args, **kwargs):
        return FakeResult(self._value)


class FakeScalarFirst:
    def __init__(self, obj):
        self._obj = obj

    def first(self):
        return self._obj


class FakeResultTuple:
    def __init__(self, row):
        self._row = row

    def first(self):
        return self._row


class FakeDB2:
    def __init__(self, scalars_obj=None, tuple_row=None):
        self._scalars_obj = scalars_obj
        self._tuple_row = tuple_row

    async def execute(self, *args, **kwargs):
        # Detect tuple query vs single scalars query by presence of select args
        class R:
            def __init__(self, outer):
                self.outer = outer

            def scalars(self):
                return FakeScalarFirst(self.outer._scalars_obj)

            def first(self):
                return self.outer._tuple_row

        return R(self)


@pytest.mark.asyncio
async def test_ai_registry_update_form_allows_when_completed():
    """Should not raise if submission is completed."""
    form = SimpleNamespace(form_type="ai-registry-update-form")
    submission = SimpleNamespace(status=SubmissionStatus.COMPLETED, id="sub-1")
    await validate_ai_registry_update_form_allowed(
        form, submission, FakeDB(FormStatus.COMPLETED), DummyError
    )


@pytest.mark.asyncio
async def test_ai_registry_update_form_blocks_when_not_completed():
    """Should raise if submission is not completed."""
    form = SimpleNamespace(form_type="ai-registry-update-form")
    submission = SimpleNamespace(status=SubmissionStatus.IN_PROGRESS, id="sub-2")
    with pytest.raises(DummyError) as exc:
        await validate_ai_registry_update_form_allowed(
            form, submission, FakeDB(FormStatus.IN_PROGRESS), DummyError
        )
    assert exc.value.status_code == 400
    assert "AI Registry Update" in exc.value.message


@pytest.mark.asyncio
async def test_non_ai_registry_update_form_does_not_block():
    """Should not raise for non-ai-registry-update-form."""
    form = SimpleNamespace(form_type="other-form-type")
    submission = SimpleNamespace(status=SubmissionStatus.IN_PROGRESS, id="sub-3")
    await validate_ai_registry_update_form_allowed(
        form, submission, FakeDB(None), DummyError
    )


@pytest.mark.asyncio
async def test_validate_form_not_completed_raises():
    form = SimpleNamespace(
        id="f1",
        submission_id="s1",
        status=FormStatus.COMPLETED,
        form_type="regular-form",
    )
    with pytest.raises(DummyError) as exc:
        validate_form_not_completed(form, DummyError)
    assert exc.value.status_code == 400


@pytest.mark.asyncio
async def test_validate_submission_ownership_ok():
    submission = SimpleNamespace(id="s1", submitter_id="u1")
    db = FakeDB2(scalars_obj=submission)
    out = await validate_submission_ownership("s1", db, DummyError, user_id="u1")
    assert out.id == "s1"


@pytest.mark.asyncio
async def test_validate_submission_ownership_not_found():
    db = FakeDB2(scalars_obj=None)
    with pytest.raises(DummyError):
        await validate_submission_ownership("s1", db, DummyError)


@pytest.mark.asyncio
async def test_validate_submission_ownership_wrong_user():
    submission = SimpleNamespace(id="s1", submitter_id="u2")
    db = FakeDB2(scalars_obj=submission)
    with pytest.raises(DummyError) as exc:
        await validate_submission_ownership("s1", db, DummyError, user_id="u1")
    assert exc.value.status_code == 400


@pytest.mark.asyncio
async def test_validate_form_ownership_and_status_auth_error():
    form = SimpleNamespace(id="f1")
    submission = SimpleNamespace(id="s1")
    user = SimpleNamespace(id="u2")
    db = FakeDB2(tuple_row=(form, submission, user))
    with pytest.raises(DummyError) as exc:
        await validate_form_ownership_and_status("f1", "s1", "u1", db, DummyError)
    assert exc.value.status_code == 401


@pytest.mark.asyncio
async def test_validate_form_ownership_and_status_missing_form():
    # First joined query returns None; subsequent form check returns None
    db = FakeDB2(tuple_row=None)
    # Patch second execute to return scalars with None via instance tweak
    db._scalars_obj = None
    with pytest.raises(DummyError) as exc:
        await validate_form_ownership_and_status("f1", "s1", "u1", db, DummyError)
    assert exc.value.status_code == 400


@pytest.mark.asyncio
async def test_validate_submission_ownership_interaction_not_found():
    db = FakeDB2(tuple_row=None)
    with pytest.raises(DummyError) as exc:
        await validate_submission_ownership_interaction("ia-1", db, DummyError)
    assert exc.value.status_code == 400


@pytest.mark.asyncio
async def test_sse_update_and_get_progress():
    tracker = SSEProgressTracker()
    await tracker.update_progress("sub-100", ProgressStatus.STARTED, "begin")
    prog = await tracker.get_progress("sub-100")
    assert prog["status"] == ProgressStatus.STARTED.value
    assert prog["message"] == "begin"


@pytest.mark.asyncio
async def test_sse_subscribe_receives_updates_and_completes():
    tracker = SSEProgressTracker()

    async def collect_stream():
        messages = []
        async for chunk in tracker.subscribe("sub-200"):
            messages.append(chunk)
            if '"success"' in chunk or '"status": "success"' in chunk:
                break
        return messages

    # Start the stream consumer
    task = asyncio.create_task(collect_stream())
    await tracker.update_progress("sub-200", ProgressStatus.STARTED, "started")
    await tracker.mark_complete("sub-200", True, "done")
    out = await task
    # Ensure at least one data chunk was received
    assert any("data:" in m for m in out)


@pytest.mark.asyncio
async def test_sse_keepalive_sent_in_stream():
    """Test that subscribe sends a keepalive in the stream."""
    tracker = SSEProgressTracker()

    # Collect initial messages (first data message + keepalive)
    async def collect_initial():
        agen = tracker.subscribe("sub-300")
        messages = []
        # The subscribe method sends 2 messages initially:
        # 1. A data: message (connection established or cached progress)
        # 2. A keepalive comment
        messages.append(await agen.__anext__())
        messages.append(await agen.__anext__())
        return messages

    messages = await asyncio.wait_for(collect_initial(), timeout=2.0)
    # Verify keepalive is among the initial messages
    assert any(": keepalive" in m for m in messages)


@pytest.mark.asyncio
async def test_sse_clear_progress_removes_data():
    """Test that clear_progress removes stored progress data."""
    tracker = SSEProgressTracker()
    # Prime progress
    await tracker.update_progress("sub-400", ProgressStatus.STARTED, "start")
    prog = await tracker.get_progress("sub-400")
    assert prog is not None
    assert prog["status"] == ProgressStatus.STARTED.value

    # Clear progress
    await tracker.clear_progress("sub-400")

    # Verify progress is cleared
    prog_after = await tracker.get_progress("sub-400")
    assert prog_after is None


@pytest.mark.asyncio
async def test_update_file_and_question_progress_helpers():
    tracker = SSEProgressTracker()
    await tracker.update_file_progress(
        "sub-500", "fileA", 0, 2, "running", "processing file"
    )
    prog = await tracker.get_progress("sub-500")
    assert prog["metadata"]["current_file"] == "fileA"
    await tracker.update_question_progress(
        "sub-500", "Q1", 0, 2, "running", "processing question"
    )
    prog2 = await tracker.get_progress("sub-500")
    assert prog2["metadata"]["current_question"] == "Q1"


@pytest.mark.asyncio
async def test_validate_form_not_completed_allows_in_progress():
    """Test that non-completed forms are allowed."""
    form = SimpleNamespace(id="f1", submission_id="s1", status=FormStatus.IN_PROGRESS)
    # Should not raise
    validate_form_not_completed(form, DummyError)


@pytest.mark.asyncio
async def test_validate_submission_ownership_interaction_success():
    """Test successful validation of interaction ownership."""
    interaction = SimpleNamespace(id="ia-1", submission_id="s1")
    submission = SimpleNamespace(id="s1", submitter_id="u1")
    user = SimpleNamespace(id="u1")

    db = FakeDB2(tuple_row=(interaction, submission, user))

    result_interaction, result_submission, result_user = (
        await validate_submission_ownership_interaction("ia-1", db, DummyError)
    )

    assert result_interaction.id == "ia-1"
    assert result_submission.id == "s1"
    assert result_user.id == "u1"


@pytest.mark.asyncio
async def test_validate_form_ownership_and_status_success():
    """Test successful validation of form ownership and status."""
    form = SimpleNamespace(id="f1", status=FormStatus.IN_PROGRESS)
    submission = SimpleNamespace(id="s1", submitter_id="u1")
    user = SimpleNamespace(id="u1")

    db = FakeDB2(tuple_row=(form, submission, user))

    result_form, result_submission = await validate_form_ownership_and_status(
        "f1", "s1", "u1", db, DummyError
    )


# Additional SSEProgressTracker tests
@pytest.mark.asyncio
async def test_sse_progress_tracker_init():
    """Test SSEProgressTracker initialization."""
    tracker = SSEProgressTracker()
    assert tracker._progress_store is not None
    assert tracker._subscribers is not None
    assert tracker._lock is not None


@pytest.mark.asyncio
async def test_sse_update_progress_with_step_numbers():
    """Test update_progress with step numbers."""
    tracker = SSEProgressTracker()
    await tracker.update_progress(
        "sub-600",
        ProgressStatus.PROCESSING_QUESTIONS,
        "Processing step 2 of 5",
        step_number=2,
        total_steps=5,
    )

    prog = await tracker.get_progress("sub-600")
    assert prog["status"] == ProgressStatus.PROCESSING_QUESTIONS.value
    assert prog["progress"]["step"] == 2
    assert prog["progress"]["total"] == 5
    assert prog["progress"]["percentage"] == 40.0


@pytest.mark.asyncio
async def test_sse_update_progress_with_metadata():
    """Test update_progress with custom metadata."""
    tracker = SSEProgressTracker()
    metadata = {"custom_key": "custom_value", "count": 42}
    await tracker.update_progress(
        "sub-700", ProgressStatus.STARTED, "Starting with metadata", metadata=metadata
    )

    prog = await tracker.get_progress("sub-700")
    assert prog["metadata"]["custom_key"] == "custom_value"
    assert prog["metadata"]["count"] == 42


@pytest.mark.asyncio
async def test_sse_mark_complete_success():
    """Test mark_complete with success=True."""
    tracker = SSEProgressTracker()
    await tracker.update_progress("sub-800", ProgressStatus.STARTED, "Started")
    await tracker.mark_complete("sub-800", success=True, message="All done!")

    prog = await tracker.get_progress("sub-800")
    assert prog["status"] == ProgressStatus.SUCCESS.value
    assert prog["message"] == "All done!"


@pytest.mark.asyncio
async def test_sse_mark_complete_failure():
    """Test mark_complete with success=False."""
    tracker = SSEProgressTracker()
    await tracker.update_progress("sub-801", ProgressStatus.STARTED, "Started")
    await tracker.mark_complete("sub-801", success=False, message="Failed!")

    prog = await tracker.get_progress("sub-801")
    assert prog["status"] == ProgressStatus.FAILED.value
    assert prog["message"] == "Failed!"


@pytest.mark.asyncio
async def test_sse_update_question_progress_with_valid_index():
    """Test update_question_progress with valid index values."""
    tracker = SSEProgressTracker()
    await tracker.update_question_progress(
        "sub-900",
        "Q1",
        question_index=0,
        total_questions=5,
        status="running",
        message="Processing question",
    )

    prog = await tracker.get_progress("sub-900")
    assert prog["metadata"]["current_question"] == "Q1"
    assert prog["metadata"]["question_index"] == 1  # 1-based display
    assert prog["metadata"]["total_questions"] == 5
    assert prog["metadata"]["question_progress_percentage"] == 20.0


@pytest.mark.asyncio
async def test_sse_static_key_methods():
    """Test static key generation methods."""
    progress_key = SSEProgressTracker._get_progress_key("test-submission-id")
    assert progress_key == "progress:test-submission-id"

    channel_key = SSEProgressTracker._get_channel_key("test-submission-id")
    assert channel_key == "progress_channel:test-submission-id"


@pytest.mark.asyncio
async def test_sse_get_progress_not_found():
    """Test get_progress returns None for unknown submission."""
    tracker = SSEProgressTracker()
    prog = await tracker.get_progress("nonexistent-submission")
    assert prog is None


@pytest.mark.asyncio
async def test_sse_clear_progress_nonexistent():
    """Test clear_progress handles nonexistent submission gracefully."""
    tracker = SSEProgressTracker()
    # Should not raise
    await tracker.clear_progress("nonexistent-submission")


def test_progress_status_enum_values():
    """Test ProgressStatus enum values."""
    assert ProgressStatus.PENDING.value == "pending"
    assert ProgressStatus.STARTED.value == "started"
    assert ProgressStatus.EXTRACTING_BLOCKS.value == "extracting_blocks"
    assert ProgressStatus.BLOCKS_EXTRACTED.value == "blocks_extracted"
    assert ProgressStatus.FETCHING_QUESTIONS.value == "fetching_questions"
    assert ProgressStatus.QUESTIONS_FETCHED.value == "questions_fetched"
    assert ProgressStatus.PROCESSING_QUESTIONS.value == "processing_questions"
    assert ProgressStatus.QUESTION_PROCESSED.value == "question_processed"
    assert ProgressStatus.STORING_RESULTS.value == "storing_results"
    assert ProgressStatus.SUCCESS.value == "success"
    assert ProgressStatus.FAILED.value == "failed"
    assert ProgressStatus.WARNING.value == "warning"
