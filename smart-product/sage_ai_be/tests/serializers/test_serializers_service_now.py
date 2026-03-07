import pytest
from data_service.serializers.service_now import (
    ApprovedIdeaUser,
    ApprovedIdeaDetail,
    ApprovedIdeasCountResponse,
    TopApprovedIdeasResponse,
    ApprovedIdeasDashboardResponse,
    ErrorResponse,
)


def test_service_now_approved_idea_models_round_trip():
    user = ApprovedIdeaUser(user_id="u-1", user_name="Alice")
    detail = ApprovedIdeaDetail(
        ai_system_name="Risk AI",
        problem_statement="Detect risks",
        submitted_by=user,
    )
    count_resp = ApprovedIdeasCountResponse(count=5, days=7)
    ideas_resp = TopApprovedIdeasResponse(ideas=[detail], total_count=1)
    dashboard_resp = ApprovedIdeasDashboardResponse(
        approved_count=5,
        days=7,
        top_ideas=[detail],
    )

    # Validate defaults and dumps
    assert count_resp.message == "Success"
    assert ideas_resp.message == "Success"
    assert dashboard_resp.message == "Success"

    dump = dashboard_resp.model_dump()
    assert dump["approved_count"] == 5
    assert dump["days"] == 7
    assert (
        isinstance(dump["top_ideas"], list)
        and dump["top_ideas"][0]["ai_system_name"] == "Risk AI"
    )


def test_service_now_error_response():
    err = ErrorResponse(error="Validation Error", message="Bad input", status_code=400)
    d = err.model_dump()
    assert d["error"] == "Validation Error"
    assert d["status_code"] == 400


@pytest.mark.parametrize(
    "field, payload",
    [
        ("user_id", {"user_name": "Bob"}),
        ("user_name", {"user_id": "u-2"}),
    ],
)
def test_service_now_user_missing_fields(field, payload):
    with pytest.raises(Exception):
        ApprovedIdeaUser(**payload)


def test_service_now_approved_idea_detail_missing_submitted_by():
    with pytest.raises(Exception):
        ApprovedIdeaDetail(ai_system_name="X", problem_statement="Y")
