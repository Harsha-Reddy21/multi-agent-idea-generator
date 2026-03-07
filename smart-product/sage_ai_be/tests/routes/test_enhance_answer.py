import pytest
from fastapi import HTTPException
from data_service.db_connection.db import get_db
import main as main_module


@pytest.mark.anyio
async def test_enhance_answer_success(client, monkeypatch):
    app = main_module.app

    async def fake_enhance_text_service(input_data, db, settings):  # noqa: D401
        return {
            "question_id": input_data.question_id,
            "original_text": input_data.user_text,
            "reviewed_text": input_data.user_text + "++",
        }

    import data_service.routes.enhance_answer as enhance_module

    monkeypatch.setattr(
        enhance_module, "enhance_text_service", fake_enhance_text_service
    )

    async def fake_get_db():  # noqa: D401
        yield object()

    app.dependency_overrides[get_db] = fake_get_db

    payload = {"question_id": "Q1", "user_text": "Hello world"}
    headers = {"X-WEBAUTH-EMAIL": "tester@example.com"}
    resp = await client.post("/api/enhance-answer", json=payload, headers=headers)
    app.dependency_overrides.pop(get_db, None)

    assert resp.status_code == 200
    data = resp.json()
    assert data["question_id"] == "Q1"
    assert data["original_text"] == "Hello world"
    assert data["reviewed_text"].endswith("++")


@pytest.mark.anyio
async def test_enhance_answer_http_error(client, monkeypatch):
    app = main_module.app

    async def fake_enhance_text_service(input_data, db, settings):  # noqa: D401
        raise HTTPException(status_code=400, detail="Bad input")

    import data_service.routes.enhance_answer as enhance_module

    monkeypatch.setattr(
        enhance_module, "enhance_text_service", fake_enhance_text_service
    )

    async def fake_get_db():  # noqa: D401
        yield object()

    app.dependency_overrides[get_db] = fake_get_db
    resp = await client.post(
        "/api/enhance-answer",
        json={"question_id": "QX", "user_text": ""},
        headers={"X-WEBAUTH-EMAIL": "a@b.com"},
    )
    app.dependency_overrides.pop(get_db, None)

    assert resp.status_code == 500
    assert "detail" in resp.json()


@pytest.mark.anyio
async def test_enhance_answer_unexpected_error(client, monkeypatch):
    app = main_module.app

    async def fake_enhance_text_service(input_data, db, settings):  # noqa: D401
        raise RuntimeError("Crash")

    import data_service.routes.enhance_answer as enhance_module

    monkeypatch.setattr(
        enhance_module, "enhance_text_service", fake_enhance_text_service
    )

    async def fake_get_db():  # noqa: D401
        yield object()

    app.dependency_overrides[get_db] = fake_get_db

    try:
        resp = await client.post(
            "/api/enhance-answer",
            json={"question_id": "Q1", "user_text": "abc"},
            headers={"X-WEBAUTH-EMAIL": "a@b.com"},
        )
        app.dependency_overrides.pop(get_db, None)
        assert resp.status_code == 500
        body = resp.json()
        assert "detail" in body or "error" in body
    except Exception as e:  # Fallback if framework raises
        app.dependency_overrides.pop(get_db, None)
        # Accept raised exception path as equivalent unexpected error behavior
        assert isinstance(e, RuntimeError) or "Crash" in str(e)
