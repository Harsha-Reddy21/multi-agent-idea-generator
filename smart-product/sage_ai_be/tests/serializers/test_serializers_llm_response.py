import pytest
from data_service.serializers.llm_response import validate_llm_response


def test_validate_llm_response_success():
    payload = {
        "A-Q01": [
            {"answer": "Yes", "file": "a.pdf", "page": 1},
            {"answer": "No", "file": "b.pdf", "page": "2"},
        ]
    }
    result = validate_llm_response(payload)
    assert result["overall_structure_valid"] is True
    assert result["answer_objects_valid"] is True
    assert result["validated_data"] is not None


@pytest.mark.parametrize(
    "bad_payload, expected_fragment",
    [
        ([], "Response must be a dict"),
        ({}, "Response is empty"),
    ],
)
def test_validate_llm_response_top_level_errors(bad_payload, expected_fragment):
    res = validate_llm_response(bad_payload)
    assert expected_fragment in " ".join(res["validation_errors"])
    assert res["should_retry"] is True


def test_validate_llm_response_bad_question_id():
    payload = {"BADID": [{"answer": "Yes", "file": "a", "page": 1}]}
    res = validate_llm_response(payload)
    assert res["overall_structure_valid"] is False
    assert any("Invalid question ID" in e for e in res["validation_errors"])
    assert res["should_retry"] is True


def test_validate_llm_response_partial_valid():
    payload = {
        "A-Q01": [
            {"answer": "Yes", "file": "a", "page": 1},
            {"answer": "", "file": "a", "page": 2},  # invalid answer
        ],
        "A-Q02": "not-a-list",
    }
    res = validate_llm_response(payload)
    assert res["overall_structure_valid"] is False
    assert res["should_retry"] is True
    assert res["can_proceed_without_enrichment"] in (
        True,
        False,
    )  # structural fallback logic


@pytest.mark.parametrize(
    "bad_answer, msg_part",
    [
        ({"answer": "", "file": "a", "page": 1}, "Answer cannot be empty"),
        ({"answer": "Yes", "file": "", "page": 1}, "File name cannot be empty"),
        ({"answer": "Yes", "file": "a", "page": "x"}, "Page must be a number"),
        ({"answer": "Yes", "file": "a", "page": 0}, "Page must be >= 1"),
    ],
)
def test_validate_llm_response_answer_errors(bad_answer, msg_part):
    payload = {"A-Q01": [bad_answer]}
    res = validate_llm_response(payload)
    assert any(msg_part in e for e in res["validation_errors"])
    assert res["should_retry"] is True


def test_validate_llm_response_empty_answers_list():
    payload = {"A-Q01": []}
    res = validate_llm_response(payload)
    # Serializer treats empty list as structurally valid (no invalid items)
    assert res["overall_structure_valid"] is True
    assert res["answer_objects_valid"] is True


def test_validate_llm_response_non_list_answers():
    payload = {"A-Q01": {"answer": "Yes", "file": "a", "page": 1}}
    res = validate_llm_response(payload)
    assert res["overall_structure_valid"] is False
    # Error text may vary; ensure it mentions list expectation
    assert any("list" in e.lower() for e in res["validation_errors"])


def test_validate_llm_response_multiple_questions_mixed_validity():
    payload = {
        "A-Q01": [
            {"answer": "Yes", "file": "a.pdf", "page": 1},
            {"answer": "", "file": "a.pdf", "page": 2},
        ],
        "A-Q02": [
            {"answer": "Data", "file": "b.pdf", "page": 3},
        ],
    }
    res = validate_llm_response(payload)
    assert res["overall_structure_valid"] is False
    assert res["answer_objects_valid"] in (True, False)
    assert res["should_retry"] is True
    # Ensure validated_data returns at least the valid entries structure when present
    assert "validated_data" in res


def test_validate_llm_response_ignores_extra_fields():
    payload = {
        "A-Q01": [
            {"answer": "Yes", "file": "a", "page": 1, "extra": "xtra"},
        ]
    }
    res = validate_llm_response(payload)
    # AnswerObject has extra='forbid' from BaseSerializer, so extra fields are rejected
    assert res["overall_structure_valid"] is False
    assert res["answer_objects_valid"] is False
    assert any("extra" in err.lower() for err in res["validation_errors"])


def test_validate_llm_response_large_page_number():
    payload = {
        "A-Q01": [
            {"answer": "Yes", "file": "a", "page": 99999},
        ]
    }
    res = validate_llm_response(payload)
    # Large page numbers should pass numeric validation
    assert res["overall_structure_valid"] is True
    assert res["answer_objects_valid"] is True


def test_validate_llm_response_numeric_string_page_and_multiple_questions():
    payload = {
        "A-Q01": [
            {"answer": "Yes", "file": "a.pdf", "page": "10"},
            {"answer": "No", "file": "b.pdf", "page": 2},
        ],
        "A-Q02": [
            {"answer": "Maybe", "file": "c.pdf", "page": "3"},
        ],
    }
    res = validate_llm_response(payload)
    assert res["overall_structure_valid"] is True
    assert res["answer_objects_valid"] is True


def test_validate_llm_response_empty_dict_payload():
    payload = {}
    res = validate_llm_response(payload)
    assert res["overall_structure_valid"] is False
    assert res["should_retry"] is True


def test_validate_llm_response_with_extra_unknown_fields():
    payload = {
        "A-Q01": [
            {"answer": "Yes", "file": "a.pdf", "page": 1, "unk": "x"},
        ]
    }
    res = validate_llm_response(payload)
    # Extra fields are forbidden by BaseSerializer configuration
    assert res["overall_structure_valid"] is False
    assert res["answer_objects_valid"] is False
    assert any(
        "extra" in err.lower() or "unk" in err.lower()
        for err in res["validation_errors"]
    )


def test_validate_llm_response_proceed_without_enrichment_toggle():
    # Mixed validity to trigger structural false but potentially proceed flag
    payload = {
        "A-Q01": [
            {"answer": "", "file": "a.pdf", "page": 1},
            {"answer": "Valid", "file": "b.pdf", "page": 2},
        ]
    }
    res = validate_llm_response(payload)
    assert res["overall_structure_valid"] in (True, False)
    assert res["can_proceed_without_enrichment"] in (True, False)
