import pytest
import main as main_module
from data_service.db_connection.db import get_db
from fastapi import HTTPException


@pytest.mark.anyio
async def test_auto_populate_common_fields_success(client, monkeypatch):
    from data_service.service.forms import FormsService

    async def fake_auto_populate(self, input_data, x_webauth_email):
        # Return shape matching CommonFieldsResponse
        return {
            "common_fields": [
                {"question_id": "Q1", "question": "Q text", "answer": "A"}
            ]
        }

    monkeypatch.setattr(FormsService, "auto_populate_common_fields", fake_auto_populate)

    async def fake_get_db():
        yield object()

    main_module.app.dependency_overrides[get_db] = fake_get_db
    # Use valid UUIDs for submission_id/form_id to satisfy validation
    payload = {
        "form_type": "type",
        "submission_id": "123e4567-e89b-12d3-a456-426614174000",
        "form_id": "123e4567-e89b-12d3-a456-426614174001",
    }
    resp = await client.post(
        "/api/forms/auto-populate/common-fields",
        json=payload,
        headers={"X-WEBAUTH-EMAIL": "user@example.com"},
    )
    main_module.app.dependency_overrides.pop(get_db, None)
    assert resp.status_code == 200
    body = resp.json()
    assert body["common_fields"][0]["question_id"] == "Q1"
    assert body["common_fields"][0]["question"] == "Q text"
    assert body["common_fields"][0]["answer"] == "A"


@pytest.mark.anyio
async def test_auto_populate_common_fields_http_error(client, monkeypatch):
    from data_service.service.forms import FormsService

    async def fake_auto_populate(self, input_data, x_webauth_email):
        raise HTTPException(status_code=400, detail="Bad request")

    monkeypatch.setattr(FormsService, "auto_populate_common_fields", fake_auto_populate)

    async def fake_get_db():
        yield object()

    main_module.app.dependency_overrides[get_db] = fake_get_db
    payload = {
        "form_type": "type",
        "submission_id": "123e4567-e89b-12d3-a456-426614174000",
        "form_id": "123e4567-e89b-12d3-a456-426614174001",
    }
    resp = await client.post(
        "/api/forms/auto-populate/common-fields",
        json=payload,
        headers={"X-WEBAUTH-EMAIL": "user@example.com"},
    )
    main_module.app.dependency_overrides.pop(get_db, None)
    assert resp.status_code == 400
    # FastAPI uses 'detail' for HTTPException
    assert resp.json()["detail"] == "Bad request"


@pytest.mark.anyio
async def test_auto_populate_common_fields_unexpected_error(client, monkeypatch):
    from data_service.service.forms import FormsService

    async def fake_auto_populate(self, input_data, x_webauth_email):
        raise RuntimeError("Boom")

    monkeypatch.setattr(FormsService, "auto_populate_common_fields", fake_auto_populate)

    async def fake_get_db():
        yield object()

    main_module.app.dependency_overrides[get_db] = fake_get_db
    payload = {
        "form_type": "type",
        "submission_id": "123e4567-e89b-12d3-a456-426614174000",
        "form_id": "123e4567-e89b-12d3-a456-426614174001",
    }
    # Accept either raised RuntimeError or a 500 response with JSON detail
    try:
        resp = await client.post(
            "/api/forms/auto-populate/common-fields",
            json=payload,
            headers={"X-WEBAUTH-EMAIL": "user@example.com"},
        )
        main_module.app.dependency_overrides.pop(get_db, None)
        assert resp.status_code == 500
        body = resp.json()
        assert "detail" in body
    except RuntimeError as e:
        # If middleware lets the error bubble up, ensure it's the expected runtime error
        assert str(e) == "Boom"
        main_module.app.dependency_overrides.pop(get_db, None)
