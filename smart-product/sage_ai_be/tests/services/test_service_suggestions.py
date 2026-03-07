import asyncio
import pytest
from unittest.mock import AsyncMock, patch, MagicMock

from data_service.service.suggestions import SuggestionsService
from data_service.models.suggestions import Suggestions
from data_service.exceptions import SuggestionsServiceError


class FakeResult:
    def __init__(self, rows):
        self._rows = rows

    def scalars(self):
        class S:
            def __init__(self, rows):
                self._rows = rows

            def all(self):
                return self._rows

        return S(self._rows)


class FakeSession:
    def __init__(self):
        self.rows = []
        self.raise_exc = None

    async def execute(self, stmt):
        if self.raise_exc:
            raise self.raise_exc
        txt = str(stmt).lower()
        # naive filter by form_type literal
        if "where" in txt and "form_type" in txt:
            return FakeResult(self.rows)
        return FakeResult([])


run = asyncio.run


def test_get_suggestions_by_form_type_success():
    sess = FakeSession()
    fake_suggestions = [
        MagicMock(question_id="Q1", suggestions=["a", "b"]),
        MagicMock(question_id="Q2", suggestions=["c"]),
    ]
    service = SuggestionsService(sess)
    with patch(
        "data_service.service.suggestions.cache_manager.get_suggestions_by_form_type",
        new_callable=AsyncMock,
        return_value=fake_suggestions,
    ):
        out = run(service.get_suggestions_by_form_type("idea"))
    assert len(out) == 2
    assert out[0]["question_id"] == "Q1"


def test_get_suggestions_by_form_type_empty():
    sess = FakeSession()
    service = SuggestionsService(sess)
    with patch(
        "data_service.service.suggestions.cache_manager.get_suggestions_by_form_type",
        new_callable=AsyncMock,
        return_value=None,
    ):
        out = run(service.get_suggestions_by_form_type("none"))
    assert out == []


def test_get_suggestions_by_form_type_error():
    sess = FakeSession()
    service = SuggestionsService(sess)
    with patch(
        "data_service.service.suggestions.cache_manager.get_suggestions_by_form_type",
        new_callable=AsyncMock,
        side_effect=RuntimeError("db fail"),
    ):
        with pytest.raises(SuggestionsServiceError) as exc:
            run(service.get_suggestions_by_form_type("idea"))
    assert exc.value.status_code == 500


def test_suggestions_service_init_with_none_db():
    """Test that SuggestionsService raises error when db is None"""
    with pytest.raises(SuggestionsServiceError) as exc:
        SuggestionsService(None)
    assert exc.value.status_code == 400
    assert "Database session cannot be None" in exc.value.message


def test_get_suggestions_by_form_type_empty_string():
    """Test that empty form_type raises validation error"""
    sess = FakeSession()
    service = SuggestionsService(sess)
    with pytest.raises(SuggestionsServiceError) as exc:
        run(service.get_suggestions_by_form_type(""))
    assert exc.value.status_code == 400
    assert "required and must be a non-empty string" in exc.value.message


def test_get_suggestions_by_form_type_none():
    """Test that None form_type raises validation error"""
    sess = FakeSession()
    service = SuggestionsService(sess)
    with pytest.raises(SuggestionsServiceError) as exc:
        run(service.get_suggestions_by_form_type(None))
    assert exc.value.status_code == 400
    assert "required and must be a non-empty string" in exc.value.message


def test_get_suggestions_by_form_type_non_string():
    """Test that non-string form_type raises validation error"""
    sess = FakeSession()
    service = SuggestionsService(sess)
    with pytest.raises(SuggestionsServiceError) as exc:
        run(service.get_suggestions_by_form_type(123))
    assert exc.value.status_code == 400
    assert "required and must be a non-empty string" in exc.value.message


def test_get_suggestions_by_form_type_multiple_results():
    """Test getting multiple suggestions with different structures"""
    sess = FakeSession()
    fake_suggestions = [
        MagicMock(question_id="R1", suggestions=["opt1", "opt2", "opt3"]),
        MagicMock(question_id="R2", suggestions=["single"]),
        MagicMock(question_id="R3", suggestions=[]),
    ]
    service = SuggestionsService(sess)
    with patch(
        "data_service.service.suggestions.cache_manager.get_suggestions_by_form_type",
        new_callable=AsyncMock,
        return_value=fake_suggestions,
    ):
        out = run(service.get_suggestions_by_form_type("registry"))
    assert len(out) == 3
    assert out[0]["suggestions"] == ["opt1", "opt2", "opt3"]
    assert out[1]["suggestions"] == ["single"]
    assert out[2]["suggestions"] == []
