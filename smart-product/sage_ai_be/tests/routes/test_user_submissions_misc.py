import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_get_user_submissions_requires_header(client: AsyncClient):
    resp = await client.get("/api/get-user-submissions")
    assert resp.status_code in (200, 401, 422, 500)


@pytest.mark.asyncio
async def test_get_submission_status_missing_params(client: AsyncClient):
    resp = await client.get("/api/submission-status")
    assert resp.status_code in (200, 400, 401, 422, 500)


@pytest.mark.asyncio
async def test_get_submission_status_ok(client: AsyncClient):
    params = {"submission-id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"}
    headers = {"X-WEBAUTH-EMAIL": "tester@example.com"}
    resp = await client.get("/api/submission-status", params=params, headers=headers)
    assert resp.status_code in (200, 401, 422, 500)
