import uuid
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi import HTTPException

from data_service.service.ai_feedback import AIFeedbackService
from data_service.exceptions import AIFeedbackServiceError


@pytest.fixture
def mock_db():
    db = AsyncMock()
    db.execute = AsyncMock()
    db.commit = AsyncMock()
    db.add = MagicMock()
    db.flush = AsyncMock()
    db.refresh = AsyncMock()
    db.rollback = AsyncMock()
    return db


class DummyResult:
    def __init__(self, rows):
        self._rows = rows

    def first(self):
        return self._rows[0] if self._rows else None

    def all(self):
        return self._rows


class FakeUser:
    def __init__(self, user_id="user123", email="test@example.com"):
        self.id = user_id
        self.email = email


class FakeSubmission:
    def __init__(self, submission_id=None, user_id="user123"):
        self.id = submission_id or uuid.uuid4()
        self.user_id = user_id


class FakeQuestion:
    def __init__(self, question_id="AI-001", question_text="Test question?"):
        self.id = question_id
        self.question = question_text


class FakeFormSchema:
    def __init__(self, form_type="ai-registry-form", is_active=True):
        self.form_type = form_type
        self.is_active = is_active


class FakeAIInteraction:
    def __init__(
        self,
        interaction_id=None,
        submission_id=None,
        question_id="AI-001",
        is_accepted=None,
    ):
        self.id = interaction_id or uuid.uuid4()
        self.submission_id = submission_id or uuid.uuid4()
        self.question_id = question_id
        self.is_accepted = is_accepted


class FakeAIFeedback:
    def __init__(self, feedback_id=None, interaction_id=None, feedback_type="like"):
        self.id = feedback_id or uuid.uuid4()
        self.interaction_id = interaction_id or uuid.uuid4()
        self.feedback_type = feedback_type
        self.feedback_tags = []
        self.user_comment = None


class FakeValidationRow:
    def __init__(
        self,
        schema_form_type=None,
        schema_is_active=None,
        submission_id=None,
        question_id=None,
    ):
        self.schema_form_type = schema_form_type
        self.schema_is_active = schema_is_active
        self.submission_id = submission_id
        self.question_id = question_id


def test_service_initialization(mock_db):
    service = AIFeedbackService(mock_db)
    assert service.db == mock_db


@pytest.mark.asyncio
async def test_validate_entities_batch_success(mock_db):
    service = AIFeedbackService(mock_db)
    submission_id = uuid.uuid4()
    question_id = "AI-001"

    validation_row = FakeValidationRow(
        schema_form_type="ai-registry-form",
        schema_is_active=True,
        submission_id=submission_id,
        question_id=question_id,
    )
    mock_db.execute.return_value = DummyResult([validation_row])

    await service._validate_entities_batch(
        submission_id, question_id, "ai-registry-form"
    )
    assert mock_db.execute.called


@pytest.mark.asyncio
async def test_validate_entities_batch_invalid_form_type(mock_db):
    service = AIFeedbackService(mock_db)
    submission_id = uuid.uuid4()

    mock_db.execute.return_value = DummyResult([])

    with pytest.raises(HTTPException) as exc_info:
        await service._validate_entities_batch(submission_id, "AI-001", "invalid-form")

    assert exc_info.value.status_code == 400
    assert "Invalid form type" in exc_info.value.detail


@pytest.mark.asyncio
async def test_validate_entities_batch_submission_not_found(mock_db):
    service = AIFeedbackService(mock_db)
    submission_id = uuid.uuid4()

    validation_row = FakeValidationRow(
        schema_form_type="ai-registry-form",
        schema_is_active=True,
        submission_id=None,
        question_id="AI-001",
    )
    mock_db.execute.return_value = DummyResult([validation_row])

    with pytest.raises(HTTPException) as exc_info:
        await service._validate_entities_batch(
            submission_id, "AI-001", "ai-registry-form"
        )

    assert exc_info.value.status_code == 404
    assert "Submission" in exc_info.value.detail


@pytest.mark.asyncio
async def test_validate_entities_batch_question_not_found(mock_db):
    service = AIFeedbackService(mock_db)
    submission_id = uuid.uuid4()

    validation_row = FakeValidationRow(
        schema_form_type="ai-registry-form",
        schema_is_active=True,
        submission_id=submission_id,
        question_id=None,
    )
    mock_db.execute.return_value = DummyResult([validation_row])

    with pytest.raises(HTTPException) as exc_info:
        await service._validate_entities_batch(
            submission_id, "AI-001", "ai-registry-form"
        )

    assert exc_info.value.status_code == 404
    assert "Question" in exc_info.value.detail


@pytest.mark.asyncio
async def test_validate_entities_batch_question_form_mismatch(mock_db):
    service = AIFeedbackService(mock_db)
    submission_id = uuid.uuid4()

    validation_row = FakeValidationRow(
        schema_form_type="ai-registry-form",
        schema_is_active=True,
        submission_id=submission_id,
        question_id="SEC-001",
    )
    mock_db.execute.return_value = DummyResult([validation_row])

    with pytest.raises(HTTPException) as exc_info:
        await service._validate_entities_batch(
            submission_id, "SEC-001", "ai-registry-form"
        )

    assert exc_info.value.status_code == 400
    assert "does not belong to" in exc_info.value.detail


@pytest.mark.asyncio
@patch(
    "data_service.service.ai_feedback.QueryOptimizer.fetch_single_with_relationships"
)
async def test_get_or_create_interaction_existing(mock_fetch, mock_db):
    service = AIFeedbackService(mock_db)
    submission_id = uuid.uuid4()
    existing_interaction = FakeAIInteraction(submission_id=submission_id)

    mock_fetch.return_value = existing_interaction

    result = await service._get_or_create_interaction(submission_id, "AI-001")

    assert result == existing_interaction
    assert not mock_db.add.called


@pytest.mark.asyncio
@patch(
    "data_service.service.ai_feedback.QueryOptimizer.fetch_single_with_relationships"
)
async def test_get_or_create_interaction_new(mock_fetch, mock_db):
    service = AIFeedbackService(mock_db)
    submission_id = uuid.uuid4()

    mock_fetch.return_value = None

    result = await service._get_or_create_interaction(submission_id, "AI-001")

    assert result.submission_id == submission_id
    assert result.question_id == "AI-001"
    assert mock_db.add.called
    assert mock_db.flush.called


@pytest.mark.asyncio
@patch("data_service.service.ai_feedback.validate_and_get_user")
@patch("data_service.service.ai_feedback.validate_submission_ownership_interaction")
async def test_create_feedback_success_with_feedback_type(
    mock_validate_interaction, mock_validate_user, mock_db
):
    service = AIFeedbackService(mock_db)

    user = FakeUser()
    submission = FakeSubmission(user_id="user123")
    submitter = FakeUser(user_id="user123")
    interaction = FakeAIInteraction()

    mock_validate_user.return_value = user
    mock_validate_interaction.return_value = (interaction, submission, submitter)
    mock_db.execute.return_value = DummyResult([])

    interaction_result, feedback = await service.create_feedback(
        x_webauth_email="test@example.com",
        is_accepted=True,
        feedback_type="like",
        feedback_tags=["Relevant", "Accurate"],
        user_comment="Great!",
        interaction_id=str(interaction.id),
    )

    assert interaction_result.is_accepted is True
    assert feedback is not None
    assert mock_db.add.called
    assert mock_db.commit.called


@pytest.mark.asyncio
@patch("data_service.service.ai_feedback.validate_and_get_user")
@patch("data_service.service.ai_feedback.validate_submission_ownership_interaction")
async def test_create_feedback_only_is_accepted_no_feedback(
    mock_validate_interaction, mock_validate_user, mock_db
):
    service = AIFeedbackService(mock_db)

    user = FakeUser()
    submission = FakeSubmission(user_id="user123")
    submitter = FakeUser(user_id="user123")
    interaction = FakeAIInteraction()

    mock_validate_user.return_value = user
    mock_validate_interaction.return_value = (interaction, submission, submitter)

    interaction_result, feedback = await service.create_feedback(
        x_webauth_email="test@example.com",
        is_accepted=False,
        feedback_type=None,
        feedback_tags=None,
        user_comment=None,
        interaction_id=str(interaction.id),
    )

    assert interaction_result.is_accepted is False
    assert feedback is None
    assert not mock_db.add.called
    assert mock_db.commit.called


@pytest.mark.asyncio
@patch("data_service.service.ai_feedback.validate_and_get_user")
@patch("data_service.service.ai_feedback.validate_submission_ownership_interaction")
async def test_create_feedback_unauthorized_user(
    mock_validate_interaction, mock_validate_user, mock_db
):
    service = AIFeedbackService(mock_db)

    user = FakeUser(user_id="user123")
    submission = FakeSubmission(user_id="different_user")
    submitter = FakeUser(user_id="different_user")
    interaction = FakeAIInteraction()

    mock_validate_user.return_value = user
    mock_validate_interaction.return_value = (interaction, submission, submitter)

    with pytest.raises(AIFeedbackServiceError) as exc_info:
        await service.create_feedback(
            x_webauth_email="test@example.com",
            is_accepted=True,
            feedback_type="like",
            feedback_tags=[],
            user_comment=None,
            interaction_id=str(interaction.id),
        )

    assert exc_info.value.status_code == 401
    assert "Unauthorized" in exc_info.value.error
    assert mock_db.rollback.called


@pytest.mark.asyncio
@patch("data_service.service.ai_feedback.validate_and_get_user")
@patch("data_service.service.ai_feedback.validate_submission_ownership_interaction")
async def test_create_feedback_duplicate_feedback_type(
    mock_validate_interaction, mock_validate_user, mock_db
):
    service = AIFeedbackService(mock_db)

    user = FakeUser()
    submission = FakeSubmission(user_id="user123")
    submitter = FakeUser(user_id="user123")
    interaction = FakeAIInteraction()
    existing_feedback_id = uuid.uuid4()

    mock_validate_user.return_value = user
    mock_validate_interaction.return_value = (interaction, submission, submitter)
    mock_db.execute.return_value = DummyResult([existing_feedback_id])

    with pytest.raises(AIFeedbackServiceError) as exc_info:
        await service.create_feedback(
            x_webauth_email="test@example.com",
            is_accepted=True,
            feedback_type="like",
            feedback_tags=["Relevant"],
            user_comment=None,
            interaction_id=str(interaction.id),
        )

    assert exc_info.value.status_code == 409
    assert "already exists" in exc_info.value.message
    assert mock_db.rollback.called


@pytest.mark.asyncio
@patch("data_service.service.ai_feedback.validate_and_get_user")
async def test_create_feedback_validation_error(mock_validate_user, mock_db):
    service = AIFeedbackService(mock_db)

    mock_validate_user.side_effect = AIFeedbackServiceError(
        error="Invalid email", message="Email validation failed", status_code=401
    )

    with pytest.raises(AIFeedbackServiceError) as exc_info:
        await service.create_feedback(
            x_webauth_email="invalid",
            is_accepted=True,
            feedback_type="like",
            feedback_tags=[],
            user_comment=None,
            interaction_id=str(uuid.uuid4()),
        )

    assert exc_info.value.status_code == 401
    assert mock_db.rollback.called


@pytest.mark.asyncio
@patch("data_service.service.ai_feedback.validate_and_get_user")
@patch("data_service.service.ai_feedback.validate_submission_ownership_interaction")
async def test_create_feedback_database_error(
    mock_validate_interaction, mock_validate_user, mock_db
):
    service = AIFeedbackService(mock_db)

    user = FakeUser()
    submission = FakeSubmission(user_id="user123")
    submitter = FakeUser(user_id="user123")
    interaction = FakeAIInteraction()

    mock_validate_user.return_value = user
    mock_validate_interaction.return_value = (interaction, submission, submitter)
    mock_db.execute.return_value = DummyResult([])
    mock_db.commit.side_effect = Exception("Database error")

    with pytest.raises(AIFeedbackServiceError):
        await service.create_feedback(
            x_webauth_email="test@example.com",
            is_accepted=True,
            feedback_type="like",
            feedback_tags=["Relevant"],
            user_comment="Good",
            interaction_id=str(interaction.id),
        )

    assert mock_db.rollback.called


@pytest.mark.asyncio
@patch("data_service.service.ai_feedback.validate_and_get_user")
@patch("data_service.service.ai_feedback.validate_submission_ownership_interaction")
async def test_create_feedback_with_all_fields(
    mock_validate_interaction, mock_validate_user, mock_db
):
    service = AIFeedbackService(mock_db)

    user = FakeUser()
    submission = FakeSubmission(user_id="user123")
    submitter = FakeUser(user_id="user123")
    interaction = FakeAIInteraction()

    mock_validate_user.return_value = user
    mock_validate_interaction.return_value = (interaction, submission, submitter)
    mock_db.execute.return_value = DummyResult([])

    interaction_result, feedback = await service.create_feedback(
        x_webauth_email="test@example.com",
        is_accepted=True,
        feedback_type="dislike",
        feedback_tags=["Irrelevant", "Inaccurate", "Others"],
        user_comment="This needs improvement because...",
        interaction_id=str(interaction.id),
    )

    assert interaction_result.is_accepted is True
    assert feedback is not None
    assert mock_db.commit.called
    assert mock_db.refresh.call_count >= 1


@pytest.mark.asyncio
@patch("data_service.service.ai_feedback.validate_and_get_user")
@patch("data_service.service.ai_feedback.validate_submission_ownership_interaction")
async def test_create_feedback_is_accepted_none(
    mock_validate_interaction, mock_validate_user, mock_db
):
    service = AIFeedbackService(mock_db)

    user = FakeUser()
    submission = FakeSubmission(user_id="user123")
    submitter = FakeUser(user_id="user123")
    interaction = FakeAIInteraction(is_accepted=True)

    mock_validate_user.return_value = user
    mock_validate_interaction.return_value = (interaction, submission, submitter)
    mock_db.execute.return_value = DummyResult([])

    interaction_result, feedback = await service.create_feedback(
        x_webauth_email="test@example.com",
        is_accepted=None,
        feedback_type="like",
        feedback_tags=["Clear"],
        user_comment=None,
        interaction_id=str(interaction.id),
    )

    assert interaction_result.is_accepted is True
    assert feedback is not None
    assert mock_db.commit.called


@pytest.mark.asyncio
@patch("data_service.service.ai_feedback.validate_and_get_user")
@patch("data_service.service.ai_feedback.validate_submission_ownership_interaction")
async def test_create_feedback_empty_feedback_tags(
    mock_validate_interaction, mock_validate_user, mock_db
):
    service = AIFeedbackService(mock_db)

    user = FakeUser()
    submission = FakeSubmission(user_id="user123")
    submitter = FakeUser(user_id="user123")
    interaction = FakeAIInteraction()

    mock_validate_user.return_value = user
    mock_validate_interaction.return_value = (interaction, submission, submitter)
    mock_db.execute.return_value = DummyResult([])

    interaction_result, feedback = await service.create_feedback(
        x_webauth_email="test@example.com",
        is_accepted=False,
        feedback_type="dislike",
        feedback_tags=[],
        user_comment="No tags selected",
        interaction_id=str(interaction.id),
    )

    assert interaction_result.is_accepted is False
    assert feedback is not None
    assert mock_db.commit.called
