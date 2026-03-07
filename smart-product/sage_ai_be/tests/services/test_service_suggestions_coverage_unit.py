import asyncio
import json
from uuid import uuid4, UUID
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from data_service.service.suggestions_coverage import SuggestionsCoverageService
from data_service.exceptions.service_errors import SuggestionsCoverageServiceError


class FakeCortex:
    def __init__(self):
        self.calls = []
        self.responses = []  # queue of responses (either str or raise)

    async def invoke_ask(self, model_name, prompt, **kwargs):  # noqa: D401
        self.calls.append((model_name, prompt))
        if not self.responses:
            return None
        nxt = self.responses.pop(0)
        if isinstance(nxt, Exception):
            raise nxt
        return nxt


class FakeQuestion:
    def __init__(self, id, question):
        self.id = id
        self.question = question


class FakeSuggestion:
    def __init__(self, question_id, suggestions):
        self.question_id = question_id
        self.suggestions = suggestions


class FakeCoverageScore:
    def __init__(self, submission_id, question_id, coverage_score):
        self.submission_id = submission_id
        self.question_id = question_id
        self.coverage_score = coverage_score


class FakeResult:
    def __init__(self, rows):
        self._rows = rows
        self._idx = 0

    def first(self):
        return self._rows[0] if self._rows else None

    def scalar_one_or_none(self):
        return self._rows[0] if self._rows else None


class FakeDB:
    def __init__(self):
        self.questions = {}
        self.suggestions = {}
        self.coverage_scores = {}
        self.committed = False
        self.rolled_back = False
        self.added_items = []

    async def execute(self, stmt):
        stmt_str = str(stmt).lower()

        if "questions" in stmt_str and "suggestions" in stmt_str:
            # JOIN query for check_coverage_for_question
            for q_id, question in self.questions.items():
                suggestion = self.suggestions.get(q_id)
                return FakeResult([(question, suggestion)])
            return FakeResult([])

        if (
            "suggestioncoveragescore" in stmt_str
            or "suggestion_coverage_score" in stmt_str
        ):
            # Query for save_coverage_scores - need to match WHERE clause
            # Extract submission_id and question_id from WHERE clause if possible
            # For now, return first match or None
            if self.coverage_scores:
                # Return first score (test only has one)
                return FakeResult([list(self.coverage_scores.values())[0]])
            return FakeResult([])

        return FakeResult([])

    def add(self, item):
        self.added_items.append(item)
        # If it's a coverage score, also store it in our dict for updates
        if hasattr(item, "submission_id") and hasattr(item, "question_id"):
            key = (item.submission_id, item.question_id)
            self.coverage_scores[key] = item

    async def commit(self):
        self.committed = True

    async def rollback(self):
        self.rolled_back = True


class FakeCacheManager:
    """Mock cache manager to simulate database lookups for questions and suggestions."""

    def __init__(self, questions=None, suggestions=None):
        self.questions = questions or {}
        self.suggestions = suggestions or {}

    async def get_question(self, question_id: str, db) -> FakeQuestion:
        return self.questions.get(question_id)

    async def get_suggestions(self, question_id: str, db) -> list:
        suggestion_obj = self.suggestions.get(question_id)
        if suggestion_obj is None:
            return None
        if isinstance(suggestion_obj, FakeSuggestion):
            return suggestion_obj.suggestions
        return suggestion_obj


run = asyncio.run


@pytest.mark.anyio
async def test_analyze_success_json_parsed(monkeypatch):
    svc = SuggestionsCoverageService()
    fake = FakeCortex()
    good_json = json.dumps(
        {
            "suggestions_analysis": [
                {"text": "impact", "rationale": "Found", "status": "completed"}
            ]
        }
    )
    fake.responses = [good_json]
    monkeypatch.setattr(svc, "cortex_client", fake)
    out = await svc.analyze_suggestions_coverage(
        "Describe", "This has impact", ["impact"]
    )
    assert out["suggestions_analysis"][0]["text"] == "impact"
    assert len(fake.calls) == 1


@pytest.mark.anyio
async def test_analyze_json_parse_failure_retry(monkeypatch):
    """Test that malformed JSON responses raise an error (no internal retries in analyze_suggestions_coverage)."""
    svc = SuggestionsCoverageService()
    fake = FakeCortex()
    # Malformed JSON response - implementation will fail to parse and raise error
    fake.responses = ["{bad json"]
    monkeypatch.setattr(svc, "cortex_client", fake)

    with pytest.raises(SuggestionsCoverageServiceError) as exc:
        await svc.analyze_suggestions_coverage("Q", "A", ["sug1", "sug2"])
    # Should fail on first attempt since no internal retry logic exists
    assert len(fake.calls) == 1
    assert exc.value.status_code in [400, 500]


@pytest.mark.anyio
async def test_analyze_empty_response_and_then_success(monkeypatch):
    """Test that empty/None response raises error (no internal retries)."""
    svc = SuggestionsCoverageService()
    fake = FakeCortex()
    # None response will raise error immediately
    fake.responses = [None]
    monkeypatch.setattr(svc, "cortex_client", fake)

    with pytest.raises(SuggestionsCoverageServiceError) as exc:
        await svc.analyze_suggestions_coverage("Q", "User text", ["val"])
    assert len(fake.calls) == 1
    assert "empty" in exc.value.message.lower() or exc.value.status_code == 500


@pytest.mark.anyio
async def test_analyze_api_errors(monkeypatch):
    """Test that API exceptions are handled and raised (no internal retries)."""
    svc = SuggestionsCoverageService()
    fake = FakeCortex()
    # Exception on first attempt - will be raised immediately
    fake.responses = [RuntimeError("boom1")]
    monkeypatch.setattr(svc, "cortex_client", fake)

    with pytest.raises(SuggestionsCoverageServiceError) as exc:
        await svc.analyze_suggestions_coverage("Q", "User text", ["x"])
    assert "unexpected" in str(exc.value).lower() or exc.value.status_code == 500
    # Only 1 call since implementation doesn't have internal retry logic
    assert len(fake.calls) == 1


@pytest.mark.anyio
async def test_analyze_outer_exception(monkeypatch):
    # Force outer except by raising before retries loop (e.g., suggestions None causing validation error)
    svc = SuggestionsCoverageService()
    fake = FakeCortex()
    monkeypatch.setattr(svc, "cortex_client", fake)
    with pytest.raises(SuggestionsCoverageServiceError) as exc:
        await svc.analyze_suggestions_coverage("Q", "User", None)  # type: ignore[arg-type]
    assert exc.value.status_code == 400
    # No calls because failure happened before invoke
    assert len(fake.calls) == 0


# Tests for check_coverage_for_question method (lines 62-169)
@pytest.mark.anyio
async def test_check_coverage_question_not_found(monkeypatch):
    svc = SuggestionsCoverageService()
    fake_db = FakeDB()
    # No questions in DB
    with pytest.raises(SuggestionsCoverageServiceError) as exc:
        await svc.check_coverage_for_question("Q1", "User text", uuid4(), fake_db)
    assert exc.value.status_code == 404
    assert "not found" in exc.value.message


@pytest.mark.anyio
async def test_check_coverage_no_suggestions(monkeypatch):
    """Test error when question exists but has no suggestions."""
    svc = SuggestionsCoverageService()
    fake_db = FakeDB()

    # Mock cache_manager to return question but no suggestions
    fake_cache = FakeCacheManager(
        questions={"Q1": FakeQuestion("Q1", "What is this?")},
        suggestions={"Q1": None},  # No suggestions
    )
    monkeypatch.setattr(svc, "cache_manager", fake_cache)

    with pytest.raises(SuggestionsCoverageServiceError) as exc:
        await svc.check_coverage_for_question("Q1", "User text", uuid4(), fake_db)
    assert exc.value.status_code == 404
    assert "No suggestions found" in exc.value.message


@pytest.mark.anyio
async def test_check_coverage_invalid_suggestions_format(monkeypatch):
    """Test error when suggestions have invalid format after sanitization."""
    svc = SuggestionsCoverageService()
    fake_db = FakeDB()

    # Mock cache_manager - suggestions that are not a list will be filtered out
    # The service sanitizes suggestions, so we provide empty strings that become invalid
    fake_cache = FakeCacheManager(
        questions={"Q1": FakeQuestion("Q1", "What is this?")},
        suggestions={"Q1": ["", "  ", None]},  # All invalid - will be filtered out
    )
    monkeypatch.setattr(svc, "cache_manager", fake_cache)

    with pytest.raises(SuggestionsCoverageServiceError) as exc:
        await svc.check_coverage_for_question("Q1", "User text", uuid4(), fake_db)
    # After sanitization, all suggestions are invalid -> 400 validation error
    assert exc.value.status_code == 400


@pytest.mark.anyio
async def test_check_coverage_success_with_ai_interaction_failure(monkeypatch):
    """Test successful coverage check even when AI interaction save fails."""
    svc = SuggestionsCoverageService()
    fake_cortex = FakeCortex()
    fake_db = FakeDB()

    # Mock cache_manager to return question and suggestions
    fake_cache = FakeCacheManager(
        questions={"Q1": FakeQuestion("Q1", "What is impact?")},
        suggestions={"Q1": ["impact", "value"]},
    )
    monkeypatch.setattr(svc, "cache_manager", fake_cache)

    good_json = json.dumps(
        {
            "suggestions_analysis": [
                {"text": "impact", "status": "completed", "rationale": "Found"},
                {"text": "value", "status": "required", "rationale": "Missing"},
            ],
            "score": 0.5,
        }
    )
    fake_cortex.responses = [good_json]

    monkeypatch.setattr(svc, "cortex_client", fake_cortex)

    # Mock create_ai_interaction to raise exception
    async def fake_create_ai_interaction(*args, **kwargs):
        raise RuntimeError("AI interaction save failed")

    import data_service.service.suggestions_coverage

    monkeypatch.setattr(
        data_service.service.suggestions_coverage,
        "create_ai_interaction",
        fake_create_ai_interaction,
    )

    # Should still succeed even if AI interaction fails
    result = await svc.check_coverage_for_question(
        "Q1", "This has impact", uuid4(), fake_db
    )

    assert len(result["completed_suggestions"]) == 1
    assert len(result["required_suggestions"]) == 1
    assert result["overall_score"] == 0.5
    assert result["interaction_id"] is None  # Failed to create


@pytest.mark.anyio
async def test_check_coverage_success_with_score(monkeypatch):
    """Test successful coverage check with score and AI interaction."""
    svc = SuggestionsCoverageService()
    fake_cortex = FakeCortex()
    fake_db = FakeDB()

    # Mock cache_manager to return question and suggestions
    fake_cache = FakeCacheManager(
        questions={"Q1": FakeQuestion("Q1", "What is impact?")},
        suggestions={"Q1": ["impact"]},
    )
    monkeypatch.setattr(svc, "cache_manager", fake_cache)

    good_json = json.dumps(
        {
            "suggestions_analysis": [
                {"text": "impact", "status": "completed", "rationale": "Found"}
            ],
            "score": 1.0,
        }
    )
    fake_cortex.responses = [good_json]

    monkeypatch.setattr(svc, "cortex_client", fake_cortex)

    # Mock create_ai_interaction to succeed
    class FakeInteraction:
        id = "interaction-123"

    async def fake_create_ai_interaction(*args, **kwargs):
        return FakeInteraction()

    import data_service.service.suggestions_coverage

    monkeypatch.setattr(
        data_service.service.suggestions_coverage,
        "create_ai_interaction",
        fake_create_ai_interaction,
    )

    result = await svc.check_coverage_for_question(
        "Q1", "This has impact", uuid4(), fake_db
    )

    assert len(result["completed_suggestions"]) == 1
    assert len(result["required_suggestions"]) == 0
    assert result["overall_score"] == 1.0
    assert result["interaction_id"] == "interaction-123"
    assert fake_db.committed


# Tests for analyze_suggestions_coverage validation (lines 198, 205-206, 229-230, 268)
@pytest.mark.anyio
async def test_analyze_empty_question_text():
    svc = SuggestionsCoverageService()
    with pytest.raises(SuggestionsCoverageServiceError) as exc:
        await svc.analyze_suggestions_coverage("", "User text", ["suggestion"])
    assert exc.value.status_code == 400
    assert "question_text cannot be empty" in exc.value.message


@pytest.mark.anyio
async def test_analyze_whitespace_question_text():
    svc = SuggestionsCoverageService()
    with pytest.raises(SuggestionsCoverageServiceError) as exc:
        await svc.analyze_suggestions_coverage("   ", "User text", ["suggestion"])
    assert exc.value.status_code == 400
    assert "question_text cannot be empty" in exc.value.message


@pytest.mark.anyio
async def test_analyze_empty_user_text():
    svc = SuggestionsCoverageService()
    with pytest.raises(SuggestionsCoverageServiceError) as exc:
        await svc.analyze_suggestions_coverage("Question?", "", ["suggestion"])
    assert exc.value.status_code == 400
    assert "User text cannot be empty" in exc.value.message


@pytest.mark.anyio
async def test_analyze_whitespace_user_text():
    svc = SuggestionsCoverageService()
    with pytest.raises(SuggestionsCoverageServiceError) as exc:
        await svc.analyze_suggestions_coverage("Question?", "   ", ["suggestion"])
    assert exc.value.status_code == 400
    assert "User text cannot be empty" in exc.value.message


@pytest.mark.anyio
async def test_analyze_empty_suggestions_list():
    svc = SuggestionsCoverageService()
    with pytest.raises(SuggestionsCoverageServiceError) as exc:
        await svc.analyze_suggestions_coverage("Question?", "User text", [])
    assert exc.value.status_code == 400
    assert "No suggestions available" in exc.value.message


@pytest.mark.anyio
async def test_analyze_all_empty_suggestions(monkeypatch):
    """Test that all empty suggestions raise validation error."""
    svc = SuggestionsCoverageService()
    with pytest.raises(SuggestionsCoverageServiceError) as exc:
        await svc.analyze_suggestions_coverage(
            "Question?", "User text", ["", "  ", None]
        )
    # Implementation returns 400 for validation errors
    assert exc.value.status_code == 400


# Tests for retry logic and error handling (lines 286, 300-305, 318-331)
@pytest.mark.anyio
async def test_analyze_no_json_in_response_retries(monkeypatch):
    """Test that response without JSON raises error (no internal retries)."""
    svc = SuggestionsCoverageService()
    fake = FakeCortex()
    # Response without JSON
    fake.responses = ["no json here"]
    monkeypatch.setattr(svc, "cortex_client", fake)

    with pytest.raises(SuggestionsCoverageServiceError) as exc:
        await svc.analyze_suggestions_coverage("Q", "User text", ["sug1"])
    # Only 1 call since implementation doesn't have internal retry logic
    assert len(fake.calls) == 1


@pytest.mark.anyio
async def test_analyze_suggestions_analysis_not_list(monkeypatch):
    """Test that suggestions_analysis as non-list raises error (no internal retries)."""
    svc = SuggestionsCoverageService()
    fake = FakeCortex()
    # Response with suggestions_analysis as non-list
    bad_json = json.dumps({"suggestions_analysis": "not a list"})
    fake.responses = [bad_json]
    monkeypatch.setattr(svc, "cortex_client", fake)

    with pytest.raises(SuggestionsCoverageServiceError) as exc:
        await svc.analyze_suggestions_coverage("Q", "User text", ["sug1"])
    # Only 1 call since implementation doesn't have internal retry logic
    assert len(fake.calls) == 1


@pytest.mark.anyio
async def test_analyze_missing_suggestions_analysis_field_retries(monkeypatch):
    """Test that missing suggestions_analysis field raises error."""
    svc = SuggestionsCoverageService()
    fake = FakeCortex()
    # Missing suggestions_analysis field
    fake.responses = [json.dumps({"other_field": "value"})]
    monkeypatch.setattr(svc, "cortex_client", fake)

    with pytest.raises(SuggestionsCoverageServiceError) as exc:
        await svc.analyze_suggestions_coverage("Q", "User text", ["x"])
    assert "suggestions_analysis" in exc.value.message.lower()
    assert len(fake.calls) == 1


@pytest.mark.anyio
async def test_analyze_json_decode_error_final_attempt(monkeypatch):
    """Test that malformed JSON raises error (no internal retries)."""
    svc = SuggestionsCoverageService()
    fake = FakeCortex()
    # Malformed JSON
    fake.responses = ["{bad"]
    monkeypatch.setattr(svc, "cortex_client", fake)

    with pytest.raises(SuggestionsCoverageServiceError) as exc:
        await svc.analyze_suggestions_coverage("Q", "User text", ["sug1"])
    # Only 1 call since implementation doesn't have internal retry logic
    assert len(fake.calls) == 1


# Tests for network errors with exponential backoff (lines 338-348)
@pytest.mark.anyio
async def test_analyze_network_timeout_retries(monkeypatch):
    """Test that network timeout raises error (no internal retries in service)."""
    import httpx

    svc = SuggestionsCoverageService()
    fake = FakeCortex()
    # Network timeout on first attempt - will be raised immediately
    fake.responses = [httpx.TimeoutException("timeout")]
    monkeypatch.setattr(svc, "cortex_client", fake)

    # Mock asyncio.sleep to avoid actual delays in tests
    async def fake_sleep(duration):
        pass

    monkeypatch.setattr(asyncio, "sleep", fake_sleep)

    with pytest.raises(SuggestionsCoverageServiceError) as exc:
        await svc.analyze_suggestions_coverage("Q", "User text", ["sug1"])
    assert exc.value.status_code in [500, 504]  # Server error or timeout
    # Only 1 call since internal retry logic was removed
    assert len(fake.calls) == 1


# Tests for save_coverage_scores (lines 398-467)
@pytest.mark.anyio
async def test_save_coverage_invalid_submission_id():
    svc = SuggestionsCoverageService()
    fake_db = FakeDB()

    with pytest.raises(SuggestionsCoverageServiceError) as exc:
        await svc.save_coverage_scores("not-a-uuid", "Q1", 0.5, fake_db)
    assert exc.value.status_code == 400
    assert "submission_id must be UUID" in exc.value.message


@pytest.mark.anyio
async def test_save_coverage_empty_question_id():
    svc = SuggestionsCoverageService()
    fake_db = FakeDB()

    with pytest.raises(SuggestionsCoverageServiceError) as exc:
        await svc.save_coverage_scores(uuid4(), "", 0.5, fake_db)
    assert exc.value.status_code == 400
    assert "question_id cannot be empty" in exc.value.message


@pytest.mark.anyio
async def test_save_coverage_whitespace_question_id():
    svc = SuggestionsCoverageService()
    fake_db = FakeDB()

    with pytest.raises(SuggestionsCoverageServiceError) as exc:
        await svc.save_coverage_scores(uuid4(), "   ", 0.5, fake_db)
    assert exc.value.status_code == 400
    assert "question_id cannot be empty" in exc.value.message


@pytest.mark.anyio
async def test_save_coverage_invalid_score_type():
    svc = SuggestionsCoverageService()
    fake_db = FakeDB()

    with pytest.raises(SuggestionsCoverageServiceError) as exc:
        await svc.save_coverage_scores(uuid4(), "Q1", "not-a-number", fake_db)
    assert exc.value.status_code == 400
    assert "score must be numeric" in exc.value.message


@pytest.mark.anyio
async def test_save_coverage_score_clamping():
    svc = SuggestionsCoverageService()

    # Test clamping - scores outside 0-1 range
    submission_id = uuid4()

    # Test score > 1.0 should be clamped to 1.0
    fake_db1 = FakeDB()
    await svc.save_coverage_scores(submission_id, "Q1", 1.5, fake_db1)
    assert fake_db1.committed
    assert len(fake_db1.added_items) == 1
    assert fake_db1.added_items[0].coverage_score == 1.0

    # Test score < 0.0 should be clamped to 0.0
    fake_db2 = FakeDB()
    await svc.save_coverage_scores(submission_id, "Q2", -0.5, fake_db2)
    assert fake_db2.committed
    assert len(fake_db2.added_items) == 1
    assert fake_db2.added_items[0].coverage_score == 0.0


@pytest.mark.anyio
async def test_save_coverage_create_new_score():
    svc = SuggestionsCoverageService()
    fake_db = FakeDB()

    submission_id = uuid4()

    # Create new score
    await svc.save_coverage_scores(submission_id, "Q1", 0.7, fake_db)

    assert fake_db.committed
    assert len(fake_db.added_items) == 1
    assert fake_db.added_items[0].coverage_score == 0.7
    assert fake_db.added_items[0].submission_id == submission_id
    assert fake_db.added_items[0].question_id == "Q1"


@pytest.mark.anyio
async def test_save_coverage_db_error_rollback(monkeypatch):
    svc = SuggestionsCoverageService()
    fake_db = FakeDB()

    # Force commit to raise exception
    async def failing_commit():
        raise RuntimeError("Database commit failed")

    monkeypatch.setattr(fake_db, "commit", failing_commit)

    with pytest.raises(SuggestionsCoverageServiceError) as exc:
        await svc.save_coverage_scores(uuid4(), "Q1", 0.5, fake_db)

    assert fake_db.rolled_back
    assert exc.value.status_code == 500
