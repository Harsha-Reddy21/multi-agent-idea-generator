import pytest
from data_service.serializers.llm_response import validate_llm_response


def test_llm_response_valid_structure():
    payload = {
        "AI-Q1": [
            {"answer": "x", "file": "f.pdf", "page": 1},
            {"answer": "y", "file": "f.pdf", "page": "2"},
        ]
    }
    res = validate_llm_response(payload)
    assert res["overall_structure_valid"] is True
    assert res["answer_objects_valid"] is True
    assert res["validated_data"]["AI-Q1"][0]["page"] == 1


def test_llm_response_invalid_page():
    payload = {"AI-Q1": [{"answer": "x", "file": "f.pdf", "page": "two"}]}
    res = validate_llm_response(payload)
    assert res["overall_structure_valid"] is False
    assert any("Page must be a number" in e for e in res["validation_errors"])
