import pytest
from unittest.mock import AsyncMock, MagicMock, patch
import httpx

from data_service.clients.service_now_client import ServiceNowClient


class FakeResponse:
    def __init__(self, status_code=200, json_data=None, text="OK"):
        self.status_code = status_code
        self._json = json_data or {}
        self.text = text

    def json(self):
        if isinstance(self._json, Exception):
            raise self._json
        return self._json


class FakeSettings:
    service_now_base_url = "https://instance/"
    service_now_username = "user"
    service_now_password = "pass"
    service_now_timeout = 30
    service_now_connect_timeout = 10
    service_now_max_connections = 100
    service_now_max_keepalive_connections = 20


@pytest.fixture(autouse=True)
def patch_settings(monkeypatch):
    monkeypatch.setattr(
        "data_service.clients.service_now_client.settings", FakeSettings
    )


@pytest.fixture
def mock_http_client():
    """Mock the get_http_client function to return a mock HTTP client"""
    with patch(
        "data_service.clients.service_now_client.get_http_client"
    ) as mock_get_client:
        mock_client = MagicMock()
        mock_get_client.return_value = mock_client
        yield mock_client


@pytest.mark.asyncio
async def test_get_approved_ideas_count_success(mock_http_client):
    """Test successful retrieval of approved ideas count"""
    mock_response = FakeResponse(200, {"result": {"stats": {"count": "5"}}})
    mock_http_client.get = AsyncMock(return_value=mock_response)

    client = ServiceNowClient()
    count = await client.get_approved_ideas_count(days=7)

    assert count == 5
    mock_http_client.get.assert_called_once()


@pytest.mark.asyncio
async def test_get_approved_ideas_count_http_error(mock_http_client):
    """Test HTTP error handling for approved ideas count"""
    mock_http_client.get = AsyncMock(
        side_effect=httpx.HTTPStatusError(
            "Server error", request=MagicMock(), response=MagicMock(status_code=500)
        )
    )

    client = ServiceNowClient()

    with pytest.raises(httpx.HTTPStatusError):
        await client.get_approved_ideas_count()


@pytest.mark.asyncio
async def test_get_approved_ideas_count_invalid_json(mock_http_client):
    """Test invalid JSON response handling for approved ideas count"""
    mock_response = FakeResponse(200, json_data=ValueError("bad json"))
    mock_http_client.get = AsyncMock(return_value=mock_response)

    client = ServiceNowClient()

    with pytest.raises(ValueError):
        await client.get_approved_ideas_count()


@pytest.mark.asyncio
async def test_get_top_approved_ideas_success(mock_http_client):
    """Test successful retrieval of top approved ideas"""
    ideas = [{"id": 1}, {"id": 2}]
    mock_response = FakeResponse(200, {"result": ideas})
    mock_http_client.get = AsyncMock(return_value=mock_response)

    client = ServiceNowClient()
    result = await client.get_top_approved_ideas(limit=3)

    assert len(result) == 2
    assert result == ideas
    mock_http_client.get.assert_called_once()


@pytest.mark.asyncio
async def test_get_top_approved_ideas_http_error(mock_http_client):
    """Test HTTP error handling for top approved ideas"""
    mock_http_client.get = AsyncMock(
        side_effect=httpx.HTTPStatusError(
            "Not found", request=MagicMock(), response=MagicMock(status_code=404)
        )
    )

    client = ServiceNowClient()

    with pytest.raises(httpx.HTTPStatusError):
        await client.get_top_approved_ideas()


@pytest.mark.asyncio
async def test_get_top_approved_ideas_invalid_json(mock_http_client):
    """Test invalid JSON response handling for top approved ideas"""
    mock_response = FakeResponse(200, json_data=ValueError("bad json"))
    mock_http_client.get = AsyncMock(return_value=mock_response)

    client = ServiceNowClient()

    with pytest.raises(ValueError):
        await client.get_top_approved_ideas()


@pytest.mark.asyncio
async def test_get_user_details_success(mock_http_client):
    """Test successful retrieval of user details"""
    mock_response = FakeResponse(200, {"result": {"name": "Alice"}})
    mock_http_client.get = AsyncMock(return_value=mock_response)

    client = ServiceNowClient()
    user_name = await client.get_user_details("https://user/1")

    assert user_name == "Alice"
    mock_http_client.get.assert_called_once_with("https://user/1")


@pytest.mark.asyncio
async def test_get_user_details_http_error(mock_http_client):
    """Test HTTP error handling for user details"""
    mock_http_client.get = AsyncMock(
        side_effect=httpx.HTTPStatusError(
            "Forbidden", request=MagicMock(), response=MagicMock(status_code=403)
        )
    )

    client = ServiceNowClient()

    with pytest.raises(httpx.HTTPStatusError):
        await client.get_user_details("https://user/1")


@pytest.mark.asyncio
async def test_get_user_details_invalid_json(mock_http_client):
    """Test invalid JSON response handling for user details"""
    mock_response = FakeResponse(200, json_data=ValueError("bad json"))
    mock_http_client.get = AsyncMock(return_value=mock_response)

    client = ServiceNowClient()

    with pytest.raises(ValueError):
        await client.get_user_details("https://user/1")


@pytest.mark.asyncio
async def test_get_approved_ideas_count_request_exception(mock_http_client):
    """Test request exception handling for approved ideas count"""
    mock_http_client.get = AsyncMock(side_effect=httpx.RequestError("network error"))

    client = ServiceNowClient()

    with pytest.raises(httpx.RequestError):
        await client.get_approved_ideas_count()


@pytest.mark.asyncio
async def test_get_top_approved_ideas_request_exception(mock_http_client):
    """Test request exception handling for top approved ideas"""
    mock_http_client.get = AsyncMock(side_effect=httpx.TimeoutException("timeout"))

    client = ServiceNowClient()

    with pytest.raises(httpx.TimeoutException):
        await client.get_top_approved_ideas()


@pytest.mark.asyncio
async def test_get_user_details_request_exception(mock_http_client):
    """Test request exception handling for user details"""
    mock_http_client.get = AsyncMock(side_effect=httpx.RequestError("dns error"))

    client = ServiceNowClient()

    with pytest.raises(httpx.RequestError):
        await client.get_user_details("https://user/1")
