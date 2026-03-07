"""
Tests for document_extraction_response serializers
====================================================
Tests validation of LLM document extraction responses.
"""

import pytest
from pydantic import ValidationError

from data_service.serializers.document_extraction_response import (
    DocumentExtractionResponse,
    validate_document_extraction_response,
)


class TestDocumentExtractionResponse:
    """Tests for DocumentExtractionResponse model."""

    def test_valid_response(self):
        """Test valid document extraction response."""
        data = {
            "question_id": "D-Q01",
            "answer": "Test answer",
            "span_ids": [1, 2, 3],
            "confidence": 0.95,
        }
        response = DocumentExtractionResponse(**data)
        assert response.question_id == "D-Q01"
        assert response.answer == "Test answer"
        assert response.span_ids == [1, 2, 3]
        assert response.confidence == 0.95

    def test_valid_empty_answer(self):
        """Test valid response with empty answer."""
        data = {"question_id": "AI-Q1", "answer": "", "span_ids": [], "confidence": 0.0}
        response = DocumentExtractionResponse(**data)
        assert response.answer == ""

    def test_invalid_question_id_format(self):
        """Test invalid question_id format raises error."""
        data = {
            "question_id": "invalid",
            "answer": "Test",
            "span_ids": [1],
            "confidence": 0.5,
        }
        with pytest.raises(ValidationError) as exc:
            DocumentExtractionResponse(**data)
        assert "question_id" in str(exc.value)

    def test_invalid_question_id_empty(self):
        """Test empty question_id raises error."""
        data = {"question_id": "", "answer": "Test", "span_ids": [1], "confidence": 0.5}
        with pytest.raises(ValidationError):
            DocumentExtractionResponse(**data)

    def test_invalid_span_ids_not_list(self):
        """Test non-list span_ids raises error."""
        data = {
            "question_id": "D-Q01",
            "answer": "Test",
            "span_ids": "not a list",
            "confidence": 0.5,
        }
        with pytest.raises(ValidationError):
            DocumentExtractionResponse(**data)

    def test_invalid_span_ids_negative(self):
        """Test negative span_id raises error."""
        data = {
            "question_id": "D-Q01",
            "answer": "Test",
            "span_ids": [1, -2, 3],
            "confidence": 0.5,
        }
        with pytest.raises(ValidationError):
            DocumentExtractionResponse(**data)

    def test_invalid_span_ids_non_integer(self):
        """Test non-integer span_id raises error."""
        data = {
            "question_id": "D-Q01",
            "answer": "Test",
            "span_ids": [1, "two", 3],
            "confidence": 0.5,
        }
        with pytest.raises(ValidationError):
            DocumentExtractionResponse(**data)

    def test_invalid_confidence_above_one(self):
        """Test confidence > 1.0 raises error."""
        data = {
            "question_id": "D-Q01",
            "answer": "Test",
            "span_ids": [1],
            "confidence": 1.5,
        }
        with pytest.raises(ValidationError):
            DocumentExtractionResponse(**data)

    def test_invalid_confidence_below_zero(self):
        """Test confidence < 0.0 raises error."""
        data = {
            "question_id": "D-Q01",
            "answer": "Test",
            "span_ids": [1],
            "confidence": -0.1,
        }
        with pytest.raises(ValidationError):
            DocumentExtractionResponse(**data)

    def test_invalid_answer_not_string(self):
        """Test non-string answer raises error."""
        data = {
            "question_id": "D-Q01",
            "answer": 123,
            "span_ids": [1],
            "confidence": 0.5,
        }
        with pytest.raises(ValidationError):
            DocumentExtractionResponse(**data)


class TestValidateDocumentExtractionResponse:
    """Tests for validate_document_extraction_response function."""

    def test_valid_response(self):
        """Test validation of valid response."""
        response_json = {
            "question_id": "D-Q01",
            "answer": "Test answer",
            "span_ids": [1, 2],
            "confidence": 0.8,
        }
        result = validate_document_extraction_response(response_json)

        assert result["is_valid"] is True
        assert result["errors"] == []
        assert result["validated_data"] is not None

    def test_invalid_not_dict(self):
        """Test validation fails for non-dict input."""
        result = validate_document_extraction_response("not a dict")

        assert result["is_valid"] is False
        assert len(result["errors"]) > 0
        assert "must be a dict" in result["errors"][0]

    def test_invalid_empty_dict(self):
        """Test validation fails for empty dict."""
        result = validate_document_extraction_response({})

        assert result["is_valid"] is False
        assert "empty" in result["errors"][0].lower()

    def test_invalid_missing_fields(self):
        """Test validation fails for missing required fields."""
        result = validate_document_extraction_response({"question_id": "D-Q01"})

        assert result["is_valid"] is False
        assert len(result["errors"]) > 0

    def test_invalid_validation_error(self):
        """Test validation captures pydantic validation errors."""
        response_json = {
            "question_id": "invalid-format",
            "answer": "Test",
            "span_ids": [1],
            "confidence": 0.5,
        }
        result = validate_document_extraction_response(response_json)

        assert result["is_valid"] is False
        assert len(result["errors"]) > 0

    def test_invalid_confidence_not_number(self):
        """Test non-numeric confidence raises error."""
        data = {
            "question_id": "D-Q01",
            "answer": "Test",
            "span_ids": [1],
            "confidence": "high",
        }
        with pytest.raises(ValidationError):
            DocumentExtractionResponse(**data)

    def test_confidence_integer_converts_to_float(self):
        """Test integer confidence is accepted and converted to float."""
        data = {
            "question_id": "D-Q01",
            "answer": "Test",
            "span_ids": [1],
            "confidence": 1,
        }
        response = DocumentExtractionResponse(**data)
        assert response.confidence == 1.0
        assert isinstance(response.confidence, float)

    def test_validation_with_unexpected_error(self):
        """Test validation handles unexpected errors gracefully."""

        # Pass a non-serializable type that will cause an unexpected error
        class BadObject:
            def __init__(self):
                raise RuntimeError("Unexpected error")

        # This should be caught as an unexpected error
        result = validate_document_extraction_response({"question_id": BadObject})
        assert result["is_valid"] is False
