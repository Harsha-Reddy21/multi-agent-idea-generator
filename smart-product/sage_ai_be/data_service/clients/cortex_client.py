"""
Cortex API Client Module
=========================
Handles interactions with the Cortex API for model operations.
"""

import asyncio
import logging
import time
from typing import Any, Dict, Optional
import json
import httpx
from msal import ConfidentialClientApplication

from data_service.configurations.settings import settings
from data_service.exceptions.service_errors import CortexClientError
from data_service.serializers.document_extraction_response import (
    validate_document_extraction_response,
    DocumentExtractionResponse,
)

logger = logging.getLogger(__name__)


class CortexClient:
    """Client for Cortex API operations."""

    def __init__(self) -> None:
        self.client_id = settings.client_id
        self.client_secret = settings.client_secret
        self.tenant_id = settings.tenant_id
        self.base_url = settings.cortex_base_url
        self.scope = settings.cortex_scope

        # httpx.AsyncClient will be initialized later
        self.session = httpx.AsyncClient(
            timeout=settings.cortex_http_timeout,
            limits=httpx.Limits(
                max_connections=settings.cortex_max_connections,
                max_keepalive_connections=settings.cortex_max_keepalive_connections,
            ),
        )

        self.msal_app = ConfidentialClientApplication(
            client_id=self.client_id,
            client_credential=self.client_secret,
            authority=f"https://login.microsoftonline.com/{self.tenant_id}",
        )

        self._access_token: Optional[str] = None
        self._token_expiry: Optional[float] = None

    async def __aenter__(self) -> "CortexClient":
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
                logger.info("HTTP client session closed successfully")
            except (httpx.CloseError, RuntimeError) as e:
                # Log but don't raise - cleanup should be best-effort
                logger.warning("Error closing HTTP session: %s", str(e))
            except Exception as e:
                # Catch unexpected errors during cleanup
                logger.error(
                    "Unexpected error during session cleanup: %s", str(e), exc_info=True
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
            >= (self._token_expiry - settings.cortex_token_refresh_buffer)
        ):
            self._refresh_token()
        return self._access_token

    def _refresh_token(self) -> None:
        """Refresh the APIM access token using MSAL."""
        result = self.msal_app.acquire_token_for_client(scopes=[self.scope])

        if "access_token" in result:
            self._access_token = result["access_token"]
            expires_in = result.get("expires_in", settings.cortex_token_default_expiry)
            self._token_expiry = time.time() + expires_in
            logger.info("APIM token generated successfully")
        else:
            error = result.get("error", "Unknown")
            error_desc = result.get("error_description", "No description")
            error_msg = f"Error getting APIM token: {error}: {error_desc}"
            logger.error(error_msg)
            raise CortexClientError(
                error="Authentication Error",
                message="Failed to authenticate with Cortex API",
                status_code=401,
            )

    def _validate_model_request(self, model_name: str, prompt: str) -> None:
        """Validate model request parameters.

        Args:
            model_name: Name of the model to validate
            prompt: Prompt text to validate

        Raises:
            TypeError: If parameters are not strings
            ValueError: If validation fails
        """
        if not isinstance(model_name, str):
            raise CortexClientError(
                error="Validation Error",
                message=f"model_name must be a string, got {type(model_name).__name__}",
                status_code=400,
            )

        if not isinstance(prompt, str):
            raise CortexClientError(
                error="Validation Error",
                message=f"prompt must be a string, got {type(prompt).__name__}",
                status_code=400,
            )

        if not model_name.strip():
            raise CortexClientError(
                error="Validation Error",
                message="model_name cannot be empty or whitespace-only",
                status_code=400,
            )

        if not prompt.strip():
            raise CortexClientError(
                error="Validation Error",
                message="prompt cannot be empty or whitespace-only",
                status_code=400,
            )

        # Check for reasonable length limits
        if len(model_name) > 256:
            raise CortexClientError(
                error="Validation Error",
                message=f"model_name too long: {len(model_name)} chars (max 256)",
                status_code=400,
            )

        if len(prompt) > 1_000_000:  # 1MB text
            raise CortexClientError(
                error="Validation Error",
                message=f"prompt too long: {len(prompt)} chars (max 1,000,000)",
                status_code=400,
            )

    def _ensure_session_initialized(self) -> None:
        """Ensure HTTP session is initialized."""
        if self.session is None:
            self.session = httpx.AsyncClient(
                timeout=settings.cortex_http_timeout,
                limits=httpx.Limits(
                    max_connections=settings.cortex_max_connections,
                    max_keepalive_connections=settings.cortex_max_keepalive_connections,
                ),
            )

    async def invoke_ask(
        self,
        model_name: str,
        prompt: str,
        input_variables: Optional[Dict[str, str]] = None,
        max_retries: Optional[int] = None,
    ) -> str:
        """Ask a question to the Cortex model with retry logic.

        Args:
            model_name: Name of the Cortex model
            prompt: The question/prompt to send
            input_variables: Optional input variables
            max_retries: Maximum number of retry attempts (defaults to settings.llm_max_retries)

        Returns:
            Model response as string

        Raises:
            CortexClientError: If model call fails after all retries
        """
        self._validate_model_request(model_name, prompt)
        self._ensure_session_initialized()

        if max_retries is None:
            max_retries = settings.llm_max_retries

        url = f"{self.base_url}/model/ask/{model_name}"

        # Build form data - q is always required
        form_data = {"q": prompt}

        # Add input variables as additional form fields if provided
        if input_variables:
            for key, value in input_variables.items():
                form_data[key] = value

        last_exception = None

        # Retry logic with exponential backoff
        for attempt in range(1, max_retries + 1):
            try:
                logger.debug(
                    "Attempt %d/%d for model=%s", attempt, max_retries, model_name
                )

                headers = {
                    "Authorization": f"Bearer {self.access_token}",
                    "Content-Type": "application/x-www-form-urlencoded",
                }

                response = await self.session.post(
                    url,
                    data=form_data,
                    headers=headers,
                    timeout=settings.cortex_http_timeout,
                )

                logger.info(
                    "Attempt %d: Response status code: %s",
                    attempt,
                    response.status_code,
                )

                # Handle authentication errors
                if response.status_code in [401, 403]:
                    logger.warning(
                        "Attempt %d: Auth error detected, refreshing token and retrying",
                        attempt,
                    )
                    self._access_token = None
                    self._token_expiry = None
                    self._refresh_token()

                    headers["Authorization"] = f"Bearer {self.access_token}"

                    response = await self.session.post(
                        url,
                        data=form_data,
                        headers=headers,
                        timeout=settings.cortex_http_timeout,
                    )
                    logger.info(
                        "Attempt %d: Retry response status code: %s",
                        attempt,
                        response.status_code,
                    )

                if response.status_code != 200:
                    error_msg = (
                        f"Error calling model: {response.status_code} - {response.text}"
                    )
                    logger.warning("Attempt %d: %s", attempt, error_msg)

                    # Retry on 5xx errors
                    if response.status_code >= 500 and attempt < max_retries:
                        await asyncio.sleep(2**attempt)
                        continue

                    raise ValueError(error_msg)

                response_json = response.json()
                if not isinstance(response_json, dict):
                    error_msg = (
                        f"Invalid response type from Cortex API: "
                        f"expected dict, got {type(response_json).__name__}"
                    )
                    logger.warning("Attempt %d: %s", attempt, error_msg)
                    if attempt < max_retries:
                        await asyncio.sleep(2**attempt)
                        continue
                    raise ValueError(error_msg)

                message = response_json.get("message")
                if message is None:
                    logger.warning(
                        "Attempt %d: No 'message' field in Cortex response for model=%s, "
                        "response keys: %s",
                        attempt,
                        model_name,
                        list(response_json.keys()),
                    )
                    if attempt < max_retries:
                        await asyncio.sleep(2**attempt)
                        continue
                    return ""

                if not isinstance(message, str):
                    logger.warning(
                        "Attempt %d: Message field is not a string for model=%s, type=%s",
                        attempt,
                        model_name,
                        type(message).__name__,
                    )
                    return str(message)

                logger.info(
                    "Successfully received response from model=%s on attempt %d",
                    model_name,
                    attempt,
                )
                return message

            except httpx.TimeoutException as e:
                logger.warning(
                    "Attempt %d: Cortex request timeout for model=%s after %s seconds: %s",
                    attempt,
                    model_name,
                    settings.cortex_http_timeout,
                    str(e),
                )
                last_exception = e
                if attempt < max_retries:
                    await asyncio.sleep(2**attempt)
                    continue

            except httpx.RequestError as e:
                logger.warning(
                    "Attempt %d: Cortex API request failed for model=%s: %s",
                    attempt,
                    model_name,
                    str(e),
                )
                last_exception = e
                if attempt < max_retries:
                    await asyncio.sleep(2**attempt)
                    continue

            except (ValueError, KeyError) as e:
                logger.warning(
                    "Attempt %d: Invalid response from Cortex API for model=%s: %s",
                    attempt,
                    model_name,
                    str(e),
                )
                last_exception = e
                if attempt < max_retries:
                    await asyncio.sleep(2**attempt)
                    continue

            except Exception as e:  # PyLint: disable=broad-except
                logger.error(
                    "Attempt %d: Unexpected error calling Cortex model=%s: %s",
                    attempt,
                    model_name,
                    str(e),
                    exc_info=True,
                )
                last_exception = e
                if attempt < max_retries:
                    await asyncio.sleep(2**attempt)
                    continue

        # All retries exhausted
        logger.error("All %d attempts failed for model=%s", max_retries, model_name)

        if isinstance(last_exception, httpx.TimeoutException):
            raise CortexClientError(
                error="Gateway Timeout",
                message=(
                    f"Cortex request timed out after {max_retries} attempts "
                    f"for model '{model_name}'"
                ),
                status_code=504,
            ) from last_exception
        elif isinstance(last_exception, httpx.RequestError):
            raise CortexClientError(
                error="Service Unavailable",
                message=(
                    f"Cortex API request failed after {max_retries} attempts "
                    f"for model '{model_name}': {str(last_exception)}"
                ),
                status_code=503,
            ) from last_exception
        else:
            raise CortexClientError(
                error="Internal Server Error",
                message=(
                    f"Cortex API call failed after {max_retries} attempts "
                    f"for model '{model_name}'"
                ),
                status_code=500,
            ) from last_exception

    async def get_model_classes(
        self,
        is_admin: bool = False,
        request: Optional[object] = None,  # pylint: disable=unused-argument
    ) -> Dict[str, Any]:
        """
        Get model classes from Cortex API

        Args:
            is_admin: Boolean flag to include admin models (default: False)
            request: Optional Request object to extract auth headers from

        Returns:
            Dictionary with model classes or error details
        """
        self._ensure_session_initialized()

        try:
            headers = {
                "Authorization": f"Bearer {self.access_token}",
                "Content-Type": "application/x-www-form-urlencoded",
            }

            params = {"private_only": "false", "is_admin": str(is_admin).lower()}

            result = await self.session.get(
                f"{self.base_url}/model",
                params=params,
                headers=headers,
                timeout=settings.cortex_http_timeout,
            )

            if result.status_code != 200:
                error_msg = f"Error calling model: {result.status_code} - {result.text}"
                logger.error(
                    "Error calling model: %s - %s", result.status_code, result.text
                )
                raise ValueError(error_msg)

            return result.json()

        except httpx.TimeoutException as e:
            logger.error(
                "Timeout fetching model classes after %s seconds: %s",
                settings.cortex_http_timeout,
                str(e),
            )
            return {
                "error": f"Request timed out after {settings.cortex_http_timeout}s: {str(e)}",
                "status_code": 504,
                "error_type": "TimeoutException",
            }
        except httpx.RequestError as e:
            logger.error(
                "Network error fetching model classes: %s", str(e), exc_info=True
            )
            return {
                "error": f"Network error: {str(e)}",
                "status_code": 503,
                "error_type": type(e).__name__,
            }
        except ValueError as e:
            logger.error("Invalid response fetching model classes: %s", str(e))
            return {
                "error": f"Invalid API response: {str(e)}",
                "status_code": 500,
                "error_type": "ValueError",
            }

    async def create_model_config(self, model_config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create or update a model configuration in Cortex

        Args:
            model_config: Dictionary containing the model configuration

        Returns:
            API response JSON

        Raises:
            httpx.HTTPError: If the request fails
        """
        if self.session is None:
            self.session = httpx.AsyncClient(
                timeout=settings.cortex_http_timeout,
                limits=httpx.Limits(
                    max_connections=settings.cortex_max_connections,
                    max_keepalive_connections=settings.cortex_max_keepalive_connections,
                ),
            )

        try:
            url = f"{self.base_url}/model"
            headers = {
                "Authorization": f"Bearer {self.access_token}",
                "Content-Type": "application/json",
            }

            response = await self.session.post(
                url,
                json=model_config,
                headers=headers,
                timeout=settings.cortex_http_timeout,
            )

            logger.info("Create model config response status: %s", response.status_code)

            if response.status_code not in [200, 201]:
                error_msg = (
                    f"Failed to create model config: "
                    f"{response.status_code} - {response.text}"
                )
                logger.error(
                    "Failed to create model config: %d - %s",
                    response.status_code,
                    response.text,
                )
                raise httpx.HTTPStatusError(
                    error_msg, request=response.request, response=response
                )

            return response.json()

        except httpx.TimeoutException as e:
            logger.error(
                "Timeout creating model config after %s seconds: %s",
                settings.cortex_http_timeout,
                str(e),
            )
            raise CortexClientError(
                error="Gateway Timeout",
                message=f"Model config creation timed out after {settings.cortex_http_timeout}s",
                status_code=504,
            ) from e
        except httpx.RequestError as e:
            logger.error(
                "Network error creating model config: %s", str(e), exc_info=True
            )
            raise CortexClientError(
                error="Service Unavailable",
                message=f"Failed to create model config due to network error: {str(e)}",
                status_code=503,
            ) from e

    async def create_prompt_config(
        self, prompt_config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Create or update a prompt configuration in Cortex

        Args:
            prompt_config: Dictionary containing the prompt configuration

        Returns:
            API response JSON

        Raises:
            Exception: If the request fails
        """
        try:
            url = f"{self.base_url}/prompt"
            headers = {
                "Authorization": f"Bearer {self.access_token}",
                "Content-Type": "application/json",
            }

            response = await self.session.post(
                url,
                json=prompt_config,
                headers=headers,
                timeout=settings.cortex_http_timeout,
            )

            logger.info(
                "Create prompt config response status: %s", response.status_code
            )

            if response.status_code not in [200, 201]:
                error_msg = (
                    f"Failed to create prompt config: "
                    f"{response.status_code} - {response.text}"
                )
                logger.error(error_msg)
                raise httpx.HTTPStatusError(
                    error_msg, request=response.request, response=response
                )

            return response.json()

        except httpx.RequestError as e:
            logger.exception("Prompt config creation failed")
            raise CortexClientError(
                error="Service Unavailable",
                message=f"Prompt config creation failed due to network error: {str(e)}",
                status_code=503,
            ) from e

    async def upload_file(
        self, model_name: str, file_content: bytes, filename: str
    ) -> Dict[str, Any]:
        """
        Upload a file to Cortex data config

        Args:
            model_name: Name of the model
            file_content: File content as bytes
            filename: Name of the file

        Returns:
            API response JSON

        Raises:
            Exception: If the upload fails
        """
        try:
            url = f"{self.base_url}/data/upload/{model_name}?low_priority=false"
            headers = {"Authorization": f"Bearer {self.access_token}"}
            files = {"files": (filename, file_content)}

            response = await self.session.post(
                url,
                headers=headers,
                files=files,
                timeout=settings.cortex_file_upload_timeout,
            )

            logger.info("Upload response status code: %s", response.status_code)

            if response.status_code != 200:
                error_msg = (
                    f"Failed to upload file: {response.status_code} - {response.text}"
                )
                logger.error(error_msg)
                raise CortexClientError(
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
                "Timeout uploading file '%s' after %s seconds: %s",
                filename,
                settings.cortex_file_upload_timeout,
                str(e),
            )
            raise CortexClientError(
                error="Gateway Timeout",
                message=(
                    f"File upload timed out after "
                    f"{settings.cortex_file_upload_timeout}s for '{filename}'"
                ),
                status_code=504,
            ) from e
        except httpx.RequestError as e:
            logger.error(
                "Network error uploading file '%s': %s", filename, str(e), exc_info=True
            )
            raise CortexClientError(
                error="Service Unavailable",
                message=f"Failed to upload file '{filename}' due to network error: {str(e)}",
                status_code=503,
            ) from e

    async def ask_model(
        self,
        model_name: str,
        document_content: str,
        stream: bool = False,
        no_summary: bool = False,
        workflow_timeout: int = None,
        background_job: bool = False,
    ) -> Dict[str, Any]:
        """
        Ask a question to a Cortex model

        Args:
            model_name: Name of the Cortex model
            document_content: Content to send to the model
            stream: Enable streaming response
            no_summary: Skip summary generation
            workflow_timeout: Timeout for the workflow in seconds
                (defaults to settings.cortex_workflow_timeout)
            background_job: Run as background job

        Returns:
            Dict containing the model response

        Raises:
            httpx.HTTPError: If the request fails
        """
        if workflow_timeout is None:
            workflow_timeout = settings.cortex_workflow_timeout

        if self.session is None:
            self.session = httpx.AsyncClient(
                timeout=settings.cortex_http_timeout,
                limits=httpx.Limits(
                    max_connections=settings.cortex_max_connections,
                    max_keepalive_connections=settings.cortex_max_keepalive_connections,
                ),
            )

        try:
            url = f"{self.base_url}/model/ask/{model_name}"
            params = {
                "stream": str(stream).lower(),
                "no_summary": str(no_summary).lower(),
                "workflow_timeout": workflow_timeout,
                "background_job": str(background_job).lower(),
            }
            headers = {"Authorization": f"Bearer {self.access_token}"}

            form_data = {
                "q": document_content,
                "uploaded_file": "",
                "filter_by_file": "",
                "chunks": "",
            }

            response = await self.session.post(
                url,
                params=params,
                data=form_data,
                headers=headers,
                timeout=workflow_timeout + settings.cortex_workflow_timeout_buffer,
            )

            logger.info("Ask model response: %s", response.status_code)

            if response.status_code != 200:
                error_msg = (
                    f"Failed to ask model: {response.status_code} - {response.text}"
                )
                logger.error(error_msg)
                raise CortexClientError(
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
                "Timeout calling ask_model for '%s' after %s seconds: %s",
                model_name,
                workflow_timeout,
                str(e),
            )
            raise CortexClientError(
                error="Gateway Timeout",
                message=f"Model request timed out after {workflow_timeout}s for '{model_name}'",
                status_code=504,
            ) from e
        except httpx.RequestError as e:
            logger.error(
                "Network error calling ask_model for '%s': %s",
                model_name,
                str(e),
                exc_info=True,
            )
            raise CortexClientError(
                error="Service Unavailable",
                message=f"Model request failed for '{model_name}' due to network error: {str(e)}",
                status_code=503,
            ) from e

    async def ask_model_with_retry_doc_extract(
        self,
        model_name: str,
        document_content: str,
        max_retries: int = None,
        validate_schema: bool = True,
        validation_model: type = None,
    ) -> Dict[str, Any]:
        """
        Ask model with JSON validation, Pydantic schema validation, and retry mechanism

        Args:
            model_name: Name of the Cortex model
            document_content: Content to send to the model
            max_retries: Maximum number of retry attempts
                (defaults to settings.llm_max_retries)
            validate_schema: Whether to perform Pydantic validation (default: True)
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

        if validation_model is None:
            validation_model = DocumentExtractionResponse

        # Validate that validation_model is a class (not an instance)
        if not isinstance(validation_model, type):
            error_msg = f"validation_model must be a class, got {type(validation_model).__name__}"
            logger.error(error_msg)
            raise TypeError(error_msg)

        if max_retries is None:
            max_retries = settings.llm_max_retries

        for attempt in range(1, max_retries + 1):
            try:
                logger.info(
                    "LLM attempt %d/%d for model: %s", attempt, max_retries, model_name
                )

                result = await self.ask_model(
                    model_name=model_name,
                    document_content=document_content,
                    workflow_timeout=settings.llm_timeout,
                )

                message = result.get("message", "")

                if not message:
                    logger.warning("Attempt %d: No message in response", attempt)
                    if attempt < max_retries:
                        continue
                    return {
                        "success": False,
                        "parsed_json": None,
                        "raw_message": "",
                        "attempts": attempt,
                        "validation_passed": False,
                        "validation_errors": ["No message in response"],
                        "can_skip_enrichment": False,
                        "error": "No message field in Cortex response",
                    }

                # Step 1: Parse JSON
                try:
                    parsed_json = json.loads(message)
                    logger.info("JSON parsed successfully on attempt %d", attempt)

                except json.JSONDecodeError as json_err:
                    logger.warning(
                        "Attempt %d: JSON parse failed - %s", attempt, str(json_err)
                    )
                    if attempt < max_retries:
                        remaining = max_retries - attempt
                        logger.info("Retrying... (%d attempts remaining)", remaining)
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
                    logger.info("Validating document extraction response structure...")
                    # Log the raw LLM response before validation
                    logger.info(
                        "Raw LLM response before validation (attempt %d): %s",
                        attempt,
                        json.dumps(parsed_json, indent=2),
                    )

                    # Use document extraction validator with specified model
                    validation_result = validate_document_extraction_response(
                        parsed_json, model=validation_model
                    )

                    if validation_result["is_valid"]:
                        # Validation passed
                        logger.info(
                            "Document extraction schema validation passed on attempt %d",
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
                            "Document extraction schema validation failed on attempt %d",
                            attempt,
                        )
                        logger.warning(
                            "Validation errors: %s", validation_result["errors"]
                        )
                        remaining = max_retries - attempt
                        logger.info("Retrying... (%d attempts remaining)", remaining)
                        continue
                    # Max retries reached, validation failed
                    logger.error(
                        "Document extraction schema validation failed after %d attempts",
                        attempt,
                    )
                    logger.error("Validation errors: %s", validation_result["errors"])
                    return {
                        "success": False,
                        "parsed_json": None,
                        "raw_message": message,
                        "attempts": attempt,
                        "validation_passed": False,
                        "validation_errors": validation_result["errors"],
                        "error": (
                            f"Schema validation failed: "
                            f"{'; '.join(validation_result['errors'])}"
                        ),
                    }
                # Schema validation disabled, return parsed JSON
                logger.info("Schema validation disabled, returning parsed JSON")
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
                logger.error("Attempt %d: Request failed - %s", attempt, str(e))
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
                    "error": f"LLM request failed: {str(e)}",
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


cortex_client = CortexClient()
