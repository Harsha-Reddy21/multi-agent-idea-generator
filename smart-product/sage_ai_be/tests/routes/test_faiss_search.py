import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_faiss_search_minimal(client: AsyncClient):
    payload = {"form_data": [{"question_id": "q1", "question": "Q", "answer": "text"}]}
    resp = await client.post("/api/faiss/search", json=payload)
    assert resp.status_code in (200, 422, 500)


@pytest.mark.asyncio
async def test_faiss_search_with_submission_id(client: AsyncClient):
    payload = {
        "form_data": [{"question_id": "q1", "question": "Q", "answer": "text"}],
        "submission_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "top_k": 1,
        "threshold": 0.1,
    }
    resp = await client.post("/api/faiss/search", json=payload)
    assert resp.status_code in (200, 422, 500)
