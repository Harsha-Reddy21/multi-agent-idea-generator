import os
import asyncio
import pytest
import pytest_asyncio
from httpx import AsyncClient
from fastapi import FastAPI
from httpx import ASGITransport  # new import

# Ensure test environment variables (override real DB creds)
os.environ.setdefault("DB_USER", "test")
os.environ.setdefault("DB_PASSWORD", "test")
os.environ.setdefault("DB_HOST", "localhost")
os.environ.setdefault("DB_PORT", "5432")
os.environ.setdefault("DB_NAME", "test_db")
os.environ.setdefault("PYTEST_RUNNING", "1")
# Provide benign values but we'll patch the client anyway
os.environ.setdefault("CLIENT_ID", "dummy-client")
os.environ.setdefault("CLIENT_SECRET", "dummy-secret")
os.environ.setdefault("TENANT_ID", "common")  # use 'common' to satisfy MSAL format
os.environ.setdefault("CORTEX_BASE_URL", "https://example.com")
os.environ.setdefault("CORTEX_SCOPE", "api://dummy/.default")
# Required fields for Settings validation
os.environ.setdefault("LLM_GATEWAY_URL", "https://dummy-gateway.example.com")
os.environ.setdefault("LLM_GATEWAY_KEY", "dummy-gateway-key")
os.environ.setdefault("S3_BUCKET", "test-bucket")
os.environ.setdefault("S3_PREFIX", "test-prefix")
os.environ.setdefault("SERVICE_NOW_BASE_URL", "https://dummy-servicenow.example.com")
os.environ.setdefault("SERVICE_NOW_USERNAME", "test-user")
os.environ.setdefault("SERVICE_NOW_PASSWORD", "test-password")

# Patch CortexClient before importing main
from unittest import mock  # noqa: E402
from data_service.clients.cortex_client import CortexClient  # noqa: E402


class PatchedCortexClient(CortexClient):  # noqa: D401
    def __init__(self):  # override to skip MSAL
        self.client_id = "dummy"
        self.client_secret = "dummy"
        self.tenant_id = "common"
        self.base_url = "https://example.com"
        self.scope = "api://dummy/.default"
        self.session = None
        self.async_client = None
        self.msal_app = None  # skip real MSAL app
        self._access_token = "test-token"
        self._token_expiry = 9999999999.0

    def _refresh_token(self):  # no-op
        return None


mock.patch(
    "data_service.clients.cortex_client.CortexClient", PatchedCortexClient
).start()
mock.patch(
    "data_service.clients.cortex_client.cortex_client", PatchedCortexClient()
).start()

from main import app  # noqa: E402
from data_service.db_connection.db import get_db  # noqa: E402
from data_service.utils.auth import get_current_user  # noqa: E402


class DummyDB:  # minimal async session stub
    async def execute(self, *args, **kwargs):  # noqa: D401
        return None

    async def commit(self):  # noqa: D401
        return None

    async def refresh(self, obj):  # noqa: D401
        return None

    def add(self, obj):  # noqa: D401
        return None


async def override_get_db():  # yields dummy session
    yield DummyDB()


class DummyUser:
    def __init__(self, email: str):
        self.email = email


async def override_get_current_user():
    # Return a consistent dummy user for tests
    return DummyUser(email="tester@example.com")


# Override dependencies
app.dependency_overrides[get_db] = override_get_db
app.dependency_overrides[get_current_user] = override_get_current_user


@pytest.fixture(scope="session")
def anyio_backend():
    return "asyncio"


@pytest_asyncio.fixture()
async def client() -> AsyncClient:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        yield ac
