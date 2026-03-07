"""
Unit tests for llm_gateway_client.py
=====================================
Tests the LLMGatewayClient class initialization and basic methods.
"""

import pytest
from unittest.mock import MagicMock, patch, AsyncMock
import time

from data_service.clients.llm_gateway_client import LLMGatewayClient


class TestLLMGatewayClientInit:
    """Tests for LLMGatewayClient initialization."""

    @patch("data_service.clients.llm_gateway_client.ConfidentialClientApplication")
    @patch("data_service.clients.llm_gateway_client.httpx.AsyncClient")
    def test_init_creates_session(self, mock_client, mock_msal):
        """Test LLMGatewayClient initializes with httpx session."""
        client = LLMGatewayClient()

        assert client.session is not None
        mock_client.assert_called_once()

    @patch("data_service.clients.llm_gateway_client.ConfidentialClientApplication")
    @patch("data_service.clients.llm_gateway_client.httpx.AsyncClient")
    def test_init_creates_msal_app(self, mock_client, mock_msal):
        """Test LLMGatewayClient initializes with MSAL app."""
        client = LLMGatewayClient()

        mock_msal.assert_called_once()

    @patch("data_service.clients.llm_gateway_client.ConfidentialClientApplication")
    @patch("data_service.clients.llm_gateway_client.httpx.AsyncClient")
    def test_init_token_is_none(self, mock_client, mock_msal):
        """Test LLMGatewayClient starts with no token."""
        client = LLMGatewayClient()

        assert client._access_token is None
        assert client._token_expiry is None


class TestLLMGatewayClientContextManager:
    """Tests for LLMGatewayClient async context manager."""

    @pytest.mark.asyncio
    @patch("data_service.clients.llm_gateway_client.ConfidentialClientApplication")
    @patch("data_service.clients.llm_gateway_client.httpx.AsyncClient")
    async def test_aenter_returns_self(self, mock_client, mock_msal):
        """Test __aenter__ returns the client instance."""
        client = LLMGatewayClient()
        result = await client.__aenter__()

        assert result is client

    @pytest.mark.asyncio
    @patch("data_service.clients.llm_gateway_client.ConfidentialClientApplication")
    @patch("data_service.clients.llm_gateway_client.httpx.AsyncClient")
    async def test_aexit_calls_close(self, mock_client, mock_msal):
        """Test __aexit__ calls close method."""
        mock_session = AsyncMock()
        mock_client.return_value = mock_session

        client = LLMGatewayClient()
        await client.__aexit__(None, None, None)

        mock_session.aclose.assert_called_once()


class TestLLMGatewayClientClose:
    """Tests for LLMGatewayClient close method."""

    @pytest.mark.asyncio
    @patch("data_service.clients.llm_gateway_client.ConfidentialClientApplication")
    @patch("data_service.clients.llm_gateway_client.httpx.AsyncClient")
    async def test_close_clears_session(self, mock_client, mock_msal):
        """Test close sets session to None."""
        mock_session = AsyncMock()
        mock_client.return_value = mock_session

        client = LLMGatewayClient()
        await client.close()

        assert client.session is None

    @pytest.mark.asyncio
    @patch("data_service.clients.llm_gateway_client.ConfidentialClientApplication")
    @patch("data_service.clients.llm_gateway_client.httpx.AsyncClient")
    async def test_close_handles_none_session(self, mock_client, mock_msal):
        """Test close handles when session is already None."""
        client = LLMGatewayClient()
        client.session = None

        # Should not raise
        await client.close()

    @pytest.mark.asyncio
    @patch("data_service.clients.llm_gateway_client.ConfidentialClientApplication")
    @patch("data_service.clients.llm_gateway_client.httpx.AsyncClient")
    async def test_close_handles_close_error(self, mock_client, mock_msal):
        """Test close handles CloseError gracefully."""
        import httpx

        mock_session = AsyncMock()
        mock_session.aclose.side_effect = httpx.CloseError("Close failed")
        mock_client.return_value = mock_session

        client = LLMGatewayClient()

        # Should not raise
        await client.close()
        assert client.session is None

    @pytest.mark.asyncio
    @patch("data_service.clients.llm_gateway_client.ConfidentialClientApplication")
    @patch("data_service.clients.llm_gateway_client.httpx.AsyncClient")
    async def test_close_handles_runtime_error(self, mock_client, mock_msal):
        """Test close handles RuntimeError gracefully."""
        mock_session = AsyncMock()
        mock_session.aclose.side_effect = RuntimeError("Runtime error")
        mock_client.return_value = mock_session

        client = LLMGatewayClient()

        # Should not raise
        await client.close()
        assert client.session is None

    @pytest.mark.asyncio
    @patch("data_service.clients.llm_gateway_client.ConfidentialClientApplication")
    @patch("data_service.clients.llm_gateway_client.httpx.AsyncClient")
    async def test_close_handles_unexpected_error(self, mock_client, mock_msal):
        """Test close handles unexpected errors gracefully."""
        mock_session = AsyncMock()
        mock_session.aclose.side_effect = Exception("Unexpected error")
        mock_client.return_value = mock_session

        client = LLMGatewayClient()

        # Should not raise
        await client.close()
        assert client.session is None


class TestLLMGatewayClientAccessToken:
    """Tests for LLMGatewayClient access_token property."""

    @patch("data_service.clients.llm_gateway_client.ConfidentialClientApplication")
    @patch("data_service.clients.llm_gateway_client.httpx.AsyncClient")
    def test_access_token_refreshes_when_none(self, mock_client, mock_msal):
        """Test access_token refreshes when token is None."""
        mock_msal_instance = MagicMock()
        mock_msal_instance.acquire_token_for_client.return_value = {
            "access_token": "new_token",
            "expires_in": 3600,
        }
        mock_msal.return_value = mock_msal_instance

        client = LLMGatewayClient()
        token = client.access_token

        assert token == "new_token"
        mock_msal_instance.acquire_token_for_client.assert_called_once()

    @patch("data_service.clients.llm_gateway_client.ConfidentialClientApplication")
    @patch("data_service.clients.llm_gateway_client.httpx.AsyncClient")
    def test_access_token_uses_cached_token(self, mock_client, mock_msal):
        """Test access_token uses cached token when valid."""
        mock_msal_instance = MagicMock()
        mock_msal.return_value = mock_msal_instance

        client = LLMGatewayClient()
        client._access_token = "cached_token"
        client._token_expiry = time.time() + 3600  # Valid for 1 hour

        token = client.access_token

        assert token == "cached_token"
        mock_msal_instance.acquire_token_for_client.assert_not_called()

    @patch("data_service.clients.llm_gateway_client.ConfidentialClientApplication")
    @patch("data_service.clients.llm_gateway_client.httpx.AsyncClient")
    def test_access_token_refreshes_when_expired(self, mock_client, mock_msal):
        """Test access_token refreshes when token is expired."""
        mock_msal_instance = MagicMock()
        mock_msal_instance.acquire_token_for_client.return_value = {
            "access_token": "refreshed_token",
            "expires_in": 3600,
        }
        mock_msal.return_value = mock_msal_instance

        client = LLMGatewayClient()
        client._access_token = "old_token"
        client._token_expiry = time.time() - 100  # Already expired

        token = client.access_token

        assert token == "refreshed_token"
        mock_msal_instance.acquire_token_for_client.assert_called_once()
