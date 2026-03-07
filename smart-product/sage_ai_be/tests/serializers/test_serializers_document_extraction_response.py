import pytest
from pydantic import ValidationError
from data_service.serializers.document_extraction_response import (
    DocumentExtractionResponse,
    validate_document_extraction_response,
)


def test_document_extraction_response_valid():
    resp = DocumentExtractionResponse(
        question_id="AI-Q1",
        answer="Some answer",
        span_ids=[0, 1],
        confidence=0.85,
    )
    assert resp.question_id == "AI-Q1"
    assert resp.answer == "Some answer"
    assert resp.confidence == 0.85


def test_document_extraction_response_invalid_confidence():
    with pytest.raises(ValidationError):
        DocumentExtractionResponse(
            question_id="AI-Q1",
            answer="A",
            span_ids=[0],
            confidence=1.5,
        )


def test_validate_document_extraction_response_helper():
    res = validate_document_extraction_response(
        {
            "question_id": "AI-Q2",
            "answer": "ok",
            "span_ids": [0, 2],
            "confidence": 0.4,
        }
    )
    assert res["is_valid"] is True
    assert res["validated_data"]["question_id"] == "AI-Q2"
