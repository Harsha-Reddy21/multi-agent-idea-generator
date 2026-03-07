import pytest
from httpx import AsyncClient

from data_service.service.ai_feedback import AIFeedbackService


class DummyObj:
    def __init__(self, **kwargs):
        for k, v in kwargs.items():
            setattr(self, k, v)


@pytest.mark.asyncio
async def test_create_ai_feedback_success(client: AsyncClient, monkeypatch):
    async def fake_create_feedback(self, **kwargs):
        interaction = DummyObj(id="interaction-id")
        # valid UUID
        feedback = DummyObj(id="3fa85f64-5717-4562-b3fc-2c963f66afa6")
        return interaction, feedback

    monkeypatch.setattr(AIFeedbackService, "create_feedback", fake_create_feedback)

    payload = {
        "interaction_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "is_accepted": True,
        "feedback_type": "like",
        "feedback_tags": ["Relevant", "Accurate"],
        "user_comment": "Helpful",
    }

    headers = {"X-WEBAUTH-EMAIL": "tester@example.com"}
    resp = await client.post("/api/ai-feedback", json=payload, headers=headers)

    assert resp.status_code == 201
    data = resp.json()
    assert data["message"] == "success"
    assert data["data"]["feedback_id"] == "3fa85f64-5717-4562-b3fc-2c963f66afa6"


@pytest.mark.asyncio
async def test_create_ai_feedback_fail_no_feedback(client: AsyncClient, monkeypatch):
    async def fake_create_feedback(self, **kwargs):
        interaction = DummyObj(id="interaction-id")
        feedback = None
        return interaction, feedback

    monkeypatch.setattr(AIFeedbackService, "create_feedback", fake_create_feedback)

    payload = {
        "interaction_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "is_accepted": False,
        "feedback_type": "dislike",
        "feedback_tags": ["Irrelevant"],
        "user_comment": "Not useful",
    }

    headers = {"X-WEBAUTH-EMAIL": "tester@example.com"}
    resp = await client.post("/api/ai-feedback", json=payload, headers=headers)

    assert resp.status_code == 201
    data = resp.json()
    assert data["message"] == "fail"
    assert data["data"]["feedback_id"] is None
