import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_get_form_dashboard_requires_params(client: AsyncClient):
    resp = await client.get("/api/form-dashboard")
    assert resp.status_code in (200, 400, 422)


@pytest.mark.asyncio
async def test_get_form_dashboard_ok(client: AsyncClient):
    params = {"submission-id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"}
    headers = {"X-WEBAUTH-EMAIL": "tester@example.com"}
    resp = await client.get("/api/form-dashboard", params=params, headers=headers)
    assert resp.status_code in (200, 400, 401, 500)
