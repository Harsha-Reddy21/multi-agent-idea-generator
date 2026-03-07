import uuid
import pytest
from data_service.db_connection.db import get_db
import main as main_module
from fastapi import HTTPException

API_PATH = "/api/check-suggestions-coverage"

VALID_SUB_ID = str(uuid.uuid4())


@pytest.mark.anyio
async def test_check_suggestions_coverage_success(client, monkeypatch):
    app = main_module.app

    async def fake_get_db():  # noqa: D401
        # DB is not used directly by the route; service consumes it. Provide a dummy.
        class Dummy:
            async def execute(self, stmt):  # pylint: disable=unused-argument
                return type("R", (), {"scalar_one_or_none": lambda self: None})()

        yield Dummy()

    class FakeSvc:
        def __init__(self, settings=None):  # noqa: D401
            self.settings = settings

        async def check_coverage_for_question(
            self, question_id, user_text, submission_id, db
        ):  # noqa: D401
            return {
                "suggestions": ["impact", "value"],
                "completed_suggestions": [{"text": "impact", "rationale": "Found"}],
                "required_suggestions": [{"text": "value", "rationale": "Missing"}],
            }

    import data_service.routes.suggestions_coverage as cov_module

    monkeypatch.setattr(cov_module, "SuggestionsCoverageService", FakeSvc)

    app.dependency_overrides[get_db] = fake_get_db
    payload = {
        "question_id": "Q1",
        "user_text": "This idea has big impact",
        "submission_id": VALID_SUB_ID,
    }
    resp = await client.post(API_PATH, json=payload)
    app.dependency_overrides.pop(get_db, None)

    assert resp.status_code == 200
    body = resp.json()
    assert len(body["completed_suggestions"]) == 1
    assert len(body["required_suggestions"]) == 1


@pytest.mark.anyio
async def test_check_suggestions_coverage_question_not_found(client, monkeypatch):
    app = main_module.app

    async def fake_get_db():  # noqa: D401
        class Dummy:
            async def execute(self, stmt):  # pylint: disable=unused-argument
                return type("R", (), {"scalar_one_or_none": lambda self: None})()

        yield Dummy()

    class FakeSvc:
        def __init__(self, settings=None):  # noqa: D401
            self.settings = settings

        async def check_coverage_for_question(
            self, question_id, user_text, submission_id, db
        ):  # noqa: D401
            raise HTTPException(status_code=404, detail="Question not found")

    import data_service.routes.suggestions_coverage as cov_module

    monkeypatch.setattr(cov_module, "SuggestionsCoverageService", FakeSvc)

    app.dependency_overrides[get_db] = fake_get_db
    resp = await client.post(
        API_PATH,
        json={"question_id": "BAD", "user_text": "txt", "submission_id": VALID_SUB_ID},
    )
    app.dependency_overrides.pop(get_db, None)

    assert resp.status_code == 404
    assert "not found" in resp.json()["detail"].lower()


@pytest.mark.anyio
async def test_check_suggestions_coverage_suggestions_missing(client, monkeypatch):
    app = main_module.app

    async def fake_get_db():  # noqa: D401
        class Dummy:
            async def execute(self, stmt):  # pylint: disable=unused-argument
                return type("R", (), {"scalar_one_or_none": lambda self: None})()

        yield Dummy()

    class FakeSvc:
        def __init__(self, settings=None):  # noqa: D401
            self.settings = settings

        async def check_coverage_for_question(
            self, question_id, user_text, submission_id, db
        ):  # noqa: D401
            raise HTTPException(status_code=404, detail="No suggestions configured")

    import data_service.routes.suggestions_coverage as cov_module

    monkeypatch.setattr(cov_module, "SuggestionsCoverageService", FakeSvc)

    app.dependency_overrides[get_db] = fake_get_db
    resp = await client.post(
        API_PATH,
        json={"question_id": "Q1", "user_text": "txt", "submission_id": VALID_SUB_ID},
    )
    app.dependency_overrides.pop(get_db, None)

    assert resp.status_code == 404
    assert "no suggestions" in resp.json()["detail"].lower()


@pytest.mark.anyio
async def test_check_suggestions_coverage_unexpected_error(client, monkeypatch):
    app = main_module.app

    async def fake_get_db():  # noqa: D401
        class Dummy:
            async def execute(self, stmt):  # pylint: disable=unused-argument
                return type("R", (), {"scalar_one_or_none": lambda self: None})()

        yield Dummy()

    class FakeSvc:
        def __init__(self, settings=None):  # noqa: D401
            self.settings = settings

        async def check_coverage_for_question(
            self, question_id, user_text, submission_id, db
        ):  # noqa: D401
            raise RuntimeError("boom")

    import data_service.routes.suggestions_coverage as cov_module

    monkeypatch.setattr(cov_module, "SuggestionsCoverageService", FakeSvc)

    app.dependency_overrides[get_db] = fake_get_db

    # Accept either a raised RuntimeError (propagated) or a 500 response from the handler
    try:
        resp = await client.post(
            API_PATH,
            json={"question_id": "Q1", "user_text": "x", "submission_id": VALID_SUB_ID},
        )
        # If no exception, validate 500 response
        assert resp.status_code == 500
        body = resp.json()
        assert "detail" in body
    except RuntimeError as exc:
        # If RuntimeError is raised directly, that's acceptable under some FastAPI/middleware behaviors
        assert str(exc) == "boom"
    finally:
        app.dependency_overrides.pop(get_db, None)
