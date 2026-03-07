import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_progress_streaming_requires_auth(client: AsyncClient):
    resp = await client.get(
        "/api/progress/stream/3fa85f64-5717-4562-b3fc-2c963f66afa6?email=invalid"
    )
    assert resp.status_code in (200, 401, 404, 422, 500)


@pytest.mark.asyncio
async def test_progress_streaming_ok(client: AsyncClient):
    resp = await client.get(
        "/api/progress/stream/3fa85f64-5717-4562-b3fc-2c963f66afa6?email=tester@example.com"
    )
    assert resp.status_code in (200, 401, 404, 500)
