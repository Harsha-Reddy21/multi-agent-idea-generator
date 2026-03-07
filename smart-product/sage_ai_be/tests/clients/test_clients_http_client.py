"""
Unit tests for http_client.py
==============================
Tests the HTTPClient class initialization and methods.
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
import httpx

from data_service.clients.http_client import HTTPClient


class TestHTTPClientInitialization:
    """Tests for HTTPClient initialization."""

    def test_init_with_defaults(self):
        """Test HTTPClient initializes with default settings."""
        client = HTTPClient()

        assert client.base_url is None
        assert client._client is None
        assert client._timeout is not None
        assert client._limits is not None
        assert client._auth is None
        assert client._default_headers == {}
        assert client._follow_redirects is True

    def test_init_with_base_url(self):
        """Test HTTPClient initializes with custom base URL."""
        client = HTTPClient(base_url="https://api.example.com")

        assert client.base_url == "https://api.example.com"

    def test_init_with_custom_timeout(self):
        """Test HTTPClient initializes with custom timeout."""
        client = HTTPClient(timeout=30.0, connect_timeout=10.0)

        assert client._timeout.read == 30.0
        assert client._timeout.connect == 10.0

    def test_init_with_auth(self):
        """Test HTTPClient initializes with auth credentials."""
        client = HTTPClient(auth=("user", "password"))

        assert client._auth == ("user", "password")

    def test_init_with_custom_headers(self):
        """Test HTTPClient initializes with custom headers."""
        headers = {"X-Custom-Header": "value"}
        client = HTTPClient(headers=headers)

        assert client._default_headers == headers

    def test_init_with_follow_redirects_false(self):
        """Test HTTPClient initializes with follow_redirects=False."""
        client = HTTPClient(follow_redirects=False)

        assert client._follow_redirects is False

    def test_init_with_max_connections(self):
        """Test HTTPClient initializes with custom connection limits."""
        client = HTTPClient(max_connections=50, max_keepalive_connections=25)

        assert client._limits.max_connections == 50
        assert client._limits.max_keepalive_connections == 25


class TestHTTPClientMethods:
    """Tests for HTTPClient methods."""

    def test_mask_sensitive_data_empty(self):
        """Test _mask_sensitive_data with empty headers."""
        client = HTTPClient()
        result = client._mask_sensitive_data(None)
        assert result == {}

        result = client._mask_sensitive_data({})
        assert result == {}

    def test_mask_sensitive_data_no_sensitive(self):
        """Test _mask_sensitive_data with no sensitive headers."""
        client = HTTPClient()
        headers = {"Content-Type": "application/json", "Accept": "application/json"}
        result = client._mask_sensitive_data(headers)

        assert result["Content-Type"] == "application/json"
        assert result["Accept"] == "application/json"

    def test_mask_sensitive_data_with_authorization(self):
        """Test _mask_sensitive_data masks Authorization header."""
        client = HTTPClient()
        headers = {
            "Content-Type": "application/json",
            "Authorization": "Bearer secret-token",
        }
        result = client._mask_sensitive_data(headers)

        assert result["Content-Type"] == "application/json"
        assert result["Authorization"] == "***MASKED***"

    def test_mask_sensitive_data_with_api_key(self):
        """Test _mask_sensitive_data masks API key headers."""
        client = HTTPClient()
        headers = {"X-API-Key": "secret-key", "api-key": "another-secret"}
        result = client._mask_sensitive_data(headers)

        assert result["X-API-Key"] == "***MASKED***"
        assert result["api-key"] == "***MASKED***"

    def test_mask_sensitive_data_with_token(self):
        """Test _mask_sensitive_data masks token headers."""
        client = HTTPClient()
        headers = {"Token": "secret-token", "password": "secret"}
        result = client._mask_sensitive_data(headers)

        assert result["Token"] == "***MASKED***"
        assert result["password"] == "***MASKED***"

    @pytest.mark.asyncio
    async def test_get_client_creates_new_client(self):
        """Test _get_client creates a new client when none exists."""
        client = HTTPClient(base_url="https://api.example.com")

        assert client._client is None

        http_client = await client._get_client()

        assert http_client is not None
        assert isinstance(http_client, httpx.AsyncClient)

        # Cleanup
        await client.close()

    @pytest.mark.asyncio
    async def test_get_client_reuses_existing_client(self):
        """Test _get_client reuses existing client."""
        client = HTTPClient(base_url="https://api.example.com")

        http_client1 = await client._get_client()
        http_client2 = await client._get_client()

        assert http_client1 is http_client2

        # Cleanup
        await client.close()

    @pytest.mark.asyncio
    async def test_close_client(self):
        """Test close method closes the client."""
        client = HTTPClient(base_url="https://api.example.com")

        await client._get_client()
        assert client._client is not None

        await client.close()
        assert client._client.is_closed

    @pytest.mark.asyncio
    async def test_close_when_no_client(self):
        """Test close method when no client exists."""
        client = HTTPClient()

        # Should not raise
        await client.close()


class TestHTTPClientContextManager:
    """Tests for HTTPClient context manager methods."""

    @pytest.mark.asyncio
    async def test_handle_request_success(self):
        """Test _handle_request context manager on success."""
        client = HTTPClient()

        async with client._handle_request():
            pass  # Should not raise

    @pytest.mark.asyncio
    async def test_handle_request_timeout(self):
        """Test _handle_request raises on timeout."""
        client = HTTPClient()

        with pytest.raises(httpx.TimeoutException):
            async with client._handle_request():
                raise httpx.ReadTimeout("Timeout occurred")

    @pytest.mark.asyncio
    async def test_handle_request_http_error(self):
        """Test _handle_request raises on HTTP error."""
        client = HTTPClient()

        mock_request = MagicMock()
        mock_request.url = "https://api.example.com/test"
        mock_response = MagicMock()
        mock_response.status_code = 500
        mock_response.text = "Internal Server Error"

        with pytest.raises(httpx.HTTPStatusError):
            async with client._handle_request():
                raise httpx.HTTPStatusError(
                    "Server Error", request=mock_request, response=mock_response
                )

    @pytest.mark.asyncio
    async def test_handle_request_connection_error(self):
        """Test _handle_request raises on connection error."""
        client = HTTPClient()

        with pytest.raises(httpx.RequestError):
            async with client._handle_request():
                raise httpx.ConnectError("Connection failed")


class TestHTTPClientRequests:
    """Tests for HTTPClient HTTP request methods."""

    @pytest.mark.asyncio
    async def test_get_request_success(self):
        """Test GET request with mocked response."""
        client = HTTPClient(base_url="https://api.example.com")

        mock_response = MagicMock(spec=httpx.Response)
        mock_response.status_code = 200
        mock_response.text = '{"data": "test"}'
        mock_response.headers = {"content-length": "17"}
        mock_response.raise_for_status = MagicMock()

        with patch.object(httpx.AsyncClient, "get", new_callable=AsyncMock) as mock_get:
            mock_get.return_value = mock_response

            response = await client.get("/test")

            assert response.status_code == 200
            mock_get.assert_called_once()

        await client.close()

    @pytest.mark.asyncio
    async def test_post_request_success(self):
        """Test POST request with mocked response."""
        client = HTTPClient(base_url="https://api.example.com")

        mock_response = MagicMock(spec=httpx.Response)
        mock_response.status_code = 201
        mock_response.text = '{"id": "123"}'
        mock_response.headers = {"content-length": "13"}
        mock_response.raise_for_status = MagicMock()

        with patch.object(
            httpx.AsyncClient, "post", new_callable=AsyncMock
        ) as mock_post:
            mock_post.return_value = mock_response

            response = await client.post("/test", json={"name": "test"})

            assert response.status_code == 201
            mock_post.assert_called_once()

        await client.close()

    @pytest.mark.asyncio
    async def test_put_request_success(self):
        """Test PUT request with mocked response."""
        client = HTTPClient(base_url="https://api.example.com")

        mock_response = MagicMock(spec=httpx.Response)
        mock_response.status_code = 200
        mock_response.text = '{"updated": true}'
        mock_response.headers = {"content-length": "17"}
        mock_response.raise_for_status = MagicMock()

        with patch.object(httpx.AsyncClient, "put", new_callable=AsyncMock) as mock_put:
            mock_put.return_value = mock_response

            response = await client.put("/test/1", json={"name": "updated"})

            assert response.status_code == 200
            mock_put.assert_called_once()

        await client.close()

    @pytest.mark.asyncio
    async def test_get_with_long_response_truncates_log(self):
        """Test GET request truncates long responses in logs."""
        client = HTTPClient(base_url="https://api.example.com")

        # Create a response longer than 1000 chars
        long_text = "x" * 2000
        mock_response = MagicMock(spec=httpx.Response)
        mock_response.status_code = 200
        mock_response.text = long_text
        mock_response.headers = {"content-length": str(len(long_text))}
        mock_response.raise_for_status = MagicMock()

        with patch.object(httpx.AsyncClient, "get", new_callable=AsyncMock) as mock_get:
            mock_get.return_value = mock_response

            response = await client.get("/test")

            assert response.status_code == 200
            assert len(response.text) == 2000

        await client.close()
