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
from typing import Any, Dict, List

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from data_service.clients.cortex_client import cortex_client
from data_service.clients.llm_gateway_client import llm_gateway_client
from data_service.configurations.prompts.enhance_answer_prompt import (
    ENHANCE_ANSWER_PROMPT,
)
from data_service.configurations.settings import Settings
from data_service.constants.constants import CORTEX_MODEL, ENHANCE_MODEL
from data_service.models.questions import Questions
from data_service.models.suggestions import Suggestions
from data_service.serializers.enhance_answer import EnhanceRequest, EnhanceResponse
from data_service.service.doc_extract_service import DocumentExtractionService
from data_service.utils.ai_interaction_utils import create_ai_interaction
from data_service.serializers.ai_feedback import AIFeatureType
from data_service.exceptions.service_errors import EnhanceAnswerServiceError
from data_service.utils.error_utils import handle_service_exception


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
        self.document_service = DocumentExtractionService()
        self.cortex_client = cortex_client
        self.llm_gateway_client = llm_gateway_client

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
            # Validate and sanitize input
            sanitized_user_text = self._sanitize_user_input(request.user_text)

            # Fetch all required data in parallel
            context = await self._build_enhancement_context(
                request, sanitized_user_text
            )

            # Call LLM for enhancement
            enhanced_data = await self._call_llm_for_enhancement(context)

            # Build and return response
            response = self._build_response(request, enhanced_data)

            elapsed = time.time() - start_time
            logger.info(
                "Text enhancement completed in %.2fs: question_id=%s",
                elapsed,
                request.question_id,
            )

            # Persist an AI interaction record so users can submit feedback later.
            interaction_id = None
            try:
                ai_generated_content = {
                    "original_text": request.user_text,
                    "reviewed_text": response.reviewed_text,
                    "rationale": response.rationale,
                }

                # Non-blocking: failures to persist should not prevent returning the response
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
                interaction_id = interaction.id
                response.interaction_id = interaction_id
            except Exception:
                logger.exception(
                    "Failed to persist AI interaction for enhance_text; continuing"
                )

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

    async def _fetch_question_and_suggestions(self, question_id: str) -> Dict[str, Any]:
        """
        Fetch question and suggestions in single optimized JOIN query.

        This eliminates the N+1 query problem by combining two separate
        queries into one.

        Args:
            question_id: Question identifier

        Returns:
            Dict with 'question' (str) and 'suggestions' (list)

        Raises:
            ValueError: If question not found
        """
        # Optimized: Single JOIN query instead of 2 separate queries
        query = (
            select(Questions, Suggestions)
            .outerjoin(Suggestions, Suggestions.question_id == Questions.id)
            .where(Questions.id == question_id)
        )

        result = await self.db.execute(query)
        row = result.first()

        if not row or not row[0]:
            logger.error("Question not found: question_id=%s", question_id)
            raise EnhanceAnswerServiceError(
                error="Not Found",
                message=f"Question with ID '{question_id}' not found",
                status_code=404,
            )

        question_obj = row[0]
        suggestion_record = row[1]

        return {
            "question": question_obj.question,
            "suggestions": (
                suggestion_record.suggestions
                if suggestion_record and suggestion_record.suggestions
                else []
            ),
        }

    async def _build_enhancement_context(
        self, request: EnhanceRequest, sanitized_user_text: str
    ) -> Dict[str, Any]:
        """
        Build comprehensive context for enhancement by fetching all data sequentially.

        Args:
            request: Enhancement request
            sanitized_user_text: Sanitized user input

        Returns:
            Dict with all context data needed for LLM prompt
        """
        # Fetch question data first (critical operation)
        try:
            question_data = await self._fetch_question_and_suggestions(
                request.question_id
            )
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

        # Fetch document extraction sequentially (non-critical, can fail gracefully)
        try:
            document_content = await self._fetch_document_extraction(request)
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
                "Document extraction failed for question_id=%s: %s, using default message",
                request.question_id,
                str(e),
            )
            document_content = self.settings.enhancement_default_no_data_message

        # Format form data
        form_data_str = self._format_form_data(request.form_data)

        return {
            "question": question_data["question"],
            "user_text": sanitized_user_text,
            "suggestions": question_data["suggestions"],
            "document_content": document_content,
            "form_context": form_data_str,
        }

    async def _fetch_document_extraction(self, request: EnhanceRequest) -> str:
        """
        Fetch document extraction for the question.

        Args:
            request: Enhancement request

        Returns:
            Document content or default message
        """
        try:
            document_extracted = await self.document_service.get_question_extraction(
                submission_id=request.submission_id,
                form_id=request.form_id,
                question_id=request.question_id,
                db=self.db,
            )

            if document_extracted and isinstance(document_extracted, dict):
                return document_extracted.get(
                    "document_content",
                    self.settings.enhancement_default_no_data_message,
                )

            return self.settings.enhancement_default_no_data_message

        except (ValueError, KeyError, AttributeError) as e:
            logger.warning(
                "Document extraction failed for question_id=%s: %s",
                request.question_id,
                str(e),
            )
            return self.settings.enhancement_default_no_data_message

    def _format_form_data(self, form_data: List[Any]) -> str:
        """
        Format form data entries into readable string.

        Args:
            form_data: List of form entry objects

        Returns:
            Formatted string with all form entries
        """
        if not form_data:
            return ""

        # Use model_dump() for Pydantic v2 compatibility
        formatted_entries = []
        for entry in form_data:
            try:
                entry_dict = (
                    entry.model_dump() if hasattr(entry, "model_dump") else entry.dict()
                )
                formatted_entries.append(
                    f"Question ID: {entry_dict['questionId']}\n"
                    f"Question: {entry_dict['question']}\n"
                    f"Answer: {', '.join(entry_dict['answer'])}"
                )
            except (KeyError, AttributeError, TypeError) as e:
                logger.warning("Failed to format form entry: %s", e)
                continue

        return "\n\n".join(formatted_entries)

    async def _call_llm_for_enhancement(
        self, context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Call LLM with context to generate enhanced text.

        Args:
            context: Dict with all context data

        Returns:
            Dict with enhanced_answer and improvements_summary

        Raises:
            ValueError: If LLM returns invalid response
        """
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

        return self._parse_llm_response(llm_response)

    def _parse_llm_response(self, llm_response: Any) -> Dict[str, Any]:
        """
        Parse LLM response JSON with error handling.

        Args:
            llm_response: Raw string or dict response from LLM

        Returns:
            Parsed dict with enhanced_answer and improvements_summary
        """
        default_response = {
            "enhanced_answer": self.settings.enhancement_default_failed_message,
            "improvements_summary": "",
        }

        if not llm_response:
            logger.warning("LLM response is empty")
            return default_response

        # Handle dict response (e.g., from LLM gateway that returns full API response)
        if isinstance(llm_response, dict):
            # Extract content from OpenAI-style response structure
            if "choices" in llm_response and llm_response["choices"]:
                try:
                    content = llm_response["choices"][0]["message"]["content"]
                    if isinstance(content, str):
                        llm_response = content
                    else:
                        logger.warning(
                            "LLM content is not a string (type=%s), converting",
                            type(content).__name__,
                        )
                        llm_response = str(content)
                except (KeyError, IndexError, TypeError) as e:
                    logger.error(
                        "Failed to extract content from LLM response structure: %s",
                        str(e),
                    )
                    return default_response
            else:
                # Already a dict but not in API response format - might be the parsed content
                logger.debug(
                    "LLM response is already a dict, attempting to use directly"
                )
                if "enhanced_answer" in llm_response:
                    return llm_response
                logger.warning(
                    "LLM response is dict but missing expected structure, converting to string"
                )
                llm_response = str(llm_response)

        # Convert to string if not already
        if not isinstance(llm_response, str):
            logger.warning(
                "LLM response is not a string (type=%s), converting",
                type(llm_response).__name__,
            )
            llm_response = str(llm_response)

        try:
            enhanced_data = json.loads(llm_response)

            if not isinstance(enhanced_data, dict):
                logger.error(
                    "LLM response is not a dict after parsing: %s",
                    type(enhanced_data).__name__,
                )
                return default_response

            # Validate required fields exist and have correct types
            if "enhanced_answer" in enhanced_data:
                if not isinstance(enhanced_data["enhanced_answer"], str):
                    logger.warning(
                        "enhanced_answer is not a string (type=%s), converting",
                        type(enhanced_data["enhanced_answer"]).__name__,
                    )
                    enhanced_data["enhanced_answer"] = str(
                        enhanced_data["enhanced_answer"]
                    )
            else:
                logger.warning("Missing 'enhanced_answer' in LLM response")
                enhanced_data["enhanced_answer"] = default_response["enhanced_answer"]

            return enhanced_data

        except json.JSONDecodeError as e:
            logger.error(
                "JSON decoding failed at position %d: %s. Response preview: %s",
                e.pos,
                str(e),
                llm_response[:200] if len(llm_response) > 200 else llm_response,
            )
            return default_response
        except Exception as e:
            logger.exception("Unexpected error parsing LLM response: %s", str(e))
            return default_response

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

    def _sanitize_user_input(self, user_text: str) -> str:
        """
        Sanitize user input to prevent prompt injection attacks.

        Args:
            user_text: Raw user input

        Returns:
            Sanitized text safe for LLM prompts

        Raises:
            TypeError: If user_text is not a string
        """
        if user_text is None:
            return ""

        if not isinstance(user_text, str):
            raise TypeError(
                f"user_text must be a string or None, got {type(user_text).__name__}"
            )

        if not user_text:
            return ""

        # Check for unreasonably long input
        if len(user_text) > self.settings.enhancement_max_user_text_length * 2:
            logger.warning(
                "User text extremely long (%d chars), truncating to %d",
                len(user_text),
                self.settings.enhancement_max_user_text_length,
            )

        # Truncate to maximum length
        sanitized = user_text[: self.settings.enhancement_max_user_text_length]

        # Remove potential prompt manipulation patterns
        dangerous_patterns = [
            "```",
            "system:",
            "assistant:",
            "\n\n---\n\n",
            "<|endoftext|>",
            "<|im_end|>",
        ]

        for pattern in dangerous_patterns:
            sanitized = sanitized.replace(pattern, "")

        return sanitized.strip()


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
