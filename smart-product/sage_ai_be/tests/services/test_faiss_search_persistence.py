"""
Test FAISS Search Route with Database Persistence
==================================================
Test the /faiss/search endpoint with novelty_score persistence to database.
"""

import pytest
from unittest.mock import Mock, patch, MagicMock, AsyncMock
from uuid import uuid4
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from data_service.routes.faiss_search import router
from data_service.models.submissions import Submissions
from data_service.serializers.faiss import SearchRequest, FormDataEntry


@pytest.fixture
def mock_db_session():
    """Create a mock database session"""
    mock_session = MagicMock(spec=Session)
    return mock_session


@pytest.fixture
def mock_faiss_service():
    """Create a mock FAISS service"""
    mock_service = Mock()
    # Mock persist_novelty_score as AsyncMock since it's an async method
    mock_service.persist_novelty_score = AsyncMock()
    return mock_service


@pytest.fixture
def sample_submission():
    """Create a sample submission object"""
    submission = Mock(spec=Submissions)
    submission.id = uuid4()
    submission.novelty_score = None
    return submission


def test_search_persists_novelty_score_success(
    mock_db_session, mock_faiss_service, sample_submission
):
    """Test that novelty score is successfully persisted to database"""
    # Setup
    submission_id = sample_submission.id
    expected_similarity_score = 0.95

    # Mock FAISS service to return a search result
    mock_faiss_service.search.return_value = {
        "air_number": "AIR-12345",
        "title": "Test AIR",
        "similarity_score": expected_similarity_score,
    }

    # Mock persist_novelty_score to simulate updating the submission
    async def mock_persist(submission_id, similarity_score, db):
        sample_submission.novelty_score = similarity_score
        return True

    mock_faiss_service.persist_novelty_score = AsyncMock(side_effect=mock_persist)

    # Create search request
    request = SearchRequest.model_validate(
        {
            "submission-id": str(submission_id),
            "form-id": "test-form",
            "form-data": [
                {
                    "questionId": "q1",
                    "question": "Test Question",
                    "answer": "test query",
                }
            ],
        }
    )

    # Patch dependencies and call the endpoint
    with patch(
        "data_service.routes.faiss_search.get_faiss_service",
        return_value=mock_faiss_service,
    ), patch("data_service.routes.faiss_search.get_db", return_value=mock_db_session):

        from data_service.routes.faiss_search import search
        import asyncio

        result = asyncio.run(search(request, mock_db_session))

    # Assertions
    assert result is not None
    assert result.similarity_score == expected_similarity_score
    assert sample_submission.novelty_score == expected_similarity_score
    mock_faiss_service.persist_novelty_score.assert_called_once_with(
        submission_id=submission_id,
        similarity_score=expected_similarity_score,
        db=mock_db_session,
    )


def test_search_handles_missing_submission(mock_db_session, mock_faiss_service):
    """Test that search handles missing submission gracefully"""
    # Setup
    submission_id = uuid4()
    expected_similarity_score = 0.92

    # Mock FAISS service to return a search result
    mock_faiss_service.search.return_value = {
        "air_number": "AIR-99999",
        "title": "Another AIR",
        "similarity_score": expected_similarity_score,
    }

    # Mock persist_novelty_score to raise an error for missing submission
    from data_service.exceptions.service_errors import FAISSServiceError

    mock_faiss_service.persist_novelty_score = AsyncMock(
        side_effect=FAISSServiceError(
            error="Not Found",
            message=f"Submission {submission_id} not found",
            status_code=404,
        )
    )

    # Create search request
    request = SearchRequest.model_validate(
        {
            "submission-id": str(submission_id),
            "form-id": "test-form",
            "form-data": [
                {
                    "questionId": "q1",
                    "question": "Test Question",
                    "answer": "test query",
                }
            ],
        }
    )

    # Patch dependencies and call the endpoint
    with patch(
        "data_service.routes.faiss_search.get_faiss_service",
        return_value=mock_faiss_service,
    ):
        from data_service.routes.faiss_search import search
        import asyncio

        # This should raise the FAISSServiceError
        with pytest.raises(FAISSServiceError) as exc_info:
            asyncio.run(search(request, mock_db_session))

    # Assertions - verify the error details
    assert exc_info.value.status_code == 404
    assert "not found" in exc_info.value.message.lower()


def test_search_handles_db_error_gracefully(
    mock_db_session, mock_faiss_service, sample_submission
):
    """Test that search propagates database errors"""
    # Setup
    submission_id = sample_submission.id
    expected_similarity_score = 0.88

    # Mock FAISS service to return a search result
    mock_faiss_service.search.return_value = {
        "air_number": "AIR-55555",
        "title": "Test AIR with DB Error",
        "similarity_score": expected_similarity_score,
    }

    # Mock persist_novelty_score to raise a database error
    from data_service.exceptions.service_errors import FAISSServiceError

    mock_faiss_service.persist_novelty_score = AsyncMock(
        side_effect=FAISSServiceError(
            error="Database Error",
            message="Database connection error",
            status_code=500,
        )
    )

    # Create search request
    request = SearchRequest.model_validate(
        {
            "submission-id": str(submission_id),
            "form-id": "test-form",
            "form-data": [
                {
                    "questionId": "q1",
                    "question": "Test Question",
                    "answer": "test query",
                }
            ],
        }
    )

    # Patch dependencies and call the endpoint
    with patch(
        "data_service.routes.faiss_search.get_faiss_service",
        return_value=mock_faiss_service,
    ):
        from data_service.routes.faiss_search import search
        import asyncio

        # This should raise the FAISSServiceError
        with pytest.raises(FAISSServiceError) as exc_info:
            asyncio.run(search(request, mock_db_session))

    # Assertions - verify the error is propagated
    assert exc_info.value.status_code == 500
    assert "database" in exc_info.value.message.lower()


def test_search_no_result_no_persistence(mock_db_session, mock_faiss_service):
    """Test that no persistence happens when search returns no result"""
    # Setup
    submission_id = uuid4()

    # Mock FAISS service to return None (no match)
    mock_faiss_service.search.return_value = None

    # Create search request
    request = SearchRequest.model_validate(
        {
            "submission-id": str(submission_id),
            "form-id": "test-form",
            "form-data": [
                {
                    "questionId": "q1",
                    "question": "Test Question",
                    "answer": "low quality query",
                }
            ],
        }
    )

    # Patch dependencies and call the endpoint
    with patch(
        "data_service.routes.faiss_search.get_faiss_service",
        return_value=mock_faiss_service,
    ), patch("data_service.routes.faiss_search.get_db", return_value=mock_db_session):

        from data_service.routes.faiss_search import search
        import asyncio

        result = asyncio.run(search(request, mock_db_session))

    # Assertions - should return None and not attempt DB update
    assert result is None
    mock_db_session.query.assert_not_called()
    mock_db_session.commit.assert_not_called()


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
