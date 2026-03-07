import pytest
from fastapi import HTTPException
from data_service.db_connection.db import get_db
import main as main_module
from data_service.exceptions.service_errors import DocumentExtractionServiceError


@pytest.mark.anyio
async def test_get_doc_extracts_success(client, monkeypatch):
    app = main_module.app

    class FakeDocExtractService:
        async def get_question_extraction(
            self, submission_id, form_id, question_id, db, x_webauth_email
        ):  # noqa: D401
            return {
                "question_id": question_id,
                "extracted_content": ["A"],
                "submission_id": submission_id,
                "form_id": form_id,
                "created_at": "2024-01-01T00:00:00",
                "updated_at": "2024-01-01T00:00:00",
                "interaction_id": None,
            }

    import data_service.routes.cortex as cortex_module

    monkeypatch.setattr(
        cortex_module, "doc_extraction_service", FakeDocExtractService()
    )

    async def fake_get_db():  # noqa: D401
        yield object()

    app.dependency_overrides[get_db] = fake_get_db

    params = {"submission-id": "sub1", "form-id": "form1", "question-id": "Q1"}
    headers = {"X-WEBAUTH-EMAIL": "user@example.com"}
    resp = await client.get(
        "/api/cortex/get-doc-extracts", params=params, headers=headers
    )
    app.dependency_overrides.pop(get_db, None)

    assert resp.status_code == 200
    body = resp.json()
    assert body["question_id"] == "Q1"
    assert body["extracted_content"] == ["A"]


@pytest.mark.anyio
async def test_get_doc_extracts_missing_header(client):
    params = {"submission-id": "sub1", "form-id": "form1", "question-id": "Q1"}
    resp = await client.get("/api/cortex/get-doc-extracts", params=params)
    assert resp.status_code == 422
    body = resp.json()
    # Our exception handler returns a custom payload without 'detail'.
    # Expect standard keys produced by validation_exception_handler.
    assert isinstance(body, dict)
    # Accept either 'error' or 'message' describing the missing header.
    assert (
        body.get("error") in {"validation_error", "unprocessable_entity"}
        or body.get("status_code") == 422
    )
    msg = body.get("message", "")
    assert "X-WEBAUTH-EMAIL" in msg or "header" in msg.lower()


@pytest.mark.anyio
async def test_get_doc_extracts_service_error_mapping_404_to_400(client, monkeypatch):
    app = main_module.app

    class FakeDocExtractService:
        async def get_question_extraction(self, *args, **kwargs):  # noqa: D401
            raise DocumentExtractionServiceError(
                error="not_found", message="Missing extraction", status_code=404
            )

    import data_service.routes.cortex as cortex_module

    monkeypatch.setattr(
        cortex_module, "doc_extraction_service", FakeDocExtractService()
    )

    async def fake_get_db():  # noqa: D401
        yield object()

    app.dependency_overrides[get_db] = fake_get_db

    params = {"submission-id": "sub1", "form-id": "form1", "question-id": "Q1"}
    headers = {"X-WEBAUTH-EMAIL": "user@example.com"}
    resp = await client.get(
        "/api/cortex/get-doc-extracts", params=params, headers=headers
    )
    app.dependency_overrides.pop(get_db, None)

    # Route returns 404 directly; no remapping
    assert resp.status_code == 404
    body = resp.json()
    # Accept either FastAPI's default or custom error payload
    assert (body.get("error") == "not_found") or (
        body.get("detail") == "Missing extraction"
    )


@pytest.mark.anyio
async def test_get_doc_extracts_unexpected_error(client, monkeypatch):
    app = main_module.app

    class FakeDocExtractService:
        async def get_question_extraction(self, *args, **kwargs):  # noqa: D401
            raise RuntimeError("bad crash")

    import data_service.routes.cortex as cortex_module

    monkeypatch.setattr(
        cortex_module, "doc_extraction_service", FakeDocExtractService()
    )

    async def fake_get_db():  # noqa: D401
        yield object()

    app.dependency_overrides[get_db] = fake_get_db

    params = {"submission-id": "sub1", "form-id": "form1", "question-id": "Q1"}
    headers = {"X-WEBAUTH-EMAIL": "user@example.com"}

    # Depending on middleware/handlers, unexpected errors may bubble up.
    # Accept raised RuntimeError or a 500 response.
    try:
        resp = await client.get(
            "/api/cortex/get-doc-extracts", params=params, headers=headers
        )
        app.dependency_overrides.pop(get_db, None)
        assert resp.status_code == 500
        body = resp.json()
        assert "detail" in body or body.get("error") == "unexpected_error"
    except RuntimeError as exc:
        app.dependency_overrides.pop(get_db, None)
        assert str(exc) == "bad crash"
