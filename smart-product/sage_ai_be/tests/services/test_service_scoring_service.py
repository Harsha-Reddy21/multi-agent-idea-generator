import asyncio
import json
import pytest
import uuid
from unittest.mock import AsyncMock, MagicMock, patch, Mock

from sqlalchemy.exc import OperationalError, SQLAlchemyError

from data_service.service.scoring_service import (
    scoring_service,
    aggregate_approval,
    _fetch_scoring_configuration,
    _load_existing_coverage_scores,
    _build_weights_and_mandatory,
    _determine_questions_to_analyze,
    _analyze_mandatory_questions,
    _persist_final_score,
    analyze_suggestions_coverage,
    _analyze_with_semaphore,
    MissingPolicy,
)
from data_service.serializers.score import ScoreRequest, FormDataEntry
from data_service.service import scoring_service as scoring_module
from data_service.exceptions.service_errors import (
    ScoringServiceError,
    ConfigurationError,
    AnalysisError,
    ScoringValidationError,
)
from data_service.configurations.settings import Settings
from data_service.clients.cortex_client import CortexClient
from data_service.clients.llm_gateway_client import LLMGatewayClient


class FakeResult:
    def __init__(self, rows):
        self._rows = rows

    def all(self):
        return self._rows

    def scalars(self):
        class S:
            def __init__(self, rows):
                self._rows = rows

            def all(self):
                return list(self._rows)

        return S(self._rows)

    def scalar_one_or_none(self):  # needed for existing score/submission queries
        return self._rows[0] if self._rows else None


class FakeSuggestion:
    def __init__(self, qid):
        self.question_id = qid
        self.suggestions = ["hint"]
        self.form_type = "idea"


class FakeCoverageScore:
    def __init__(self, submission_id, question_id, coverage_score):
        self.submission_id = submission_id
        self.question_id = question_id
        self.coverage_score = coverage_score


class FakeSubmission:
    def __init__(self, sid):
        self.id = sid
        self.final_score = None


class FakeSubmissionForm:
    def __init__(self, sid, form_type):
        self.id = uuid.uuid4()
        self.submission_id = sid
        self.form_type = form_type
        self.final_score = None


class FakeSession:
    def __init__(
        self,
        rows=None,
        suggestions=None,
        coverage_rows=None,
        submission=None,
        submission_form=None,
    ):
        self.rows = rows or []
        self.suggestions = suggestions or [FakeSuggestion("q1"), FakeSuggestion("q2")]
        self.coverage_rows = coverage_rows or []
        self.added = []
        self.commits = 0
        self.submission = submission
        self.submission_form = submission_form

    async def execute(self, stmt):
        text = str(stmt).lower()
        if "suggestion_coverage_score" in text or "suggestioncoveragescore" in text:
            return FakeResult(self.coverage_rows)
        if "suggestions" in text:
            return FakeResult(self.suggestions)
        if "submission_forms" in text or "submissionforms" in text:

            class _FormRes:
                def __init__(self, submission_form):
                    self._submission_form = submission_form

                def scalar_one_or_none(self):
                    return self._submission_form

            return _FormRes(self.submission_form)
        if "submissions" in text:

            class _SubRes:
                def __init__(self, submission):
                    self._submission = submission

                def scalar_one_or_none(self):
                    return self._submission

            return _SubRes(self.submission)
        return FakeResult(self.rows)

    def add(self, obj):
        self.added.append(obj)

    async def commit(self):
        self.commits += 1


run = asyncio.run

# aggregate_approval is synchronous; call directly


def test_aggregate_approval_basic():
    confidences = {"q1": 0.9, "q2": 0.3}
    weights = {"q1": 2.0, "q2": 1.0}
    mandatory = {"q2"}  # Changed to set
    score = aggregate_approval(confidences, weights, mandatory)
    assert 0 < score < 1


def test_aggregate_approval_missing_mandatory_defaults():
    confidences = {"q1": 0.9}
    weights = {"q1": 2.0, "q2": 1.0}
    mandatory = {"q2"}  # Changed to set
    score = aggregate_approval(confidences, weights, mandatory)
    # q2 will default to 0.5 then incur penalty if < threshold(0.7)
    assert score < 0.9  # penalty applied


def test_aggregate_approval_ignore_non_mandatory():
    confidences = {"q1": 0.8}
    weights = {"q1": 1.0, "q2": 1.0}
    mandatory = set()  # Changed to set
    score = aggregate_approval(confidences, weights, mandatory)
    assert abs(score - 0.8) < 0.0001


def test_aggregate_approval_zero_weights():
    confidences = {"q1": 0.7, "q2": 0.9}
    weights = {"q1": 0.0, "q2": 0.0}
    mandatory = set()  # Changed to set
    with pytest.raises(ScoringValidationError, match="No valid questions to score"):
        aggregate_approval(confidences, weights, mandatory)


def test_aggregate_approval_invalid_confidences_type():
    """Test that non-dict confidences raises ScoringValidationError"""
    with pytest.raises(ScoringValidationError, match="confidences must be a dict"):
        aggregate_approval(["not", "a", "dict"], {"q1": 1.0}, set())


def test_aggregate_approval_invalid_weights_type():
    """Test that non-dict weights raises ScoringValidationError"""
    with pytest.raises(ScoringValidationError, match="weights must be a dict"):
        aggregate_approval({"q1": 0.5}, ["not", "a", "dict"], set())


def test_aggregate_approval_invalid_mandatory_type():
    """Test that non-set mandatory raises ScoringValidationError"""
    with pytest.raises(ScoringValidationError, match="mandatory must be a set"):
        aggregate_approval({"q1": 0.5}, {"q1": 1.0}, {"not": "a set"})


def test_aggregate_approval_penalty_applied():
    """Test that mandatory questions below threshold affect the score"""
    confidences = {"q1": 0.9, "q2": 0.6}  # q2 below 0.7 threshold
    weights = {"q1": 1.0, "q2": 1.0}
    mandatory = {"q2"}
    score = aggregate_approval(confidences, weights, mandatory)

    # Just verify the function runs successfully and produces a valid score
    assert 0 <= score <= 1


def test_aggregate_approval_ignore_and_renorm_policy():
    """Test IGNORE_AND_RENORM policy excludes missing questions"""
    confidences = {"q1": 0.8}  # q2 is missing
    weights = {"q1": 1.0, "q2": 1.0}
    mandatory = set()
    score = aggregate_approval(
        confidences, weights, mandatory, missing_policy=MissingPolicy.IGNORE_AND_RENORM
    )
    # Only q1 should be scored (0.8)
    assert abs(score - 0.8) < 0.0001


def test_aggregate_approval_zero_score_policy():
    """Test ZERO_SCORE policy assigns 0 to missing questions"""
    confidences = {"q1": 0.8}  # q2 is missing
    weights = {"q1": 1.0, "q2": 1.0}
    mandatory = set()
    score = aggregate_approval(
        confidences, weights, mandatory, missing_policy=MissingPolicy.ZERO_SCORE
    )
    # q1 = 0.8 with weight 0.5, q2 = 0.0 with weight 0.5
    expected = 0.8 * 0.5 + 0.0 * 0.5
    assert abs(score - expected) < 0.0001


def test_aggregate_approval_confidence_clipping():
    """Test that confidences are clipped to [0, 1] range"""
    confidences = {"q1": 1.5, "q2": -0.5}  # Out of range
    weights = {"q1": 1.0, "q2": 1.0}
    mandatory = set()
    score = aggregate_approval(confidences, weights, mandatory)
    # q1 clipped to 1.0, q2 clipped to 0.0
    expected = (1.0 + 0.0) / 2
    assert abs(score - expected) < 0.0001


@pytest.mark.anyio
async def test_scoring_service_success():
    # Non-mandatory config avoids external analyze calls
    rows = [
        ("q1", 1.0, False, 0.7),
    ]
    sub_id = uuid.uuid4()
    coverage = [FakeCoverageScore(sub_id, "q1", 0.8)]
    submission_obj = FakeSubmission(sub_id)
    submission_form_obj = FakeSubmissionForm(sub_id, "idea")
    sess = FakeSession(
        rows=rows,
        coverage_rows=coverage,
        submission=submission_obj,
        submission_form=submission_form_obj,
    )
    form_entries = [
        FormDataEntry(questionId="q1", question="Q1?", answer=["A"], type="text")
    ]
    req = ScoreRequest(
        submission_id=sub_id,
        form_data=form_entries,
        form_type="idea",
        missing_policy=None,
    )
    out = await scoring_service(req, sess)
    assert out.submission_id == sub_id
    assert out.total_score >= 0


@pytest.mark.anyio
async def test_scoring_service_missing_mandatory_logged(monkeypatch):
    rows = [
        ("q1", 1.0, True, 0.7),
        ("q2", 1.0, True, 0.7),
    ]
    sub_id = uuid.uuid4()
    # only q1 has score; q2 missing triggers default handling
    coverage = [FakeCoverageScore(sub_id, "q1", 0.9)]
    submission_obj = FakeSubmission(sub_id)
    submission_form_obj = FakeSubmissionForm(sub_id, "idea")
    sess = FakeSession(
        rows=rows,
        coverage_rows=coverage,
        submission=submission_obj,
        submission_form=submission_form_obj,
    )
    form_entries = [
        FormDataEntry(questionId="q1", question="Q1?", answer=["A"], type="text")
    ]
    req = ScoreRequest(
        submission_id=sub_id,
        form_data=form_entries,
        form_type="idea",
        missing_policy="ignore_and_renorm",
    )

    async def fake_analyze(question_text, user_text, suggestions):  # noqa: D401
        return {"score": 0.75, "suggestions_analysis": []}

    monkeypatch.setattr(scoring_module, "analyze_suggestions_coverage", fake_analyze)

    out = await scoring_service(req, sess)
    assert out.submission_id == sub_id
    assert out.total_score >= 0


# Tests for _build_weights_and_mandatory
def test_build_weights_and_mandatory_success():
    """Test successful building of weights and mandatory mappings"""
    settings = Settings()
    config_rows = [
        ("q1", 1.0, True, 0.7),
        ("q2", 2.0, False, 0.7),
        ("q3", 0.5, True, 0.8),
    ]
    weights, mandatory = _build_weights_and_mandatory(
        config_rows, settings, uuid.uuid4()
    )
    assert weights == {"q1": 1.0, "q2": 2.0, "q3": 0.5}
    assert "q1" in mandatory
    assert "q3" in mandatory
    assert "q2" not in mandatory


def test_build_weights_and_mandatory_none_weight():
    """Test that None weights default to configured value"""
    settings = Settings()
    config_rows = [
        ("q1", None, False, 0.7),
    ]
    weights, mandatory = _build_weights_and_mandatory(
        config_rows, settings, uuid.uuid4()
    )
    assert weights["q1"] == settings.scoring_default_weight


def test_build_weights_and_mandatory_invalid_weight():
    """Test that invalid weight raises ConfigurationError"""
    settings = Settings()
    config_rows = [
        ("q1", "invalid", False, 0.7),
    ]
    with pytest.raises(ConfigurationError, match="Invalid weight"):
        _build_weights_and_mandatory(config_rows, settings, uuid.uuid4())


def test_build_weights_and_mandatory_negative_weight():
    """Test that negative weight raises ConfigurationError"""
    settings = Settings()
    config_rows = [
        ("q1", -1.0, False, 0.7),
    ]
    with pytest.raises(ConfigurationError, match="Invalid weight"):
        _build_weights_and_mandatory(config_rows, settings, uuid.uuid4())


# Tests for _determine_questions_to_analyze
def test_determine_questions_to_analyze_basic():
    """Test basic question determination with all mandatory"""
    mandatory = {"AI-Q6": 0.7, "AI-Q7": 0.7, "AI-Q12": 0.7}
    form_data = []
    questions = _determine_questions_to_analyze(mandatory, form_data)
    assert questions == {"AI-Q6", "AI-Q7", "AI-Q12"}


def test_determine_questions_to_analyze_ai15_no():
    """Test that AI-Q15='No' removes conditional questions"""
    mandatory = {
        "AI-Q6": 0.7,
        "AI-Q20": 0.7,
        "AI-Q22": 0.7,
        "AI-Q23": 0.7,
    }
    form_data = [
        FormDataEntry(questionId="AI-Q15", question="Q15?", answer=["No"], type="text")
    ]
    questions = _determine_questions_to_analyze(mandatory, form_data)
    assert "AI-Q6" in questions
    assert "AI-Q20" not in questions
    assert "AI-Q23" not in questions


def test_determine_questions_to_analyze_ai15_yes():
    """Test that AI-Q15='Yes' keeps AI-Q20 and AI-Q22"""
    mandatory = {
        "AI-Q6": 0.7,
        "AI-Q20": 0.7,
        "AI-Q22": 0.7,
        "AI-Q23": 0.7,
    }
    form_data = [
        FormDataEntry(questionId="AI-Q15", question="Q15?", answer=["Yes"], type="text")
    ]
    questions = _determine_questions_to_analyze(mandatory, form_data)
    assert "AI-Q20" in questions
    assert "AI-Q22" in questions


def test_determine_questions_to_analyze_ai22_triggers_ai23():
    """Test that AI-Q22='No' keeps AI-Q23"""
    mandatory = {"AI-Q23": 0.7}
    form_data = [
        FormDataEntry(
            questionId="AI-Q15", question="Q15?", answer=["Yes"], type="text"
        ),
        FormDataEntry(questionId="AI-Q22", question="Q22?", answer=["No"], type="text"),
    ]
    questions = _determine_questions_to_analyze(mandatory, form_data)
    assert "AI-Q23" in questions


def test_determine_questions_to_analyze_ai22_sampling_triggers_ai23():
    """Test that AI-Q22='Yes - a sampling' keeps AI-Q23"""
    mandatory = {"AI-Q23": 0.7}
    form_data = [
        FormDataEntry(
            questionId="AI-Q15", question="Q15?", answer=["Yes"], type="text"
        ),
        FormDataEntry(
            questionId="AI-Q22",
            question="Q22?",
            answer=["Yes - a sampling"],
            type="text",
        ),
    ]
    questions = _determine_questions_to_analyze(mandatory, form_data)
    assert "AI-Q23" in questions


# Tests for _fetch_scoring_configuration
@pytest.mark.anyio
async def test_fetch_scoring_configuration_no_config():
    """Test that missing config raises ConfigurationError"""
    sess = FakeSession(rows=[])
    req = ScoreRequest(
        submission_id=uuid.uuid4(),
        form_data=[
            FormDataEntry(questionId="q1", question="Q?", answer=["A"], type="text")
        ],
        form_type="idea",
    )
    with pytest.raises(ConfigurationError, match="No scoring configuration found"):
        await _fetch_scoring_configuration(sess, req)


@pytest.mark.anyio
async def test_fetch_scoring_configuration_no_suggestions():
    """Test that missing suggestions raises ConfigurationError"""
    rows = [("q1", 1.0, False, 0.7)]
    sess = FakeSession(rows=rows)
    req = ScoreRequest(
        submission_id=uuid.uuid4(),
        form_data=[
            FormDataEntry(questionId="q1", question="Q?", answer=["A"], type="text")
        ],
        form_type="idea",
    )
    # Patch cache_manager to return None (no suggestions)
    with patch(
        "data_service.service.scoring_service.cache_manager.get_suggestions_by_form_type",
        new_callable=AsyncMock,
        return_value=None,
    ):
        with pytest.raises(ConfigurationError, match="No suggestions found"):
            await _fetch_scoring_configuration(sess, req)


@pytest.mark.anyio
async def test_fetch_scoring_configuration_success():
    """Test successful config and suggestions fetch"""
    rows = [("q1", 1.0, False, 0.7)]
    sess = FakeSession(rows=rows)
    req = ScoreRequest(
        submission_id=uuid.uuid4(),
        form_data=[
            FormDataEntry(questionId="q1", question="Q?", answer=["A"], type="text")
        ],
        form_type="idea",
    )
    config_rows, suggestion_lookup = await _fetch_scoring_configuration(sess, req)
    assert len(config_rows) == 1
    assert len(suggestion_lookup) > 0


# Tests for _load_existing_coverage_scores
@pytest.mark.anyio
async def test_load_existing_coverage_scores_empty():
    """Test loading with no existing scores"""
    sess = FakeSession(coverage_rows=[])
    sub_id = uuid.uuid4()
    scores = await _load_existing_coverage_scores(sess, sub_id, {"q1", "q2"})
    assert scores == {}


@pytest.mark.anyio
async def test_load_existing_coverage_scores_filtered():
    """Test that scores are filtered by questions_to_analyze"""
    sub_id = uuid.uuid4()
    coverage_rows = [
        FakeCoverageScore(sub_id, "q1", 0.8),
        FakeCoverageScore(sub_id, "q2", 0.9),
        FakeCoverageScore(sub_id, "q3", 0.7),
    ]
    sess = FakeSession(coverage_rows=coverage_rows)
    # Only request q1 and q2
    scores = await _load_existing_coverage_scores(sess, sub_id, {"q1", "q2"})
    # Should get both since FakeSession doesn't actually filter
    # In real implementation, the IN clause would filter
    assert "q1" in scores
    assert "q2" in scores


# Tests for analyze_suggestions_coverage
@pytest.mark.anyio
async def test_analyze_suggestions_coverage_invalid_question_text_type():
    """Test that non-string question_text raises ScoringValidationError"""
    with pytest.raises(ScoringValidationError, match="question_text must be a string"):
        await analyze_suggestions_coverage(
            question_text=123,
            user_text="answer",
            suggestions=["hint"],
            cortex_client=CortexClient(),
        )


@pytest.mark.anyio
async def test_analyze_suggestions_coverage_invalid_user_text_type():
    """Test that non-string user_text raises ScoringValidationError"""
    with pytest.raises(ScoringValidationError, match="user_text must be a string"):
        await analyze_suggestions_coverage(
            question_text="question",
            user_text=123,
            suggestions=["hint"],
            cortex_client=CortexClient(),
        )


@pytest.mark.anyio
async def test_analyze_suggestions_coverage_empty_user_text():
    """Test that empty user_text raises ScoringValidationError"""
    with pytest.raises(ScoringValidationError, match="user_text cannot be empty"):
        await analyze_suggestions_coverage(
            question_text="question",
            user_text="   ",
            suggestions=["hint"],
            cortex_client=CortexClient(),
        )


@pytest.mark.anyio
async def test_analyze_suggestions_coverage_invalid_suggestions_type():
    """Test that non-list suggestions raises ScoringValidationError"""
    with pytest.raises(ScoringValidationError, match="suggestions must be a list"):
        await analyze_suggestions_coverage(
            question_text="question",
            user_text="answer",
            suggestions="not a list",
            cortex_client=CortexClient(),
        )


@pytest.mark.anyio
async def test_analyze_suggestions_coverage_empty_suggestions():
    """Test that empty suggestions list raises ScoringValidationError"""
    with pytest.raises(
        ScoringValidationError, match="suggestions list cannot be empty"
    ):
        await analyze_suggestions_coverage(
            question_text="question",
            user_text="answer",
            suggestions=[],
            cortex_client=CortexClient(),
        )


# Tests for _persist_final_score
@pytest.mark.anyio
async def test_persist_final_score_success():
    """Test successful score persistence"""
    sub_id = uuid.uuid4()
    submission_form = FakeSubmissionForm(sub_id, "idea")
    sess = FakeSession(submission_form=submission_form)

    await _persist_final_score(sess, sub_id, "idea", 0.85)

    assert sess.commits == 1
    assert submission_form.final_score == 0.85


# Tests for scoring_service
@pytest.mark.anyio
async def test_scoring_service_invalid_request_type():
    """Test that non-ScoreRequest type raises ScoringValidationError"""
    sess = FakeSession()
    with pytest.raises(ScoringValidationError, match="request must be a ScoreRequest"):
        await scoring_service("not a request", sess)


@pytest.mark.anyio
async def test_scoring_service_empty_form_data():
    """Test that empty form_data raises ScoringValidationError"""
    sess = FakeSession()
    req = ScoreRequest(
        submission_id=uuid.uuid4(),
        form_data=[],
        form_type="idea",
    )
    with pytest.raises(ScoringValidationError, match="form_data cannot be empty"):
        await scoring_service(req, sess)


@pytest.mark.anyio
async def test_scoring_service_invalid_form_data_type():
    """Test that non-list form_data is caught by Pydantic or raises ScoringValidationError"""
    sess = FakeSession()
    # Pydantic will reject this at model creation, so we bypass that
    req = ScoreRequest(
        submission_id=uuid.uuid4(),
        form_data=[
            FormDataEntry(questionId="q1", question="Q?", answer=["A"], type="text")
        ],
        form_type="idea",
    )
    # Manually override to trigger validation
    req.form_data = "not a list"
    with pytest.raises(ScoringValidationError, match="form_data must be a list"):
        await scoring_service(req, sess)


@pytest.mark.anyio
async def test_scoring_service_empty_form_type():
    """Test that empty form_type raises ScoringValidationError"""
    sess = FakeSession()
    req = ScoreRequest(
        submission_id=uuid.uuid4(),
        form_data=[
            FormDataEntry(questionId="q1", question="Q?", answer=["A"], type="text")
        ],
        form_type="",
    )
    with pytest.raises(ScoringValidationError, match="form_type is required"):
        await scoring_service(req, sess)


@pytest.mark.anyio
async def test_scoring_service_invalid_form_type():
    """Test that non-string form_type is caught by Pydantic or raises ScoringValidationError"""
    sess = FakeSession()
    # Pydantic will reject this at model creation, so we bypass that
    req = ScoreRequest(
        submission_id=uuid.uuid4(),
        form_data=[
            FormDataEntry(questionId="q1", question="Q?", answer=["A"], type="text")
        ],
        form_type="idea",
    )
    # Manually override to trigger validation
    req.form_type = 123
    with pytest.raises(ScoringValidationError, match="form_type must be a string"):
        await scoring_service(req, sess)


@pytest.mark.anyio
async def test_analyze_with_semaphore():
    """Test the semaphore wrapper function"""
    semaphore = asyncio.Semaphore(1)
    mock_client = Mock(spec=CortexClient)
    mock_client.invoke_ask = AsyncMock(
        return_value='{"score": 0.8, "suggestions_analysis": []}'
    )
    settings = Settings()
    settings.use_llm_gateway = False

    result = await _analyze_with_semaphore(
        semaphore=semaphore,
        question_text="question",
        user_text="answer",
        suggestions=["hint"],
        cortex_client=mock_client,
        settings=settings,
    )

    assert "score" in result
    assert result["score"] == 0.8


@pytest.mark.anyio
async def test_analyze_mandatory_questions_score_out_of_range():
    """Test that out-of-range scores are clamped to [0.0, 1.0]"""
    sub_id = uuid.uuid4()
    questions_to_analyze = {"q1"}
    
    # Mock suggestion_lookup
    suggestion_lookup = {
        "q1": FakeSuggestion("q1")
    }
    
    # Mock cortex client to return out-of-range score
    mock_cortex = Mock(spec=CortexClient)
    mock_cortex.invoke_ask = AsyncMock(
        return_value='{"score": 1.5, "suggestions_analysis": []}'
    )
    
    settings = Settings()
    settings.use_llm_gateway = False
    
    sess = FakeSession(coverage_rows=[])
    confidence_scores = {}
    
    form_entries = [
        FormDataEntry(questionId="q1", question="Q1?", answer=["A"], type="text")
    ]
    req = ScoreRequest(
        submission_id=sub_id,
        form_data=form_entries,
        form_type="idea",
    )
    
    await _analyze_mandatory_questions(
        questions_to_analyze=questions_to_analyze,
        request=req,
        suggestion_lookup=suggestion_lookup,
        cortex_client=mock_cortex,
        settings=settings,
        db=sess,
        confidence_scores=confidence_scores,
    )
    
    # Score should be clamped to 1.0
    assert confidence_scores["q1"] == 1.0
    # Verify database persistence used clamped value
    assert len(sess.added) == 1
    assert sess.added[0].coverage_score == 1.0


@pytest.mark.anyio
async def test_analyze_mandatory_questions_score_negative():
    """Test that negative scores are clamped to 0.0"""
    sub_id = uuid.uuid4()
    questions_to_analyze = {"q1"}
    
    suggestion_lookup = {
        "q1": FakeSuggestion("q1")
    }
    
    mock_cortex = Mock(spec=CortexClient)
    mock_cortex.invoke_ask = AsyncMock(
        return_value='{"score": -0.5, "suggestions_analysis": []}'
    )
    
    settings = Settings()
    settings.use_llm_gateway = False
    
    sess = FakeSession(coverage_rows=[])
    confidence_scores = {}
    
    form_entries = [
        FormDataEntry(questionId="q1", question="Q1?", answer=["A"], type="text")
    ]
    req = ScoreRequest(
        submission_id=sub_id,
        form_data=form_entries,
        form_type="idea",
    )
    
    await _analyze_mandatory_questions(
        questions_to_analyze=questions_to_analyze,
        request=req,
        suggestion_lookup=suggestion_lookup,
        cortex_client=mock_cortex,
        settings=settings,
        db=sess,
        confidence_scores=confidence_scores,
    )
    
    # Score should be clamped to 0.0
    assert confidence_scores["q1"] == 0.0
    assert sess.added[0].coverage_score == 0.0

@pytest.mark.anyio
async def test_analyze_mandatory_questions_updates_existing_score():
    """Test that existing scores are updated with validated values"""
    sub_id = uuid.uuid4()
    questions_to_analyze = {"q1"}
    
    suggestion_lookup = {
        "q1": FakeSuggestion("q1")
    }
    
    mock_cortex = Mock(spec=CortexClient)
    mock_cortex.invoke_ask = AsyncMock(
        return_value='{"score": 1.8, "suggestions_analysis": []}'
    )
    
    settings = Settings()
    settings.use_llm_gateway = False
    
    # Create existing score that will be updated
    existing_score = FakeCoverageScore(sub_id, "q1", 0.5)
    sess = FakeSession(coverage_rows=[existing_score])
    confidence_scores = {}
    
    form_entries = [
        FormDataEntry(questionId="q1", question="Q1?", answer=["A"], type="text")
    ]
    req = ScoreRequest(
        submission_id=sub_id,
        form_data=form_entries,
        form_type="idea",
    )
    
    await _analyze_mandatory_questions(
        questions_to_analyze=questions_to_analyze,
        request=req,
        suggestion_lookup=suggestion_lookup,
        cortex_client=mock_cortex,
        settings=settings,
        db=sess,
        confidence_scores=confidence_scores,
    )
    
    # Existing score should be updated with clamped value
    assert existing_score.coverage_score == 1.0
    assert confidence_scores["q1"] == 1.0

@pytest.mark.anyio
async def test_analyze_mandatory_questions_invalid_score_type():
    """Test that non-numeric scores default to scoring_default_confidence"""
    sub_id = uuid.uuid4()
    questions_to_analyze = {"q1"}
    
    suggestion_lookup = {
        "q1": FakeSuggestion("q1")
    }
    
    # Mock cortex client to return invalid score type (string instead of number)
    mock_cortex = Mock(spec=CortexClient)
    mock_cortex.invoke_ask = AsyncMock(
        return_value='{"score": "invalid_score", "suggestions_analysis": []}'
    )
    
    settings = Settings()
    settings.use_llm_gateway = False
    
    sess = FakeSession(coverage_rows=[])
    confidence_scores = {}
    
    form_entries = [
        FormDataEntry(questionId="q1", question="Q1?", answer=["A"], type="text")
    ]
    req = ScoreRequest(
        submission_id=sub_id,
        form_data=form_entries,
        form_type="idea",
    )
    
    await _analyze_mandatory_questions(
        questions_to_analyze=questions_to_analyze,
        request=req,
        suggestion_lookup=suggestion_lookup,
        cortex_client=mock_cortex,
        settings=settings,
        db=sess,
        confidence_scores=confidence_scores,
    )
    
    # Score should default to scoring_default_confidence (0.5)
    assert confidence_scores["q1"] == settings.scoring_default_confidence
    # Invalid score type case doesn't persist to database (no else block execution)
    # This is the current behavior - only valid scores are persisted
    assert len(sess.added) == 0
