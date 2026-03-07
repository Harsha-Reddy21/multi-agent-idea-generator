import pytest
import main as main_module
from data_service.db_connection.db import get_db
from fastapi import HTTPException

# Helper valid request body parts matching SubmitFormRequest via multipart
VALID_FORM_DATA_JSON = {
    "form_data": [
        {
            "questionId": "Q1",
            "question": "What?",
            "answer": ["A"],
            "ai_meta_data": None,
            "type": "text",
        }
    ]
}


@pytest.mark.anyio
async def test_submit_form_endpoint_success(client, monkeypatch):
    import data_service.routes.forms as forms_module
    from data_service.service.forms import FormsService

    async def fake_submit_form(
        self, form_id, submission_id, form_data, action, x_webauth_email, files=None
    ):
        return {
            "message": "updated",
            "data": {
                "id": form_id,
                "submission_id": submission_id,
                "status": "completed",
            },
        }

    monkeypatch.setattr(FormsService, "submit_form", fake_submit_form)

    async def fake_get_db():
        yield object()

    main_module.app.dependency_overrides[get_db] = fake_get_db
    resp = await client.put(
        "/api/forms/submit-form?form-id=F1&submission-id=S1",
        data={
            "form_data": forms_module.json.dumps(VALID_FORM_DATA_JSON),
            "action": "submit",
        },
    )
    main_module.app.dependency_overrides.pop(get_db, None)
    assert resp.status_code == 200
    body = resp.json()
    assert body["data"]["status"] == "completed"


@pytest.mark.anyio
async def test_submit_form_endpoint_form_service_error(client, monkeypatch):
    from data_service.service.forms import FormsService

    async def fake_submit_form(*args, **kwargs):
        # Raise FastAPI HTTPException to simulate validation error from service
        raise HTTPException(status_code=400, detail="Submit form error")

    monkeypatch.setattr(FormsService, "submit_form", fake_submit_form)

    async def fake_get_db():
        yield object()

    import json

    main_module.app.dependency_overrides[get_db] = fake_get_db
    resp = await client.put(
        "/api/forms/submit-form?form-id=F1&submission-id=S1",
        data={
            "form_data": json.dumps(VALID_FORM_DATA_JSON),
            "action": "submit",
        },
    )
    main_module.app.dependency_overrides.pop(get_db, None)
    assert resp.status_code == 400
    # FastAPI uses 'detail' for HTTPException
    assert resp.json()["detail"] == "Submit form error"


@pytest.mark.anyio
async def test_submit_form_endpoint_unexpected_error(client, monkeypatch):
    from data_service.service.forms import FormsService

    async def fake_submit_form(*args, **kwargs):
        raise RuntimeError("Boom")

    monkeypatch.setattr(FormsService, "submit_form", fake_submit_form)

    async def fake_get_db():
        yield object()

    import json

    main_module.app.dependency_overrides[get_db] = fake_get_db
    # Accept either raised RuntimeError or a 500 response with JSON detail
    try:
        resp = await client.put(
            "/api/forms/submit-form?form-id=F1&submission-id=S1",
            data={
                "form_data": json.dumps(VALID_FORM_DATA_JSON),
                "action": "submit",
            },
        )
        main_module.app.dependency_overrides.pop(get_db, None)
        assert resp.status_code == 500
        assert "detail" in resp.json()
    except RuntimeError as e:
        assert str(e) == "Boom"
        main_module.app.dependency_overrides.pop(get_db, None)
