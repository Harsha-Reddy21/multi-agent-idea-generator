"""
Centralized HTTP Client Module
===============================
Provides a shared, configurable HTTP client for all external API calls.
Similar to RestClient in Spring Boot applications.

Features:
- Connection pooling and reuse
- Configurable timeouts and retry logic
- Proper resource management
- Consistent error handling
"""

import logging
from typing import Optional, Dict, Any
from contextlib import asynccontextmanager

import httpx
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
)

from data_service.configurations.settings import settings

logger = logging.getLogger(__name__)


class HTTPClient:
    """
    Centralized HTTP client for making external API calls.
    Provides connection pooling, timeout management, and retry logic.
    """

    def __init__(  # pylint: disable=too-many-arguments
        self,
        base_url: Optional[str] = None,
        *,
        timeout: Optional[float] = None,
        connect_timeout: Optional[float] = None,
        max_connections: Optional[int] = None,
        max_keepalive_connections: Optional[int] = None,
        auth: Optional[tuple] = None,
        headers: Optional[Dict[str, str]] = None,
        follow_redirects: bool = True,
    ):
        """
        Initialize the HTTP client with configuration.
        Uses settings.py defaults if parameters not provided.

        Args:
            base_url: Optional base URL for all requests
            timeout: Total timeout for requests in seconds (default: from settings)
            connect_timeout: Connection timeout in seconds (default: from settings)
            max_connections: Maximum number of concurrent connections (default: from settings)
            max_keepalive_connections: Maximum keepalive connections (default: from settings)
            auth: Optional tuple of (username, password) for basic auth
            headers: Optional default headers for all requests
            follow_redirects: Whether to follow redirects (default: True)
        """
        self.base_url = base_url
        self._client: Optional[httpx.AsyncClient] = None

        # Use settings defaults if not provided
        timeout = timeout if timeout is not None else settings.http_timeout
        connect_timeout = (
            connect_timeout
            if connect_timeout is not None
            else settings.http_connect_timeout
        )
        max_connections = (
            max_connections
            if max_connections is not None
            else settings.http_max_connections
        )
        max_keepalive_connections = (
            max_keepalive_connections
            if max_keepalive_connections is not None
            else settings.http_max_keepalive_connections
        )

        self._timeout = httpx.Timeout(timeout, connect=connect_timeout)
        self._limits = httpx.Limits(
            max_connections=max_connections,
            max_keepalive_connections=max_keepalive_connections,
        )
        self._auth = auth
        self._default_headers = headers or {}
        self._follow_redirects = follow_redirects

    async def _get_client(self) -> httpx.AsyncClient:
        """
        Get or create the httpx.AsyncClient instance.
        Lazy initialization with connection pooling.

        Returns:
            httpx.AsyncClient: Configured async HTTP client
        """
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(
                base_url=self.base_url,
                timeout=self._timeout,
                limits=self._limits,
                auth=self._auth,
                headers=self._default_headers,
                follow_redirects=self._follow_redirects,
            )
            logger.debug(
                "HTTP client initialized with base_url=%s, timeout=%s",
                self.base_url,
                self._timeout,
            )
        return self._client

    async def close(self):
        """Close the HTTP client and release connections."""
        if self._client and not self._client.is_closed:
            await self._client.aclose()
            logger.debug("HTTP client closed")

    def _mask_sensitive_data(self, headers: Optional[Dict[str, str]]) -> Dict[str, str]:
        """Mask sensitive information in headers for logging."""
        if not headers:
            return {}

        masked = headers.copy()
        sensitive_keys = ["authorization", "x-api-key", "api-key", "token", "password"]

        for key in masked:
            if key.lower() in sensitive_keys:
                masked[key] = "***MASKED***"

        return masked

    @asynccontextmanager
    async def _handle_request(self):
        """Context manager for handling HTTP requests with proper error context."""
        try:
            yield
        except httpx.TimeoutException as e:
            logger.error("HTTP request timed out: %s", str(e))
            raise
        except httpx.HTTPStatusError as e:
            logger.error(
                "HTTP error %s for %s: %s",
                e.response.status_code,
                e.request.url,
                e.response.text,
            )
            raise
        except httpx.RequestError as e:
            logger.error("HTTP request error: %s", str(e))
            raise

    async def get(  # pylint: disable=too-many-arguments
        self,
        url: str,
        params: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None,
        *,
        retry_attempts: Optional[int] = None,
        retry_min_wait: Optional[int] = None,
        retry_max_wait: Optional[int] = None,
        retry_multiplier: Optional[int] = None,
        **kwargs,
    ) -> httpx.Response:
        """
        Make a GET request with automatic retry on timeout/network errors.

        Args:
            url: URL or path (appended to base_url if set)
            params: Optional query parameters
            headers: Optional additional headers
            retry_attempts: Number of retry attempts (default: from settings)
            retry_min_wait: Minimum wait between retries in seconds (default: from settings)
            retry_max_wait: Maximum wait between retries in seconds (default: from settings)
            retry_multiplier: Exponential backoff multiplier (default: from settings)
            **kwargs: Additional arguments passed to httpx

        Returns:
            httpx.Response: HTTP response

        Raises:
            httpx.TimeoutException: If request times out after retries
            httpx.HTTPStatusError: If response has error status
            httpx.RequestError: If request fails after retries
        """
        # Use settings defaults if not specified
        attempts = retry_attempts or settings.http_retry_attempts
        min_wait = retry_min_wait or settings.http_retry_min_wait
        max_wait = retry_max_wait or settings.http_retry_max_wait
        multiplier = retry_multiplier or settings.http_retry_multiplier

        # Create retry decorator with custom settings
        retry_decorator = retry(
            stop=stop_after_attempt(attempts),
            wait=wait_exponential(multiplier=multiplier, min=min_wait, max=max_wait),
            retry=retry_if_exception_type((httpx.TimeoutException, httpx.RequestError)),
            reraise=True,
        )

        @retry_decorator
        async def _make_request():
            client = await self._get_client()
            async with self._handle_request():
                # Log request details with masked headers
                full_url = str(client.build_request("GET", url, params=params).url)
                masked_headers = self._mask_sensitive_data(headers)
                logger.debug(
                    "HTTP GET Request: %s | Params: %s | Headers: %s",
                    full_url,
                    params,
                    masked_headers,
                )

                response = await client.get(
                    url, params=params, headers=headers, **kwargs
                )
                response.raise_for_status()

                # Log response details
                response_text = response.text
                # Truncate large responses for logging
                max_response_log_size = 1000
                if len(response_text) > max_response_log_size:
                    response_preview = (
                        response_text[:max_response_log_size] + "... (truncated)"
                    )
                else:
                    response_preview = response_text

                logger.debug(
                    "HTTP GET Response: %s | Status: %s | Content-Length: %s | Body: %s",
                    full_url,
                    response.status_code,
                    response.headers.get("content-length", "unknown"),
                    response_preview,
                )

                return response

        return await _make_request()

    async def post(  # pylint: disable=too-many-arguments,too-many-locals
        self,
        url: str,
        json: Optional[Dict[str, Any]] = None,
        data: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None,
        *,
        retry_attempts: Optional[int] = None,
        retry_min_wait: Optional[int] = None,
        retry_max_wait: Optional[int] = None,
        retry_multiplier: Optional[int] = None,
        **kwargs,
    ) -> httpx.Response:
        """
        Make a POST request with automatic retry on timeout/network errors.

        Args:
            url: URL or path (appended to base_url if set)
            json: Optional JSON payload
            data: Optional form data
            headers: Optional additional headers
            retry_attempts: Number of retry attempts (default: from settings)
            retry_min_wait: Minimum wait between retries in seconds (default: from settings)
            retry_max_wait: Maximum wait between retries in seconds (default: from settings)
            retry_multiplier: Exponential backoff multiplier (default: from settings)
            **kwargs: Additional arguments passed to httpx

        Returns:
            httpx.Response: HTTP response

        Raises:
            httpx.TimeoutException: If request times out after retries
            httpx.HTTPStatusError: If response has error status
            httpx.RequestError: If request fails after retries
        """
        # Use settings defaults if not specified
        attempts = retry_attempts or settings.http_retry_attempts
        min_wait = retry_min_wait or settings.http_retry_min_wait
        max_wait = retry_max_wait or settings.http_retry_max_wait
        multiplier = retry_multiplier or settings.http_retry_multiplier

        # Create retry decorator with custom settings
        retry_decorator = retry(
            stop=stop_after_attempt(attempts),
            wait=wait_exponential(multiplier=multiplier, min=min_wait, max=max_wait),
            retry=retry_if_exception_type((httpx.TimeoutException, httpx.RequestError)),
            reraise=True,
        )

        @retry_decorator
        async def _make_request():
            client = await self._get_client()
            async with self._handle_request():
                # Log request details with masked headers
                full_url = str(client.build_request("POST", url, json=json).url)
                masked_headers = self._mask_sensitive_data(headers)
                logger.debug(
                    "HTTP POST Request: %s | JSON: %s | Data: %s | Headers: %s",
                    full_url,
                    json,
                    data,
                    masked_headers,
                )

                response = await client.post(
                    url, json=json, data=data, headers=headers, **kwargs
                )
                response.raise_for_status()

                # Log response details
                response_text = response.text
                # Truncate large responses for logging
                max_response_log_size = 1000
                if len(response_text) > max_response_log_size:
                    response_preview = (
                        response_text[:max_response_log_size] + "... (truncated)"
                    )
                else:
                    response_preview = response_text

                logger.debug(
                    "HTTP POST Response: %s | Status: %s | Content-Length: %s | Body: %s",
                    full_url,
                    response.status_code,
                    response.headers.get("content-length", "unknown"),
                    response_preview,
                )

                return response

        return await _make_request()

    async def put(  # pylint: disable=too-many-arguments,too-many-locals
        self,
        url: str,
        json: Optional[Dict[str, Any]] = None,
        data: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None,
        *,
        retry_attempts: Optional[int] = None,
        retry_min_wait: Optional[int] = None,
        retry_max_wait: Optional[int] = None,
        retry_multiplier: Optional[int] = None,
        **kwargs,
    ) -> httpx.Response:
        """
        Make a PUT request with automatic retry on timeout/network errors.

        Args:
            url: URL or path (appended to base_url if set)
            json: Optional JSON payload
            data: Optional form data
            headers: Optional additional headers
            retry_attempts: Number of retry attempts (default: from settings)
            retry_min_wait: Minimum wait between retries in seconds (default: from settings)
            retry_max_wait: Maximum wait between retries in seconds (default: from settings)
            retry_multiplier: Exponential backoff multiplier (default: from settings)
            **kwargs: Additional arguments passed to httpx

        Returns:
            httpx.Response: HTTP response

        Raises:
            httpx.TimeoutException: If request times out after retries
            httpx.HTTPStatusError: If response has error status
            httpx.RequestError: If request fails after retries
        """
        # Use settings defaults if not specified
        attempts = retry_attempts or settings.http_retry_attempts
        min_wait = retry_min_wait or settings.http_retry_min_wait
        max_wait = retry_max_wait or settings.http_retry_max_wait
        multiplier = retry_multiplier or settings.http_retry_multiplier

        # Create retry decorator with custom settings
        retry_decorator = retry(
            stop=stop_after_attempt(attempts),
            wait=wait_exponential(multiplier=multiplier, min=min_wait, max=max_wait),
            retry=retry_if_exception_type((httpx.TimeoutException, httpx.RequestError)),
            reraise=True,
        )

        @retry_decorator
        async def _make_request():
            client = await self._get_client()
            async with self._handle_request():
                # Log request details with masked headers
                full_url = str(client.build_request("PUT", url, json=json).url)
                masked_headers = self._mask_sensitive_data(headers)
                logger.debug(
                    "HTTP PUT Request: %s | JSON: %s | Data: %s | Headers: %s",
                    full_url,
                    json,
                    data,
                    masked_headers,
                )

                response = await client.put(
                    url, json=json, data=data, headers=headers, **kwargs
                )
                response.raise_for_status()

                # Log response details
                response_text = response.text
                # Truncate large responses for logging
                max_response_log_size = 1000
                if len(response_text) > max_response_log_size:
                    response_preview = (
                        response_text[:max_response_log_size] + "... (truncated)"
                    )
                else:
                    response_preview = response_text

                logger.debug(
                    "HTTP PUT Response: %s | Status: %s | Content-Length: %s | Body: %s",
                    full_url,
                    response.status_code,
                    response.headers.get("content-length", "unknown"),
                    response_preview,
                )

                return response

        return await _make_request()


# Global HTTP client instances for different services
_http_clients: Dict[str, HTTPClient] = {}


def get_http_client(  # pylint: disable=too-many-arguments
    name: str = "default",
    base_url: Optional[str] = None,
    *,
    timeout: float = 30.0,
    connect_timeout: float = 10.0,
    max_connections: int = 50,
    max_keepalive_connections: int = 20,
    auth: Optional[tuple] = None,
    headers: Optional[Dict[str, str]] = None,
) -> HTTPClient:
    """
    Get or create a named HTTP client instance.
    Clients are cached and reused for the same name.

    Args:
        name: Client identifier (default: "default")
        base_url: Optional base URL for all requests
        timeout: Total timeout for requests in seconds
        connect_timeout: Connection timeout in seconds
        max_connections: Maximum number of concurrent connections
        max_keepalive_connections: Maximum keepalive connections
        auth: Optional tuple of (username, password) for basic auth
        headers: Optional default headers for all requests

    Returns:
        HTTPClient: Configured HTTP client instance

    Example:
        # Get a client for ServiceNow API
        client = get_http_client(
            name="servicenow",
            base_url="https://api.servicenow.com",
            auth=("user", "pass"),
            timeout=30.0
        )

        # Make a request
        response = await client.get("/api/now/table/incident")
    """
    if name not in _http_clients:
        _http_clients[name] = HTTPClient(
            base_url=base_url,
            timeout=timeout,
            connect_timeout=connect_timeout,
            max_connections=max_connections,
            max_keepalive_connections=max_keepalive_connections,
            auth=auth,
            headers=headers,
        )
        logger.info("Created new HTTP client: %s", name)
    return _http_clients[name]


async def close_all_http_clients():
    """
    Close all HTTP client instances.
    Should be called on application shutdown.
    """
    logger.info("Closing all HTTP clients...")
    for name, client in _http_clients.items():
        await client.close()
        logger.debug("Closed HTTP client: %s", name)
    _http_clients.clear()
    logger.info("All HTTP clients closed")
