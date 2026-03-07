import pytest
import main as main_module
from data_service.db_connection.db import get_db
from fastapi import HTTPException

VALID_FORM_ID = "123e4567-e89b-12d3-a456-426614174010"
VALID_SUBMISSION_ID = "123e4567-e89b-12d3-a456-426614174011"
VALID_SCHEMA_ID = "123e4567-e89b-12d3-a456-426614174000"


@pytest.mark.anyio
async def test_get_form_details_success(client, monkeypatch):
    from data_service.service.forms import FormsService

    # Return shape matching FormResponse (message + data FormSerializer fields)
    async def fake_get_form_details(self, form_id, submission_id, x_webauth_email):
        return {
            "message": "ok",
            "data": {
                "id": VALID_FORM_ID,
                "submission_id": VALID_SUBMISSION_ID,
                "form_schema_id": VALID_SCHEMA_ID,
                "form_type": "idea",
                "form_data": {},
                "status": "in_progress",
                "submitted_at": None,
            },
        }

    monkeypatch.setattr(FormsService, "get_form_details", fake_get_form_details)

    async def fake_get_db():
        yield object()

    main_module.app.dependency_overrides[get_db] = fake_get_db
    resp = await client.get(
        f"/api/forms/get-form-details?form-id={VALID_FORM_ID}&submission-id={VALID_SUBMISSION_ID}"
    )
    main_module.app.dependency_overrides.pop(get_db, None)
    assert resp.status_code == 200
    body = resp.json()
    assert body["data"]["status"] == "in_progress"


@pytest.mark.anyio
async def test_get_form_details_form_service_error(client, monkeypatch):
    from data_service.service.forms import FormsService

    async def fake_get_form_details(*args, **kwargs):
        from fastapi import HTTPException

        raise HTTPException(status_code=400, detail="Bad")

    # Only patch the service function
    monkeypatch.setattr(FormsService, "get_form_details", fake_get_form_details)

    async def fake_get_db():
        yield object()

    main_module.app.dependency_overrides[get_db] = fake_get_db
    resp = await client.get(
        f"/api/forms/get-form-details?form-id={VALID_FORM_ID}&submission-id={VALID_SUBMISSION_ID}"
    )
    main_module.app.dependency_overrides.pop(get_db, None)
    assert resp.status_code == 400
    body = resp.json()
    # FastAPI HTTPException returns {'detail': 'Bad'}
    assert body.get("detail") == "Bad" or body.get("error") == "validation_error"


@pytest.mark.anyio
async def test_get_form_details_unexpected_error(client, monkeypatch):
    from data_service.service.forms import FormsService

    async def fake_get_form_details(*args, **kwargs):
        raise RuntimeError("Crash")

    monkeypatch.setattr(FormsService, "get_form_details", fake_get_form_details)

    async def fake_get_db():
        yield object()

    main_module.app.dependency_overrides[get_db] = fake_get_db

    # Depending on middleware/handlers, unexpected errors may bubble up.
    try:
        resp = await client.get(
            f"/api/forms/get-form-details?form-id={VALID_FORM_ID}&submission-id={VALID_SUBMISSION_ID}"
        )
        main_module.app.dependency_overrides.pop(get_db, None)
        assert resp.status_code == 500
        body = resp.json()
        assert "detail" in body or body.get("error") == "unexpected_error"
    except RuntimeError as exc:
        main_module.app.dependency_overrides.pop(get_db, None)
        assert str(exc) == "Crash"
