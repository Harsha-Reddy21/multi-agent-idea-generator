import pytest
from fastapi import HTTPException
import main as main_module


@pytest.mark.anyio
async def test_service_now_dashboard_success(client, monkeypatch):
    app = main_module.app
    from data_service.service.service_now import ServiceNowService

    async def fake_get_approved_ideas_dashboard(self, days, top_limit):  # noqa: D401
        return {
            "approved_count": 3,
            "days": days,
            "top_ideas": [
                {
                    "ai_system_name": "AI System 1",
                    "problem_statement": "Problem 1",
                    "submitted_by": {"user_id": "u1", "user_name": "User One"},
                },
                {
                    "ai_system_name": "AI System 2",
                    "problem_statement": "Problem 2",
                    "submitted_by": {"user_id": "u2", "user_name": "User Two"},
                },
            ],
            "message": "Success",
        }

    monkeypatch.setattr(
        ServiceNowService,
        "get_approved_ideas_dashboard",
        fake_get_approved_ideas_dashboard,
    )

    resp = await client.get("/api/service-now/approved-ideas-dashboard?days=10&limit=2")
    assert resp.status_code == 200
    data = resp.json()
    assert data["approved_count"] == 3
    assert len(data["top_ideas"]) == 2


@pytest.mark.anyio
async def test_service_now_dashboard_error(client, monkeypatch):
    app = main_module.app
    from data_service.service.service_now import ServiceNowService

    async def fake_get_approved_ideas_dashboard(self, days, top_limit):  # noqa: D401
        # Raising HTTPException should result in FastAPI's default error payload: {"detail": ...}
        raise HTTPException(status_code=500, detail="SN failure")

    monkeypatch.setattr(
        ServiceNowService,
        "get_approved_ideas_dashboard",
        fake_get_approved_ideas_dashboard,
    )

    resp = await client.get("/api/service-now/approved-ideas-dashboard?days=10&limit=2")
    assert resp.status_code == 500
    body = resp.json()
    # FastAPI standard error payload uses `detail`
    assert body.get("detail") == "SN failure"
