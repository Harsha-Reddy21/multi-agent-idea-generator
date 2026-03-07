import pytest
import main as main_module


@pytest.mark.anyio
async def test_health_db_success(monkeypatch, client):
    app = main_module.app

    class FakeSession:
        async def execute(self, *args, **kwargs):
            return None

    class CM:
        async def __aenter__(self):
            return FakeSession()

        async def __aexit__(self, exc_type, exc, tb):
            return False

    async def fake_async_session_local():
        return CM()

    # health.db uses AsyncSessionLocal() directly as async context manager
    import data_service.routes.health as health_module

    monkeypatch.setattr(health_module, "AsyncSessionLocal", lambda: CM())

    resp = await client.get("/health/db")
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "Database connection successful"


@pytest.mark.anyio
async def test_health_db_failure(monkeypatch, client):
    import data_service.routes.health as health_module

    class BadCM:
        async def __aenter__(self):
            raise RuntimeError("DB down")

        async def __aexit__(self, exc_type, exc, tb):
            return False

    monkeypatch.setattr(health_module, "AsyncSessionLocal", lambda: BadCM())
    resp = await client.get("/health/db")
    assert resp.status_code == 200  # route returns 200 with error payload
    body = resp.json()
    assert body["status"] == "Database connection failed"
    assert "DB down" in body["error"]
