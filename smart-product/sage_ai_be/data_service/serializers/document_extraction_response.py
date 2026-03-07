"""
Pydantic model for document extraction LLM response validation.
Used for single-question extraction format with span-based provenance.
"""

import re
from typing import List

from pydantic import BaseModel, Field, validator


class DocumentExtractionResponse(BaseModel):
    """
    Validates LLM response for document extraction.

    Expected format:
    {
        "question_id": "PREFIX-QX",
        "answer": "extracted text or empty string",
        "span_ids": [0, 1, 2],
        "confidence": 0.85
    }
    """

    question_id: str = Field(..., description="Question ID in format PREFIX-QX")
    answer: str = Field(
        ..., description="Extracted answer text, empty string if not found"
    )
    span_ids: List[int] = Field(
        ..., description="List of span IDs supporting the answer"
    )
    confidence: float = Field(
        ..., ge=0.0, le=1.0, description="Confidence score between 0.0 and 1.0"
    )

    @validator("question_id")
    def validate_question_id_format(cls, v):  # pylint: disable=no-self-argument
        """Validate question ID follows PREFIX-QX format."""
        if not v or not isinstance(v, str):
            raise ValueError("question_id must be a non-empty string")

        # Check for PREFIX-QX format (e.g., D-Q01, AI-Q1, W-Q10)
        if not re.match(r"^[A-Z]+-Q\d+$", v, re.IGNORECASE):
            raise ValueError(
                f"question_id must follow format PREFIX-QX (e.g., D-Q01, AI-Q1), got: {v}"
            )

        return v

    @validator("answer")
    def validate_answer(cls, v):  # pylint: disable=no-self-argument
        """Ensure answer is a string (can be empty)."""
        if not isinstance(v, str):
            raise ValueError(f"answer must be a string, got: {type(v)}")
        return v

    @validator("span_ids")
    def validate_span_ids(cls, v):  # pylint: disable=no-self-argument
        """Validate span_ids is a list of non-negative integers."""
        if not isinstance(v, list):
            raise ValueError(f"span_ids must be a list, got: {type(v)}")

        for idx, span_id in enumerate(v):
            if not isinstance(span_id, int):
                raise ValueError(
                    f"span_ids[{idx}] must be an integer, got: {type(span_id)}"
                )
            if span_id < 0:
                raise ValueError(
                    f"span_ids[{idx}] must be non-negative, got: {span_id}"
                )

        return v

    @validator("confidence")
    def validate_confidence_range(cls, v):  # pylint: disable=no-self-argument
        """Ensure confidence is between 0.0 and 1.0."""
        if not isinstance(v, (int, float)):
            raise ValueError(f"confidence must be a number, got: {type(v)}")

        if v < 0.0 or v > 1.0:
            raise ValueError(f"confidence must be between 0.0 and 1.0, got: {v}")

        return float(v)


def validate_document_extraction_response(
    response_json: dict, model: type[BaseModel] = DocumentExtractionResponse
) -> dict:
    """
    Validate document extraction LLM response using a specified Pydantic model.

    Args:
        response_json: Raw JSON dict from LLM
        model: Pydantic BaseModel class to use for validation (default: DocumentExtractionResponse)

    Returns:
        {
            "is_valid": bool,
            "errors": List[str],
            "validated_data": dict or None
        }
    """
    result = {"is_valid": False, "errors": [], "validated_data": None}

    # Check basic structure
    if not isinstance(response_json, dict):
        result["errors"].append(f"Response must be a dict, got {type(response_json)}")
        return result

    if not response_json:
        result["errors"].append("Response is empty")
        return result

    # Validate using provided Pydantic model
    try:
        validated = model(**response_json)
        result["is_valid"] = True
        result["validated_data"] = validated.dict()
    except ValueError as e:
        # Pydantic validation errors
        result["errors"].append(str(e))
    except Exception as e:
        # Unexpected errors
        result["errors"].append(f"Validation failed: {str(e)}")

    return result
