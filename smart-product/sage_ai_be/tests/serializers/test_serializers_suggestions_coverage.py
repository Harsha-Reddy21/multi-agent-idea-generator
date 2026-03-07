import pytest
from uuid import uuid4
from data_service.serializers.suggestions_coverage import (
    CheckSuggestionsCoverageRequest,
    SuggestionItem,
    CheckSuggestionsCoverageResponse,
    ErrorResponse,
)


def test_suggestions_coverage_request_valid():
    payload = {
        "submission_id": uuid4(),
        "question_id": "A-Q01",
        "user_text": "Some text",
    }
    req = CheckSuggestionsCoverageRequest(**payload)
    assert req.question_id == "A-Q01"


def test_suggestions_coverage_request_missing_fields():
    with pytest.raises(Exception):
        CheckSuggestionsCoverageRequest(question_id="A-Q01", user_text="x")


def test_suggestions_coverage_response_valid_and_dump():
    required = [SuggestionItem(text="Do X", rationale="Because Y")]
    completed = [SuggestionItem(text="Did Z", rationale="Because W")]
    resp = CheckSuggestionsCoverageResponse(
        required_suggestions=required,
        completed_suggestions=completed,
        interaction_id=uuid4(),
    )
    dumped = resp.model_dump()
    assert dumped["required_suggestions"][0]["text"] == "Do X"
    assert dumped["completed_suggestions"][0]["rationale"] == "Because W"


def test_suggestions_coverage_error_response_dump():
    err = ErrorResponse(error="Validation Error", message="Bad", status_code=400)
    assert err.model_dump()["status_code"] == 400
