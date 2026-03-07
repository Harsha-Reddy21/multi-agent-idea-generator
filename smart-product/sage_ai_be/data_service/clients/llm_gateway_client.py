"""
LLM Gateway Client Module
=========================
Handles interactions with the LLM Gateway API for model operations.
Focused client for LLM inference with retry and validation capabilities.
"""

import logging
import time
from typing import Any, Dict, Optional
import json

import httpx
from msal import ConfidentialClientApplication

from data_service.configurations.settings import settings
from data_service.exceptions.service_errors import LLMGatewayClientError
from data_service.serializers.document_extraction_response import (
    validate_document_extraction_response,
    DocumentExtractionResponse,
)

logger = logging.getLogger(__name__)


class LLMGatewayClient:
    """Client for LLM Gateway API operations."""

    def __init__(self) -> None:
        self.client_id = settings.client_id
        self.client_secret = settings.client_secret
        self.tenant_id = settings.tenant_id
        self.base_url = settings.llm_gateway_url
        self.scope = settings.llm_gateway_scope
        self.llm_gateway_key = settings.llm_gateway_key

        # httpx.AsyncClient will be initialized later
        self.session = httpx.AsyncClient(
            timeout=settings.llm_gateway_http_timeout,
            limits=httpx.Limits(
                max_connections=settings.llm_gateway_max_connections,
                max_keepalive_connections=settings.llm_gateway_max_keepalive_connections,
            ),
        )

        self.msal_app = ConfidentialClientApplication(
            client_id=self.client_id,
            client_credential=self.client_secret,
            authority=f"https://login.microsoftonline.com/{self.tenant_id}",
        )

        self._access_token: Optional[str] = None
        self._token_expiry: Optional[float] = None

    async def __aenter__(self) -> "LLMGatewayClient":
        """Async context manager entry"""
        return self

    async def __aexit__(
        self,
        exc_type: Optional[type],
        exc_val: Optional[Exception],
        exc_tb: Optional[object],
    ) -> None:
        """Async context manager exit with cleanup"""
        await self.close()

    async def close(self) -> None:
        """Close all HTTP client connections and cleanup resources."""
        if self.session is not None:
            try:
                await self.session.aclose()
                logger.info("LLM Gateway HTTP client session closed successfully")
            except (httpx.CloseError, RuntimeError) as e:
                # Log but don't raise - cleanup should be best-effort
                logger.warning("Error closing LLM Gateway HTTP session: %s", str(e))
            except Exception as e:
                # Catch unexpected errors during cleanup
                logger.error(
                    "Unexpected error during LLM Gateway session cleanup: %s",
                    str(e),
                    exc_info=True,
                )
            finally:
                self.session = None

    @property
    def access_token(self) -> Optional[str]:
        """Get current access token, refreshing if needed."""
        if (
            self._access_token is None
            or self._token_expiry is None
            or time.time()
            >= (self._token_expiry - settings.llm_gateway_token_refresh_buffer)
        ):
            self._refresh_token()
        return self._access_token

    def _refresh_token(self) -> None:
        """Refresh the APIM access token using MSAL."""
        result = self.msal_app.acquire_token_for_client(scopes=[self.scope])

        if "access_token" in result:
            self._access_token = result["access_token"]
            expires_in = result.get(
                "expires_in", settings.llm_gateway_token_default_expiry
            )
            self._token_expiry = time.time() + expires_in
            logger.info("LLM Gateway APIM token generated successfully")
        else:
            error = result.get("error", "Unknown")
            error_desc = result.get("error_description", "No description")
            error_msg = f"Error getting LLM Gateway APIM token: {error}: {error_desc}"
            logger.error(error_msg)
            raise LLMGatewayClientError(
                error="Authentication Error",
                message="Failed to authenticate with LLM Gateway API",
                status_code=401,
            )

    def _ensure_session_initialized(self) -> None:
        """Ensure HTTP session is initialized."""
        if self.session is None:
            self.session = httpx.AsyncClient(
                timeout=settings.llm_gateway_http_timeout,
                limits=httpx.Limits(
                    max_connections=settings.llm_gateway_max_connections,
                    max_keepalive_connections=settings.llm_gateway_max_keepalive_connections,
                ),
            )

    async def ask_model(
        self,
        model_name: str,
        prompt: str = None,
        messages: list = None,
        workflow_timeout: int = None,
    ) -> Dict[str, Any]:
        """
        Ask a question to an LLM Gateway model

        Args:
            model_name: Name of the LLM Gateway model
            prompt: Simple prompt text
                (converted to user message if messages not provided)
            messages: List of message objects with role and content
                (supports 'developer', 'user', 'assistant')
            workflow_timeout: Timeout for the workflow in seconds

        Returns:
            Dict containing the model response

        Raises:
            ValueError: If validation fails
            Exception: If the request fails
        """
        # Validate input types
        if not isinstance(model_name, str):
            raise LLMGatewayClientError(
                error="Validation Error",
                message=f"model_name must be a string, got {type(model_name).__name__}",
                status_code=400,
            )

        # Validate that either prompt or messages is provided
        if not prompt and not messages:
            raise LLMGatewayClientError(
                error="Validation Error",
                message=(
                    "Either 'prompt' or 'messages' must be provided. "
                    "Both cannot be None or empty."
                ),
                status_code=400,
            )

        # Validate both are not provided simultaneously
        if prompt and messages:
            raise LLMGatewayClientError(
                error="Validation Error",
                message="Only one of 'prompt' or 'messages' should be provided, not both",
                status_code=400,
            )

        if not model_name.strip():
            raise LLMGatewayClientError(
                error="Validation Error",
                message="model_name cannot be empty or whitespace-only",
                status_code=400,
            )

        # Length validation
        if len(model_name) > 256:
            raise LLMGatewayClientError(
                error="Validation Error",
                message=f"model_name too long: {len(model_name)} chars (max 256)",
                status_code=400,
            )

        self._ensure_session_initialized()

        if workflow_timeout is None:
            workflow_timeout = settings.llm_gateway_workflow_timeout

        # Build messages list
        if messages:
            # Validate messages format
            if not isinstance(messages, list):
                raise LLMGatewayClientError(
                    error="Validation Error",
                    message=f"messages must be a list, got {type(messages).__name__}",
                    status_code=400,
                )

            if not messages:
                raise LLMGatewayClientError(
                    error="Validation Error",
                    message="messages list cannot be empty",
                    status_code=400,
                )

            if len(messages) > 100:  # Reasonable limit
                raise LLMGatewayClientError(
                    error="Validation Error",
                    message=f"Too many messages: {len(messages)} (max 100)",
                    status_code=400,
                )

            for idx, msg in enumerate(messages):
                if not isinstance(msg, dict):
                    raise TypeError(
                        f"Message at index {idx} must be a dict, got {type(msg).__name__}"
                    )

                if "role" not in msg:
                    raise ValueError(
                        f"Message at index {idx} missing required field 'role'"
                    )

                if "content" not in msg:
                    raise ValueError(
                        f"Message at index {idx} missing required field 'content'"
                    )

                role = msg["role"]
                if not isinstance(role, str):
                    raise TypeError(
                        f"Message role at index {idx} must be a string, got {type(role).__name__}"
                    )

                allowed_roles = ["developer", "system", "user", "assistant"]
                if role not in allowed_roles:
                    raise ValueError(
                        f"Invalid role '{role}' at index {idx}. "
                        f"Must be one of: {', '.join(allowed_roles)}"
                    )

                content = msg["content"]
                if not isinstance(content, str):
                    raise TypeError(
                        f"Message content at index {idx} must be a string, "
                        f"got {type(content).__name__}"
                    )

                if not content.strip():
                    raise ValueError(
                        f"Message content at index {idx} cannot be empty or whitespace-only"
                    )

                if len(content) > 500_000:  # 500KB per message
                    raise ValueError(
                        f"Message content at index {idx} too long: "
                        f"{len(content)} chars (max 500,000)"
                    )

            request_messages = messages
        else:
            # Validate prompt
            if not isinstance(prompt, str):
                raise TypeError(f"prompt must be a string, got {type(prompt).__name__}")

            if not prompt.strip():
                raise ValueError("prompt cannot be empty or whitespace-only")

            if len(prompt) > 1_000_000:  # 1MB
                raise ValueError(
                    f"prompt too long: {len(prompt)} chars (max 1,000,000)"
                )

            # Convert simple prompt to user message
            request_messages = [
                {
                    "role": "user",
                    "content": prompt,
                }
            ]

        try:
            url = f"{self.base_url}/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {self.access_token}",
                "X-LLM-Gateway-Key": self.llm_gateway_key,
                "Content-Type": "application/json",
            }

            payload = {"model": model_name, "messages": request_messages}

            response = await self.session.post(
                url,
                json=payload,
                headers=headers,
                timeout=workflow_timeout + settings.llm_gateway_workflow_timeout_buffer,
            )

            logger.info("LLM Gateway ask model response: %s", response.status_code)

            # Handle authentication errors with retry
            if response.status_code in [401, 403]:
                logger.warning(
                    "LLM Gateway auth error detected, refreshing token and retrying"
                )
                self._access_token = None
                self._token_expiry = None
                self._refresh_token()

                headers = {
                    "Authorization": f"Bearer {self.access_token}",
                    "X-LLM-Gateway-Key": self.llm_gateway_key,
                    "Content-Type": "application/json",
                }
                response = await self.session.post(
                    url,
                    json=payload,
                    headers=headers,
                    timeout=workflow_timeout
                    + settings.llm_gateway_workflow_timeout_buffer,
                )
                logger.info(
                    "LLM Gateway retry response status code: %s", response.status_code
                )

            if response.status_code != 200:
                error_msg = (
                    f"Failed to ask LLM Gateway model: "
                    f"{response.status_code} - {response.text}"
                )
                logger.error(error_msg)
                raise LLMGatewayClientError(
                    error=(
                        "Bad Request"
                        if response.status_code < 500
                        else "Service Unavailable"
                    ),
                    message=error_msg,
                    status_code=(
                        response.status_code
                        if 400 <= response.status_code < 600
                        else 500
                    ),
                )

            return response.json()

        except httpx.TimeoutException as e:
            logger.error(
                "LLM Gateway timeout for model=%s after %s seconds: %s",
                model_name,
                workflow_timeout + settings.llm_gateway_workflow_timeout_buffer,
                str(e),
            )
            raise LLMGatewayClientError(
                error="Gateway Timeout",
                message=(
                    f"LLM Gateway request timed out after "
                    f"{workflow_timeout + settings.llm_gateway_workflow_timeout_buffer}s "
                    f"for model '{model_name}'"
                ),
                status_code=504,
            ) from e
        except httpx.RequestError as e:
            logger.error(
                "LLM Gateway request failed for model=%s: %s", model_name, str(e)
            )
            raise LLMGatewayClientError(
                error="Service Unavailable",
                message=f"LLM Gateway request failed for model '{model_name}': {str(e)}",
                status_code=503,
            ) from e

    async def ask_model_with_retry_doc_extract(
        self,
        model_name: str,
        document_content: str = None,
        messages: list = None,
        max_retries: int = 3,
        validate_schema: bool = True,
        validation_model: type = None,
    ) -> Dict[str, Any]:
        """
        Ask LLM Gateway model with JSON validation, Pydantic schema validation, and retry mechanism.
        Handles OpenAI chat completions format and validates using DocumentExtractionResponse model.

        Args:
            model_name: Name of the LLM Gateway model
            document_content: Content to send to the model
                (converted to user message if messages not provided)
            messages: List of message objects with role and content
                (supports 'developer', 'user', 'assistant')
            max_retries: Maximum number of retry attempts
            validate_schema: Whether to perform Pydantic validation
                (default: True)
            validation_model: Pydantic model class to use for validation
                (defaults to DocumentExtractionResponse)

        Returns:
            {
                "success": bool,
                "parsed_json": dict,
                "raw_message": str,
                "attempts": int,
                "validation_passed": bool,
                "validation_errors": List[str],
                "can_skip_enrichment": bool,
                "error": str (if failed)
            }
        """

        # Input validation
        if not isinstance(model_name, str) or not model_name.strip():
            raise LLMGatewayClientError(
                error="Validation Error",
                message="model_name must be a non-empty string",
                status_code=400,
            )

        if not document_content and not messages:
            raise LLMGatewayClientError(
                error="Validation Error",
                message="Either document_content or messages must be provided",
                status_code=400,
            )

        if document_content and messages:
            raise LLMGatewayClientError(
                error="Validation Error",
                message="Only one of document_content or messages should be provided, not both",
                status_code=400,
            )

        if not isinstance(max_retries, int) or max_retries < 1:
            raise LLMGatewayClientError(
                error="Validation Error",
                message=f"max_retries must be a positive integer, got {max_retries}",
                status_code=400,
            )

        if max_retries > 10:
            logger.warning(
                "max_retries=%d is unusually high, capping at 10", max_retries
            )
            max_retries = 10

        if not isinstance(validate_schema, bool):
            raise LLMGatewayClientError(
                error="Validation Error",
                message=f"validate_schema must be a boolean, got {type(validate_schema).__name__}",
                status_code=400,
            )

        # Set default validation model if not provided
        if validation_model is None:
            validation_model = DocumentExtractionResponse

        # Validate that validation_model is a class
        if not isinstance(validation_model, type):
            raise LLMGatewayClientError(
                error="Validation Error",
                message=f"validation_model must be a class, got {type(validation_model).__name__}",
                status_code=400,
            )

        for attempt in range(1, max_retries + 1):
            try:
                logger.info(
                    "LLM Gateway attempt %d/%d for model: %s",
                    attempt,
                    max_retries,
                    model_name,
                )

                # Call ask_model with either messages or prompt
                if messages:
                    result = await self.ask_model(
                        model_name=model_name,
                        messages=messages,
                        workflow_timeout=settings.llm_timeout,
                    )
                else:
                    result = await self.ask_model(
                        model_name=model_name,
                        prompt=document_content,
                        workflow_timeout=settings.llm_timeout,
                    )

                # Extract message from OpenAI chat completions format
                # Expected format: {"choices": [{"message": {"content": "..."}}]}
                message = ""

                # Validate result structure
                if not isinstance(result, dict):
                    logger.error(
                        "Invalid result type from LLM Gateway: expected dict, got %s",
                        type(result).__name__,
                    )
                    if attempt < max_retries:
                        continue
                    return {
                        "success": False,
                        "parsed_json": None,
                        "raw_message": "",
                        "attempts": attempt,
                        "validation_passed": False,
                        "validation_errors": [
                            f"Invalid response type: {type(result).__name__}"
                        ],
                        "can_skip_enrichment": False,
                        "error": "Invalid response structure from LLM Gateway",
                    }

                if "choices" in result and len(result["choices"]) > 0:
                    choice = result["choices"][0]
                    if isinstance(choice, dict):
                        if "message" in choice and isinstance(choice["message"], dict):
                            if "content" in choice["message"]:
                                message = choice["message"]["content"]
                                if not isinstance(message, str):
                                    logger.warning(
                                        "Message content is not a string, converting: %s",
                                        type(message).__name__,
                                    )
                                    message = str(message)
                        elif "text" in choice:
                            # Fallback for completions format
                            message = choice["text"]
                            if not isinstance(message, str):
                                message = str(message)
                    else:
                        logger.warning(
                            "Choice at index 0 is not a dict: %s", type(choice).__name__
                        )
                else:
                    # Fallback for legacy format
                    message = result.get("message", "")
                    if not isinstance(message, str):
                        message = str(message) if message else ""

                if not message:
                    logger.warning(
                        "LLM Gateway attempt %d: No message content in response",
                        attempt,
                    )
                    if attempt < max_retries:
                        continue
                    return {
                        "success": False,
                        "parsed_json": None,
                        "raw_message": "",
                        "attempts": attempt,
                        "validation_passed": False,
                        "validation_errors": ["No message content in response"],
                        "can_skip_enrichment": False,
                        "error": "No message content in LLM Gateway response",
                    }

                # Step 1: Parse JSON
                try:
                    if not message:
                        raise json.JSONDecodeError("Empty message", message, 0)

                    parsed_json = json.loads(message)

                    # Validate parsed JSON structure
                    if not isinstance(parsed_json, dict):
                        raise ValueError(
                            f"Parsed JSON must be a dict, got {type(parsed_json).__name__}"
                        )

                    if not parsed_json:
                        raise ValueError("Parsed JSON is an empty dict")

                    logger.info(
                        "LLM Gateway JSON parsed successfully on attempt %d", attempt
                    )

                except json.JSONDecodeError as json_err:
                    logger.warning(
                        "LLM Gateway attempt %d: JSON parse failed - %s",
                        attempt,
                        str(json_err),
                    )
                    if attempt < max_retries:
                        remaining = max_retries - attempt
                        logger.info(
                            "LLM Gateway retrying... (%d attempts remaining)", remaining
                        )
                        continue

                    return {
                        "success": False,
                        "parsed_json": None,
                        "raw_message": message,
                        "attempts": attempt,
                        "validation_passed": False,
                        "validation_errors": [f"Invalid JSON: {str(json_err)}"],
                        "can_skip_enrichment": False,
                        "error": f"Invalid JSON after {max_retries} attempts: {str(json_err)}",
                    }

                # Step 2: Pydantic Schema Validation (if enabled)
                if validate_schema:
                    logger.info(
                        "Validating LLM Gateway document extraction response structure..."
                    )
                    validation_result = validate_document_extraction_response(
                        parsed_json, model=validation_model
                    )

                    if validation_result["is_valid"]:
                        # Validation passed
                        logger.info(
                            "LLM Gateway document extraction validation passed on attempt %d",
                            attempt,
                        )
                        return {
                            "success": True,
                            "parsed_json": validation_result["validated_data"],
                            "raw_message": message,
                            "attempts": attempt,
                            "validation_passed": True,
                            "validation_errors": [],
                        }
                    if attempt < max_retries:
                        # Validation failed, retry
                        logger.warning(
                            "LLM Gateway document extraction validation failed on attempt %d",
                            attempt,
                        )
                        logger.warning(
                            "LLM Gateway validation errors: %s",
                            validation_result["errors"],
                        )
                        remaining = max_retries - attempt
                        logger.info(
                            "LLM Gateway retrying... (%d attempts remaining)", remaining
                        )
                        continue
                    else:
                        # Max retries reached, validation failed
                        logger.error(
                            "LLM Gateway document extraction validation failed after %d attempts",
                            attempt,
                        )
                        logger.error(
                            "LLM Gateway validation errors: %s",
                            validation_result["errors"],
                        )
                        return {
                            "success": False,
                            "parsed_json": None,
                            "raw_message": message,
                            "attempts": attempt,
                            "validation_passed": False,
                            "validation_errors": validation_result["errors"],
                            "can_skip_enrichment": False,
                            "error": (
                                f"LLM Gateway document extraction validation failed: "
                                f"{'; '.join(validation_result['errors'])}"
                            ),
                        }
                else:
                    # Schema validation disabled, return parsed JSON
                    logger.info(
                        "LLM Gateway schema validation disabled, returning parsed JSON"
                    )
                    return {
                        "success": True,
                        "parsed_json": parsed_json,
                        "raw_message": message,
                        "attempts": attempt,
                        "validation_passed": True,  # N/A when disabled
                        "validation_errors": [],
                        "can_skip_enrichment": False,
                    }

            except (httpx.RequestError, ValueError, KeyError) as e:
                logger.error(
                    "LLM Gateway attempt %d: Request failed - %s", attempt, str(e)
                )
                if attempt < max_retries:
                    continue

                return {
                    "success": False,
                    "parsed_json": None,
                    "raw_message": "",
                    "attempts": attempt,
                    "validation_passed": False,
                    "validation_errors": [str(e)],
                    "can_skip_enrichment": False,
                    "error": f"LLM Gateway request failed: {str(e)}",
                }

        return {
            "success": False,
            "parsed_json": None,
            "raw_message": "",
            "attempts": max_retries,
            "validation_passed": False,
            "validation_errors": ["Max retries exceeded"],
            "can_skip_enrichment": False,
            "error": "Max retries exceeded",
        }


# Singleton instance
llm_gateway_client = LLMGatewayClient()
