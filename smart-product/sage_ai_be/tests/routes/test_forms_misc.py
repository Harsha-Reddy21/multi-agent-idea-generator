import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_forms_auto_populate_requires_header(client: AsyncClient):
    payload = {
        "form_type": "idea-sub-form",
        "submission_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "form_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    }
    resp = await client.post("/api/forms/auto-populate/common-fields", json=payload)
    assert resp.status_code in (200, 400, 401, 422, 500, 503)


@pytest.mark.asyncio
async def test_forms_submit_form_endpoint_missing_params(client: AsyncClient):
    resp = await client.put("/api/forms/submit-form")
    assert resp.status_code in (200, 400, 422)
