"""
Tests for AI interaction utility functions.
"""

import pytest
import uuid
from unittest.mock import AsyncMock, MagicMock
from data_service.utils.ai_interaction_utils import create_ai_interaction
from data_service.serializers.ai_feedback import AIFeatureType
from data_service.models.ai_interactions import AIInteractions


@pytest.mark.asyncio
async def test_create_ai_interaction_success():
    """Test successful creation of AI interaction."""
    db = AsyncMock()
    submission_id = uuid.uuid4()
    form_id = uuid.uuid4()
    question_id = "AI-Q1"
    ai_content = {"answer": "test answer"}

    # Mock interaction
    mock_interaction = AIInteractions(
        id=uuid.uuid4(),
        submission_id=submission_id,
        question_id=question_id,
        form_id=form_id,
        ai_feature_type=AIFeatureType.SUGGESTIONS.value,
        ai_generated_content=ai_content,
    )

    result = await create_ai_interaction(
        db=db,
        submission_id=submission_id,
        question_id=question_id,
        form_id=form_id,
        ai_feature_type=AIFeatureType.SUGGESTIONS,
        ai_generated_content=ai_content,
    )

    db.add.assert_called_once()
    db.commit.assert_called_once()
    db.refresh.assert_called_once()


@pytest.mark.asyncio
async def test_create_ai_interaction_with_user_input():
    """Test creating AI interaction with user input."""
    db = AsyncMock()
    submission_id = uuid.uuid4()
    question_id = "AI-Q1"
    user_input = "User's original answer"
    ai_content = {"suggestions": ["suggestion1", "suggestion2"]}

    result = await create_ai_interaction(
        db=db,
        submission_id=submission_id,
        question_id=question_id,
        ai_feature_type=AIFeatureType.ENHANCE_ANSWER,
        ai_generated_content=ai_content,
        user_input=user_input,
    )

    db.add.assert_called_once()
    db.commit.assert_called_once()


@pytest.mark.asyncio
async def test_create_ai_interaction_without_commit():
    """Test creating AI interaction without committing."""
    db = AsyncMock()
    submission_id = uuid.uuid4()
    question_id = "AI-Q1"
    ai_content = {"data": "test"}

    result = await create_ai_interaction(
        db=db,
        submission_id=submission_id,
        question_id=question_id,
        ai_feature_type=AIFeatureType.DATA_EXTRACT,
        ai_generated_content=ai_content,
        commit=False,
    )

    db.add.assert_called_once()
    db.flush.assert_called_once()
    db.commit.assert_not_called()


@pytest.mark.asyncio
async def test_create_ai_interaction_with_is_accepted():
    """Test creating AI interaction with is_accepted flag."""
    db = AsyncMock()
    submission_id = uuid.uuid4()
    question_id = "AI-Q1"
    ai_content = {"coverage": "95%"}

    result = await create_ai_interaction(
        db=db,
        submission_id=submission_id,
        question_id=question_id,
        ai_feature_type=AIFeatureType.CHECK_COVERAGE,
        ai_generated_content=ai_content,
        is_accepted=True,
    )

    db.add.assert_called_once()
    db.commit.assert_called_once()


@pytest.mark.asyncio
async def test_create_ai_interaction_failure():
    """Test handling of AI interaction creation failure."""
    db = AsyncMock()
    db.commit.side_effect = Exception("Database error")

    submission_id = uuid.uuid4()
    question_id = "AI-Q1"
    ai_content = {"test": "data"}

    with pytest.raises(Exception, match="Database error"):
        await create_ai_interaction(
            db=db,
            submission_id=submission_id,
            question_id=question_id,
            ai_feature_type=AIFeatureType.SUGGESTIONS,
            ai_generated_content=ai_content,
        )

    db.rollback.assert_called_once()


@pytest.mark.asyncio
async def test_create_ai_interaction_failure_without_commit():
    """Test handling of AI interaction creation failure without commit."""
    db = AsyncMock()
    db.flush.side_effect = Exception("Flush error")

    submission_id = uuid.uuid4()
    question_id = "AI-Q1"
    ai_content = {"test": "data"}

    with pytest.raises(Exception, match="Flush error"):
        await create_ai_interaction(
            db=db,
            submission_id=submission_id,
            question_id=question_id,
            ai_feature_type=AIFeatureType.SUGGESTIONS,
            ai_generated_content=ai_content,
            commit=False,
        )

    db.rollback.assert_not_called()
