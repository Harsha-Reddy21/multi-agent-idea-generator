import pytest
from fastapi import HTTPException
from data_service.db_connection.db import get_db
import main as main_module


@pytest.mark.anyio
async def test_get_suggestions_success(client, monkeypatch):
    app = main_module.app

    class FakeSuggestionsService:
        def __init__(self, db):  # noqa: D401
            self.db = db

        async def get_suggestions_by_form_type(self, form_type):  # noqa: D401
            return [
                {
                    "question_id": "Q1",
                    "question": "What is your idea?",
                    "suggestions": ["Test", "More"],
                },
                {
                    "question_id": "Q2",
                    "question": "Describe impact",
                    "suggestions": ["Impact A"],
                },
            ]

    import data_service.routes.suggestions as suggestions_route_module

    monkeypatch.setattr(
        suggestions_route_module, "SuggestionsService", FakeSuggestionsService
    )

    # Provide a trivial db session override (already overridden globally but keep isolation)
    class DummyDB:
        async def execute(self, *args, **kwargs):  # noqa: D401
            return None

    async def fake_get_db():  # noqa: D401
        yield DummyDB()

    app.dependency_overrides[get_db] = fake_get_db
    resp = await client.get("/api/suggestions", params={"form_type": "idea"})
    app.dependency_overrides.pop(get_db, None)

    assert resp.status_code == 200
    data = resp.json()
    assert data["form_type"] == "idea"
    assert len(data["data"]) == 2
    assert data["data"][0]["question_id"] == "Q1"


@pytest.mark.anyio
async def test_get_suggestions_http_error(client, monkeypatch):
    app = main_module.app

    class FakeSuggestionsService:
        def __init__(self, db):  # noqa: D401
            self.db = db

        async def get_suggestions_by_form_type(self, form_type):  # noqa: D401
            raise HTTPException(status_code=400, detail="Bad form type")

    import data_service.routes.suggestions as suggestions_route_module

    monkeypatch.setattr(
        suggestions_route_module, "SuggestionsService", FakeSuggestionsService
    )

    async def fake_get_db():  # noqa: D401
        yield object()

    app.dependency_overrides[get_db] = fake_get_db
    resp = await client.get("/api/suggestions", params={"form_type": "bad"})
    app.dependency_overrides.pop(get_db, None)

    assert resp.status_code == 400
    body = resp.json()
    # FastAPI uses 'detail' for HTTPException
    assert body.get("detail") == "Bad form type"


@pytest.mark.anyio
async def test_get_suggestions_unexpected_error(client, monkeypatch):
    app = main_module.app

    class FakeSuggestionsService:
        def __init__(self, db):  # noqa: D401
            self.db = db

        async def get_suggestions_by_form_type(self, form_type):  # noqa: D401
            raise RuntimeError("Boom")

    import data_service.routes.suggestions as suggestions_route_module

    monkeypatch.setattr(
        suggestions_route_module, "SuggestionsService", FakeSuggestionsService
    )

    async def fake_get_db():  # noqa: D401
        yield object()

    app.dependency_overrides[get_db] = fake_get_db

    try:
        resp = await client.get("/api/suggestions", params={"form_type": "idea"})
        assert resp.status_code == 500
        body = resp.json()
        assert "detail" in body
    except RuntimeError as exc:
        assert str(exc) == "Boom"
    finally:
        app.dependency_overrides.pop(get_db, None)
