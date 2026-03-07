import pytest
from fastapi import HTTPException
from data_service.db_connection.db import get_db
import main as main_module


@pytest.mark.anyio
async def test_score_form_success(client, monkeypatch):
    app = main_module.app
    from data_service.service.scoring_service import ScoringService

    async def fake_calculate_score(self, input_data):  # noqa: D401
        return {"submission_id": input_data.submission_id, "total_score": 0.85}

    monkeypatch.setattr(ScoringService, "calculate_score", fake_calculate_score)

    async def fake_get_db():  # noqa: D401
        yield object()

    app.dependency_overrides[get_db] = fake_get_db

    # submission_id must be UUID string; include required form_type + form_data for validation
    payload = {
        "submission_id": "12345678-1234-1234-1234-123456789012",
        "form_type": "idea",
        "form_data": [
            {
                "questionId": "Q1",
                "question": "Q?",
                "answer": ["A"],
                "ai_meta_data": None,
                "type": "text",
            }
        ],
    }
    resp = await client.post("/api/score/scoring", json=payload)
    app.dependency_overrides.pop(get_db, None)

    assert resp.status_code == 200
    assert resp.json()["total_score"] == 0.85


@pytest.mark.anyio
async def test_score_form_http_error(client, monkeypatch):
    app = main_module.app
    from data_service.service.scoring_service import ScoringService

    async def fake_calculate_score(self, input_data):  # noqa: D401
        raise HTTPException(status_code=400, detail="Bad scoring input")

    monkeypatch.setattr(ScoringService, "calculate_score", fake_calculate_score)

    async def fake_get_db():  # noqa: D401
        yield object()

    app.dependency_overrides[get_db] = fake_get_db

    payload = {
        "submission_id": "12345678-1234-1234-1234-123456789012",
        "form_type": "idea",
        "form_data": [
            {
                "questionId": "Q1",
                "question": "Q?",
                "answer": ["A"],
                "ai_meta_data": None,
                "type": "text",
            }
        ],
    }
    resp = await client.post("/api/score/scoring", json=payload)
    app.dependency_overrides.pop(get_db, None)

    assert resp.status_code == 400
    body = resp.json()
    # FastAPI uses 'detail' for HTTPException
    assert body.get("detail") == "Bad scoring input"


@pytest.mark.anyio
async def test_score_form_unexpected_error(client, monkeypatch):
    app = main_module.app
    from data_service.service.scoring_service import ScoringService

    async def fake_calculate_score(self, input_data):  # noqa: D401
        raise RuntimeError("Boom")

    monkeypatch.setattr(ScoringService, "calculate_score", fake_calculate_score)

    async def fake_get_db():  # noqa: D401
        yield object()

    app.dependency_overrides[get_db] = fake_get_db

    payload = {
        "submission_id": "12345678-1234-1234-1234-123456789012",
        "form_type": "idea",
        "form_data": [
            {
                "questionId": "Q1",
                "question": "Q?",
                "answer": ["A"],
                "ai_meta_data": None,
                "type": "text",
            }
        ],
    }
    # Accept either raised RuntimeError or a 500 response with JSON detail
    try:
        resp = await client.post("/api/score/scoring", json=payload)
        app.dependency_overrides.pop(get_db, None)
        assert resp.status_code == 500
        body = resp.json()
        assert "detail" in body
    except RuntimeError as e:
        assert str(e) == "Boom"
        app.dependency_overrides.pop(get_db, None)
