"""
Text Enhancement Service
========================
Service for AI-powered text enhancement using context from questions,
suggestions, documents, and form data.
"""

import asyncio
import json
import logging
import time
from typing import Any, Dict

from sqlalchemy.ext.asyncio import AsyncSession

from data_service.clients.cortex_client import cortex_client
from data_service.clients.llm_gateway_client import llm_gateway_client
from data_service.configurations.prompts.enhance_answer_prompt import (
    ENHANCE_ANSWER_PROMPT,
)
from data_service.configurations.settings import Settings
from data_service.constants.constants import CORTEX_MODEL, ENHANCE_MODEL
from data_service.serializers.enhance_answer import EnhanceRequest, EnhanceResponse
from data_service.service.doc_extract_service import DocumentExtractionService
from data_service.utils.ai_interaction_utils import create_ai_interaction
from data_service.serializers.ai_feedback import AIFeatureType
from data_service.exceptions.service_errors import EnhanceAnswerServiceError
from data_service.utils.error_utils import handle_service_exception

from data_service.service.enhance_ans_context_builders import (
    QuestionContextBuilder,
    DocumentContextBuilder,
    FormDataContextBuilder,
)
from data_service.service.llm_response_parser_enhance_ans import LLMResponseParser
from data_service.utils.input_validator import InputValidator

logger = logging.getLogger(__name__)


class EnhanceAnswerService:
    """Service for AI-powered text enhancement with context awareness"""

    def __init__(self, db: AsyncSession, settings: Settings):
        """
        Initialize the enhancement service.

        Args:
            db: Async database session
            settings: Application settings
        """
        self.db = db
        self.settings = settings
        self.cortex_client = cortex_client
        self.llm_gateway_client = llm_gateway_client

        # Initialize modular components
        self.question_builder = QuestionContextBuilder(db)
        self.document_builder = DocumentContextBuilder(
            DocumentExtractionService(), settings.enhancement_default_no_data_message
        )
        self.form_builder = FormDataContextBuilder()
        self.response_parser = LLMResponseParser(
            settings.enhancement_default_failed_message
        )
        self.input_validator = InputValidator(settings.enhancement_max_user_text_length)

    async def enhance_text(self, request: EnhanceRequest) -> EnhanceResponse:
        """
        Enhance user-provided text using AI with comprehensive context.

        This is the main orchestration method that coordinates data fetching,
        context building, LLM invocation, and response construction.

        Args:
            request: Enhancement request with question_id, user_text, etc.

        Returns:
            EnhanceResponse with enhanced text and rationale

        Raises:
            ValueError: If question not found or validation fails

        Performance:
            - Optimized with single JOIN query for question/suggestions
            - Sequential database operations to avoid session conflicts
            - Typical response time: 5-30 seconds (LLM-dependent)

        Example:
            >>> service = EnhanceAnswerService(db)
            >>> response = await service.enhance_text(request)
            >>> print(response.reviewed_text)
        """
        start_time = time.time()

        # Input validation
        if not isinstance(request, EnhanceRequest):
            raise TypeError(
                f"request must be an EnhanceRequest instance, got {type(request).__name__}"
            )

        if not request.question_id or not isinstance(request.question_id, str):
            raise ValueError("question_id must be a non-empty string")

        if not request.question_id.strip():
            raise ValueError("question_id cannot be whitespace-only")

        if request.user_text is not None and not isinstance(request.user_text, str):
            raise TypeError(
                f"user_text must be a string or None, got {type(request.user_text).__name__}"
            )

        logger.info(
            "Starting text enhancement: question_id=%s, submission_id=%s",
            request.question_id,
            request.submission_id,
        )

        try:
            # Validate inputs using dedicated validator
            self.input_validator.validate_question_id(request.question_id)

            if request.user_text is not None and not isinstance(request.user_text, str):
                raise TypeError(
                    f"user_text must be a string or None, got {type(request.user_text).__name__}"
                )

            sanitized_user_text = self.input_validator.sanitize_user_text(
                request.user_text
            )

            # Build context using modular builders
            context = await self._build_enhancement_context(
                request, sanitized_user_text
            )

            # Call LLM
            enhanced_data = await self._call_llm_for_enhancement(context)

            # Build response
            response = self._build_response(request, enhanced_data)

            elapsed = time.time() - start_time
            logger.info(
                "Text enhancement completed in %.2fs: question_id=%s",
                elapsed,
                request.question_id,
            )

            # Persist AI interaction (non-blocking)
            # await self._persist_ai_interaction(request, response)
            interaction = await self._persist_ai_interaction(request, response)

            if interaction:
                response.interaction_id = interaction.id

            return response

        except ValueError as e:
            logger.error(
                "Validation error in text enhancement for question_id=%s: %s",
                request.question_id,
                str(e),
            )
            raise EnhanceAnswerServiceError(
                error="Validation Error",
                message=str(e),
                status_code=400,
            ) from e
        except TypeError as e:
            logger.error(
                "Type error in text enhancement for question_id=%s: %s",
                request.question_id,
                str(e),
            )
            raise EnhanceAnswerServiceError(
                error="Validation Error",
                message=f"Invalid input type for text enhancement: {str(e)}",
                status_code=400,
            ) from e
        except asyncio.TimeoutError as e:
            logger.error(
                "Timeout in text enhancement for question_id=%s after %.2fs",
                request.question_id,
                time.time() - start_time,
            )
            raise EnhanceAnswerServiceError(
                error="Gateway Timeout",
                message=f"Text enhancement timed out for question_id={request.question_id}",
                status_code=504,
            ) from e
        except (RuntimeError, KeyError) as e:
            logger.exception(
                "Enhancement failed for question_id=%s: %s", request.question_id, str(e)
            )
            raise EnhanceAnswerServiceError(
                error="Internal Server Error",
                message=f"Enhancement failed: {str(e)}",
                status_code=500,
            ) from e
        except Exception as e:
            logger.exception(
                "Unexpected error in text enhancement for question_id=%s: %s",
                request.question_id,
                str(e),
            )
            handle_service_exception(e, EnhanceAnswerServiceError, "enhancing text")

    async def _build_enhancement_context(
        self, request: EnhanceRequest, sanitized_user_text: str
    ) -> Dict[str, Any]:
        """Build comprehensive context using modular builders."""
        # Fetch question data (critical operation)
        try:
            question_data = await self.question_builder.build(request.question_id)
        except Exception as e:
            logger.error(
                "Failed to fetch question data for question_id=%s: %s",
                request.question_id,
                str(e),
            )
            raise

        # Validate question data structure
        if not isinstance(question_data, dict):
            raise TypeError(
                f"Question data must be a dict, got {type(question_data).__name__}"
            )

        if "question" not in question_data:
            raise KeyError("Missing 'question' field in question data")

        if not isinstance(question_data["question"], str):
            raise TypeError(
                f"Question text must be a string, got {type(question_data['question']).__name__}"
            )

        # Fetch document content (graceful failure)
        try:
            document_content = await self.document_builder.build(
                request.submission_id, request.form_id, request.question_id, self.db
            )

            if not isinstance(document_content, str):
                logger.warning(
                    "Document content is not a string (type=%s), converting to string",
                    type(document_content).__name__,
                )
            document_content = (
                str(document_content)
                if document_content
                else self.settings.enhancement_default_no_data_message
            )

        except Exception as e:
            logger.warning(
                "Document extraction failed for question_id=%s, submission_id=%s: %s, using default message",
                request.question_id,
                request.submission_id,
                str(e),
            )
            document_content = self.settings.enhancement_default_no_data_message

        # Format form data
        form_data_str = self.form_builder.build(request.form_data)

        return {
            "question": question_data["question"],
            "user_text": sanitized_user_text,
            "suggestions": question_data["suggestions"],
            "document_content": document_content,
            "form_context": form_data_str,
        }

    async def _call_llm_for_enhancement(
        self, context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Call LLM with context to generate enhanced text."""
        prompt = ENHANCE_ANSWER_PROMPT.format(
            question_text=context["question"],
            user_text=context["user_text"],
            suggestions_text=context["suggestions"],
            document_context=context["document_content"],
            form_context=context["form_context"],
        )

        logger.debug("Calling LLM for enhancement")
        llm_start = time.time()

        if self.settings.use_llm_gateway:
            llm_response = await self.llm_gateway_client.ask_model(
                model_name=ENHANCE_MODEL,
                prompt=prompt,
            )
        else:
            llm_response = await self.cortex_client.invoke_ask(
                CORTEX_MODEL,
                prompt,
                input_variables={"question": prompt},
            )

        llm_elapsed = time.time() - llm_start
        logger.debug("LLM call completed in %.2fs", llm_elapsed)

        # Use dedicated parser
        return self.response_parser.parse(llm_response)

    def _build_response(
        self, request: EnhanceRequest, enhanced_data: Dict[str, Any]
    ) -> EnhanceResponse:
        """
        Build EnhanceResponse from enhanced data.

        Args:
            request: Original request
            enhanced_data: Dict from LLM with enhancement results

        Returns:
            EnhanceResponse object
        """
        enhanced_answer = enhanced_data.get(
            "enhanced_answer", self.settings.enhancement_default_failed_message
        )
        rationale = enhanced_data.get("improvements_summary", "")

        # Format rationale if it's a complex object
        rationale_str = self._format_rationale(rationale)

        try:
            return EnhanceResponse(
                question_id=request.question_id,
                original_text=request.user_text,
                reviewed_text=enhanced_answer,
                rationale=rationale_str,
            )
        except (ValueError, TypeError) as e:
            # Fallback: coerce to strings to avoid validation errors
            logger.error("EnhanceResponse validation failed: %s", e)
            return EnhanceResponse(
                question_id=request.question_id,
                original_text=str(request.user_text),
                reviewed_text=str(enhanced_answer),
                rationale=str(rationale_str) if rationale_str else None,
            )

    def _format_rationale(self, rationale: Any) -> str:
        """
        Format rationale into readable string.

        Handles various types: string, dict, list, etc.

        Args:
            rationale: Rationale in various formats

        Returns:
            Formatted string
        """
        if not rationale:
            return ""

        if isinstance(rationale, str):
            return rationale

        if isinstance(rationale, dict):
            try:
                rationale_pairs = []
                for key, value in rationale.items():
                    if isinstance(value, (dict, list)):
                        value_str = json.dumps(value, ensure_ascii=False)
                    else:
                        value_str = str(value)
                    rationale_pairs.append(f"{key}: {value_str}")
                return "; ".join(rationale_pairs)
            except (TypeError, KeyError) as e:
                logger.warning("Failed to format rationale dict: %s", e)
                return json.dumps(rationale, ensure_ascii=False)

        # Fallback for other types
        return str(rationale)

    async def _persist_ai_interaction(
        self, request: EnhanceRequest, response: EnhanceResponse
    ) -> None:
        """Persist AI interaction record (non-blocking)."""
        try:
            ai_generated_content = {
                "original_text": request.user_text,
                "reviewed_text": response.reviewed_text,
                "rationale": response.rationale,
            }

            interaction = await create_ai_interaction(
                db=self.db,
                submission_id=request.submission_id,
                question_id=request.question_id,
                ai_feature_type=AIFeatureType.ENHANCE_ANSWER,
                ai_generated_content=ai_generated_content,
                user_input=request.user_text,
                is_accepted=False,
                form_id=request.form_id,
                commit=True,
            )
            # response.interaction_id = interaction.id

            logger.info(
                "AI interaction persisted successfully: interaction_id=%s, question_id=%s",
                interaction.id,
                request.question_id,
            )
            return interaction

        except Exception:
            logger.exception(
                "Failed to persist AI interaction for enhance_text; continuing"
            )


# Backward compatibility: keep the original function signature
async def enhance_text_service(
    request: EnhanceRequest, db: AsyncSession, settings: Settings
) -> EnhanceResponse:
    """
    Legacy wrapper function for backward compatibility.

    Delegates to EnhanceAnswerService for actual implementation.

    Args:
        request: Enhancement request
        db: Async database session
        settings: Application settings

    Returns:
        EnhanceResponse with enhanced text
    """
    service = EnhanceAnswerService(db, settings)
    return await service.enhance_text(request)
