"""
Suggestions Coverage Analysis Service

This module provides services for analyzing how well user responses cover
suggested content for questions, using AI-powered analysis.
"""

import json
import logging
from typing import Dict, Any, List, Optional, Tuple
from uuid import UUID

from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession

from data_service.clients.cortex_client import CortexClient
from data_service.utils.cache_manager import cache_manager
from data_service.configurations.prompts.suggestions_coverage_prompt import (
    SUGGESTIONS_COVERAGE_PROMPT,
)
from data_service.constants.constants import (
    CORTEX_MODEL,
    SuggestionCoverageStatus,
    RESPONSE_KEY_SUGGESTIONS_ANALYSIS,
    RESPONSE_KEY_SCORE,
    RESPONSE_KEY_TEXT,
    RESPONSE_KEY_RATIONALE,
    RESPONSE_KEY_STATUS,
)
from data_service.models.suggestion_coverage_score import SuggestionCoverageScore
from data_service.models.questions import Questions
from data_service.configurations.settings import Settings, get_settings
from data_service.utils.ai_interaction_utils import create_ai_interaction
from data_service.serializers.ai_feedback import AIFeatureType
from data_service.exceptions.service_errors import SuggestionsCoverageServiceError
from data_service.utils.error_utils import handle_service_exception
from data_service.utils.input_validator import InputValidator

logger = logging.getLogger(__name__)


class SuggestionsCoverageService:
    """
    Service for analyzing suggestion coverage using AI.

    This service orchestrates the process of analyzing how well user responses
    cover suggested content by coordinating validation, data fetching, LLM analysis,
    and result persistence.

    Attributes:
        cortex_client: Client for LLM interactions
        cache_manager: Manager for caching database queries
        input_validator: Validator for sanitizing user inputs
        max_retries: Maximum retry attempts for LLM calls
        max_suggestion_length: Maximum allowed length for individual suggestions
    """

    def __init__(
        self,
        settings: Optional[Settings] = None,
        cortex_client: Optional[CortexClient] = None,
    ):
        """
        Initialize the suggestions coverage service.

        Args:
            settings: Application settings (defaults to global settings if None)
            cortex_client: Cortex client for LLM calls (created if None, supports DIP)
        """
        if settings is None:
            settings = get_settings()

        self.cortex_client = cortex_client or CortexClient()
        self.max_retries = settings.llm_max_retries
        self.cache_manager = cache_manager
        self.input_validator = InputValidator(
            max_length=settings.suggestions_coverage_max_user_text_length
        )
        self.max_suggestion_length = settings.suggestions_coverage_max_suggestion_length

    async def _get_suggestions_from_db(
        self, question_id: str, db: AsyncSession
    ) -> Optional[List[str]]:
        """
        Fetch suggestions for a question from database with caching.
        Delegates to centralized cache manager.

        Args:
            question_id: Question identifier
            db: Database session

        Returns:
            List of suggestions or None if not found
        """
        return await self.cache_manager.get_suggestions(question_id, db)

    async def _get_question_from_db(
        self, question_id: str, db: AsyncSession
    ) -> Optional[Questions]:
        """
        Fetch question from database with caching.
        Delegates to centralized cache manager.

        Args:
            question_id: Question identifier
            db: Database session

        Returns:
            Questions object or None if not found
        """
        return await self.cache_manager.get_question(question_id, db)

    def _sanitize_suggestions(self, suggestions: List[str]) -> List[str]:
        """
        Sanitize suggestions list to prevent prompt injection and filter invalid entries.

        Args:
            suggestions: List of suggestion strings

        Returns:
            List of sanitized suggestions (may be shorter than input)
        """
        sanitized = []

        for idx, suggestion in enumerate(suggestions):
            if not suggestion or not isinstance(suggestion, str):
                logger.warning(
                    "Skipping invalid suggestion at index %d: type=%s",
                    idx,
                    type(suggestion).__name__,
                )
                continue

            # Truncate to max length
            if len(suggestion) > self.max_suggestion_length:
                logger.warning(
                    "Suggestion at index %d exceeds max length (%d chars), truncating to %d",
                    idx,
                    len(suggestion),
                    self.max_suggestion_length,
                )
                suggestion = suggestion[: self.max_suggestion_length]

            # Remove dangerous patterns
            cleaned = suggestion
            for pattern in self.input_validator.dangerous_patterns:
                cleaned = cleaned.replace(pattern, "")

            cleaned = cleaned.strip()

            if cleaned:
                sanitized.append(cleaned)
            else:
                logger.warning(
                    "Suggestion at index %d became empty after sanitization", idx
                )

        logger.info(
            "Sanitized suggestions: %d input -> %d output",
            len(suggestions),
            len(sanitized),
        )

        return sanitized

    def _validate_and_sanitize_inputs(self, question_id: str, user_text: str) -> str:
        """
        Validate and sanitize inputs for coverage analysis.

        Args:
            question_id: Question identifier to validate
            user_text: User text to sanitize

        Returns:
            Sanitized user text

        Raises:
            SuggestionsCoverageServiceError: If validation fails
        """
        # Validate question_id
        try:
            self.input_validator.validate_question_id(question_id)
        except ValueError as e:
            logger.error("Invalid question_id: %s", str(e))
            raise SuggestionsCoverageServiceError(
                error="Validation Error",
                message=str(e),
                status_code=400,
            ) from e

        # Sanitize user_text to prevent prompt injection
        try:
            sanitized_text = self.input_validator.sanitize_user_text(user_text)
        except TypeError as e:
            logger.error("Invalid user_text type: %s", str(e))
            raise SuggestionsCoverageServiceError(
                error="Validation Error",
                message=str(e),
                status_code=400,
            ) from e

        if not sanitized_text:
            logger.error("Empty user_text after sanitization")
            raise SuggestionsCoverageServiceError(
                error="Validation Error",
                message="User text cannot be empty or contain only invalid characters",
                status_code=400,
            )

        return sanitized_text

    async def _fetch_question_and_suggestions(
        self, question_id: str, db: AsyncSession
    ) -> Tuple[Questions, List[str]]:
        """
        Fetch question and suggestions from database.

        Args:
            question_id: Question identifier
            db: Database session

        Returns:
            Tuple of (question, sanitized_suggestions)

        Raises:
            SuggestionsCoverageServiceError: If data not found
        """
        # Fetch question with caching
        question = await self._get_question_from_db(question_id, db)
        if not question:
            logger.error("Question with ID %s not found", question_id)
            raise SuggestionsCoverageServiceError(
                error="Not Found",
                message=f"Question with ID {question_id} not found",
                status_code=404,
            )

        # Fetch suggestions with caching
        suggestions_json = await self._get_suggestions_from_db(question_id, db)
        if not suggestions_json:
            logger.error("No suggestions found for question ID %s", question_id)
            raise SuggestionsCoverageServiceError(
                error="Not Found",
                message=f"No suggestions found for question ID {question_id}",
                status_code=404,
            )

        # Sanitize suggestions to prevent prompt injection
        sanitized_suggestions = self._sanitize_suggestions(suggestions_json)
        if not sanitized_suggestions:
            logger.error(
                "No valid suggestions remaining after sanitization for question ID %s",
                question_id,
            )
            raise SuggestionsCoverageServiceError(
                error="Validation Error",
                message="All suggestions were invalid or too long after sanitization",
                status_code=400,
            )

        return question, sanitized_suggestions

    def _process_coverage_results(
        self, coverage_result: Dict[str, Any]
    ) -> Tuple[List[Dict[str, str]], List[Dict[str, str]], float]:
        """
        Process coverage analysis results into categorized suggestions.

        Args:
            coverage_result: Raw coverage analysis result from LLM

        Returns:
            Tuple of (required_suggestions, completed_suggestions, overall_score)
        """
        required_suggestions = []
        completed_suggestions = []

        for suggestion in coverage_result.get(RESPONSE_KEY_SUGGESTIONS_ANALYSIS, []):
            suggestion_item = {
                RESPONSE_KEY_TEXT: suggestion[RESPONSE_KEY_TEXT],
                RESPONSE_KEY_RATIONALE: suggestion[RESPONSE_KEY_RATIONALE],
            }

            if (
                suggestion.get(RESPONSE_KEY_STATUS)
                == SuggestionCoverageStatus.COMPLETED
            ):
                completed_suggestions.append(suggestion_item)
            else:
                required_suggestions.append(suggestion_item)

        overall_score = coverage_result.get(RESPONSE_KEY_SCORE, 0.0)

        return required_suggestions, completed_suggestions, overall_score

    async def _persist_ai_interaction(
        self,
        db: AsyncSession,
        submission_id: UUID,
        question_id: str,
        user_text: str,
        required_suggestions: List[Dict[str, str]],
        completed_suggestions: List[Dict[str, str]],
    ) -> Optional[int]:
        """
        Persist AI interaction for user feedback (non-critical operation).

        Args:
            db: Database session
            submission_id: Submission UUID
            question_id: Question identifier
            user_text: User's input text
            required_suggestions: List of incomplete suggestions
            completed_suggestions: List of completed suggestions

        Returns:
            Interaction ID if successful, None otherwise
        """
        try:
            ai_generated_content = {
                "user_text": user_text,
                "required_suggestions": required_suggestions,
                "completed_suggestions": completed_suggestions,
            }

            interaction = await create_ai_interaction(
                db=db,
                submission_id=submission_id,
                question_id=question_id,
                ai_feature_type=AIFeatureType.CHECK_COVERAGE,
                ai_generated_content=ai_generated_content,
                user_input=user_text,
                is_accepted=False,
                commit=True,
            )
            return interaction.id

        except Exception:  # PyLint: disable=broad-except
            logger.exception(
                "Failed to persist AI interaction for suggestions coverage"
            )
            return None

    async def check_coverage_for_question(
        self, question_id: str, user_text: str, submission_id: UUID, db: AsyncSession
    ) -> Dict[str, Any]:
        """
        Orchestrate the complete coverage analysis workflow.

        This method coordinates validation, data fetching, analysis, and persistence.
        It follows the Single Responsibility Principle by delegating specific tasks
        to focused helper methods.

        Args:
            question_id: Question identifier
            user_text: User's answer text to analyze
            submission_id: Submission UUID for saving scores
            db: Database session

        Returns:
            Dict containing:
                - required_suggestions: List of incomplete suggestions
                - completed_suggestions: List of completed suggestions
                - overall_score: Coverage score (0.0 to 1.0)
                - interaction_id: AI interaction ID (if persisted)

        Raises:
            SuggestionsCoverageServiceError: If validation, data fetching, or analysis fails
        """
        # Step 1: Validate and sanitize inputs (SRP)
        sanitized_user_text = self._validate_and_sanitize_inputs(question_id, user_text)

        # Step 2: Fetch and validate data (SRP)
        question, sanitized_suggestions = await self._fetch_question_and_suggestions(
            question_id, db
        )

        # Step 3: Perform coverage analysis (SRP)
        coverage_result = await self.analyze_suggestions_coverage(
            question_text=question.question,
            user_text=sanitized_user_text,
            suggestions=sanitized_suggestions,
        )

        # Step 4: Process results (SRP)
        required_suggestions, completed_suggestions, overall_score = (
            self._process_coverage_results(coverage_result)
        )

        # Step 5: Save coverage scores (SRP)
        await self.save_coverage_scores(
            submission_id=submission_id,
            question_id=question_id,
            score=overall_score,
            db=db,
        )

        logger.info(
            "Coverage analysis completed for question %s: "
            "%d completed, %d required, score=%.3f",
            question_id,
            len(completed_suggestions),
            len(required_suggestions),
            overall_score,
        )

        # Step 6: Persist AI interaction (non-critical, SRP)
        interaction_id = await self._persist_ai_interaction(
            db=db,
            submission_id=submission_id,
            question_id=question_id,
            user_text=sanitized_user_text,
            required_suggestions=required_suggestions,
            completed_suggestions=completed_suggestions,
        )

        return {
            "required_suggestions": required_suggestions,
            "completed_suggestions": completed_suggestions,
            "overall_score": overall_score,
            "interaction_id": interaction_id,
        }

    def _validate_analysis_inputs(
        self, question_text: str, user_text: str, suggestions: List[str]
    ) -> None:
        """
        Validate inputs for coverage analysis.

        Args:
            question_text: Question text to validate
            user_text: User text to validate
            suggestions: Suggestions list to validate

        Raises:
            SuggestionsCoverageServiceError: If any input is invalid
        """
        if not question_text or not question_text.strip():
            raise SuggestionsCoverageServiceError(
                error="Validation Error",
                message="question_text cannot be empty",
                status_code=400,
            )

        if not user_text or not user_text.strip():
            logger.error("Empty user_text provided")
            raise SuggestionsCoverageServiceError(
                error="Validation Error",
                message="User text cannot be empty for coverage analysis",
                status_code=400,
            )

        if not suggestions:
            logger.error("Empty suggestions list provided")
            raise SuggestionsCoverageServiceError(
                error="Validation Error",
                message="No suggestions available for coverage analysis",
                status_code=400,
            )

    def _prepare_suggestions_text(self, suggestions: List[str]) -> str:
        """
        Format suggestions into prompt-ready text.

        Args:
            suggestions: List of suggestion strings

        Returns:
            Formatted suggestions text

        Raises:
            SuggestionsCoverageServiceError: If all suggestions are empty
        """
        suggestions_text = "\n".join(
            f"- {suggestion.strip()}"
            for suggestion in suggestions
            if suggestion and suggestion.strip()
        )

        if not suggestions_text:
            logger.error("All suggestions were empty after filtering")
            raise SuggestionsCoverageServiceError(
                error="Validation Error",
                message="All suggestions are empty or invalid",
                status_code=400,
            )

        return suggestions_text

    def _parse_llm_response(self, response: str) -> Dict[str, Any]:
        """
        Parse and validate LLM response JSON.

        Args:
            response: Raw LLM response string

        Returns:
            Parsed and validated JSON dict

        Raises:
            SuggestionsCoverageServiceError: If parsing or validation fails
        """
        if not response:
            logger.error("Empty response from Cortex")
            raise SuggestionsCoverageServiceError(
                error="Analysis Error",
                message="LLM returned empty response after all retry attempts",
                status_code=500,
            )

        try:
            # Extract JSON from response
            start_idx = response.find("{")
            end_idx = response.rfind("}") + 1

            if start_idx == -1 or end_idx <= start_idx:
                logger.error("No JSON found in response")
                raise SuggestionsCoverageServiceError(
                    error="Analysis Error",
                    message="LLM response did not contain valid JSON format",
                    status_code=500,
                )

            json_str = response[start_idx:end_idx]
            parsed_json = json.loads(json_str)

            # Validate response structure
            if RESPONSE_KEY_SUGGESTIONS_ANALYSIS not in parsed_json:
                logger.error("Missing suggestions_analysis field in response")
                raise SuggestionsCoverageServiceError(
                    error="Analysis Error",
                    message="LLM response missing required 'suggestions_analysis' field",
                    status_code=500,
                )

            analysis = parsed_json[RESPONSE_KEY_SUGGESTIONS_ANALYSIS]
            if not isinstance(analysis, list):
                logger.error(
                    "Invalid response format: suggestions_analysis is not a list"
                )
                raise SuggestionsCoverageServiceError(
                    error="Analysis Error",
                    message="LLM response format is invalid: suggestions_analysis must be a list",
                    status_code=500,
                )

            logger.info(
                "Successfully parsed response with %d analyzed suggestions",
                len(analysis),
            )
            return parsed_json

        except json.JSONDecodeError as e:
            logger.error("JSON parse error: %s", str(e))
            raise SuggestionsCoverageServiceError(
                error="Analysis Error",
                message=f"Failed to parse LLM response as JSON: {str(e)}",
                status_code=500,
            ) from e

    async def analyze_suggestions_coverage(
        self, question_text: str, user_text: str, suggestions: List[str]
    ) -> Dict[str, Any]:
        """
        Analyze user text coverage against question suggestions using Cortex LLM.

        NOTE: This method assumes user_text and suggestions are already sanitized.
        Call from check_coverage_for_question which handles sanitization.

        Args:
            question_text: The original question text (from database, trusted)
            user_text: User's answer text to analyze (should be pre-sanitized)
            suggestions: List of suggestion strings (should be pre-sanitized)

        Returns:
            Dict containing:
                - suggestions_analysis: List of analyzed suggestions
                - score: Coverage score (0.0 to 1.0)

        Raises:
            SuggestionsCoverageServiceError: If inputs are invalid, LLM analysis fails,
                or network errors occur after all retry attempts
        """
        # Step 1: Validate inputs (SRP)
        self._validate_analysis_inputs(question_text, user_text, suggestions)

        try:
            # Step 2: Prepare suggestions text (SRP)
            suggestions_text = self._prepare_suggestions_text(suggestions)

            # Step 3: Format prompt (SRP)
            prompt = SUGGESTIONS_COVERAGE_PROMPT.format(
                question_text=question_text.strip(),
                user_text=user_text.strip(),
                suggestions_text=suggestions_text,
            )

            logger.info(
                "Analyzing coverage: question_len=%d, user_text_len=%d, suggestions_count=%d",
                len(question_text),
                len(user_text),
                len(suggestions),
            )

            # Step 4: Call LLM (SRP)
            response = await self.cortex_client.invoke_ask(
                model_name=CORTEX_MODEL,
                prompt=prompt,
                max_retries=self.max_retries,
            )

            # Step 5: Parse and validate response (SRP)
            return self._parse_llm_response(response)

        except SuggestionsCoverageServiceError:
            # Re-raise our custom exceptions
            raise
        except Exception as e:  # PyLint: disable=broad-except
            logger.exception("Critical error in analyze_suggestions_coverage")
            handle_service_exception(
                e, SuggestionsCoverageServiceError, "analyzing suggestions coverage"
            )

    def _validate_score_inputs(
        self, submission_id: UUID, question_id: str, score: float
    ) -> float:
        """
        Validate and normalize score inputs.

        Args:
            submission_id: Submission UUID to validate
            question_id: Question identifier to validate
            score: Score value to validate and normalize

        Returns:
            Normalized score (clamped to 0.0-1.0 range)

        Raises:
            SuggestionsCoverageServiceError: If validation fails
        """
        if not isinstance(submission_id, UUID):
            raise SuggestionsCoverageServiceError(
                error="Validation Error",
                message=f"submission_id must be UUID, got {type(submission_id).__name__}",
                status_code=400,
            )

        if not question_id or not question_id.strip():
            raise SuggestionsCoverageServiceError(
                error="Validation Error",
                message="question_id cannot be empty",
                status_code=400,
            )

        if not isinstance(score, (int, float)):
            raise SuggestionsCoverageServiceError(
                error="Validation Error",
                message=f"score must be numeric, got {type(score).__name__}",
                status_code=400,
            )

        # Clamp score to valid range [0.0, 1.0]
        return max(0.0, min(1.0, float(score)))

    async def _get_existing_score_record(
        self, submission_id: UUID, question_id: str, db: AsyncSession
    ) -> Optional[SuggestionCoverageScore]:
        """
        Retrieve existing coverage score record if it exists.

        Args:
            submission_id: Submission UUID
            question_id: Question identifier
            db: Database session

        Returns:
            Existing score record or None
        """
        result = await db.execute(
            select(SuggestionCoverageScore).where(
                SuggestionCoverageScore.submission_id == submission_id,
                SuggestionCoverageScore.question_id == question_id,
            )
        )
        return result.scalar_one_or_none()

    async def save_coverage_scores(
        self, submission_id: UUID, question_id: str, score: float, db: AsyncSession
    ) -> None:
        """
        Save or update coverage score for a submission/question pair.

        This method follows the Single Responsibility Principle by delegating
        validation and data access to focused helper methods.

        Args:
            submission_id: UUID of the submission
            question_id: Question identifier
            score: Coverage score (0.0 to 1.0)
            db: Database session

        Raises:
            SuggestionsCoverageServiceError: If inputs are invalid or database operation fails
        """
        # Step 1: Validate and normalize inputs (SRP)
        normalized_score = self._validate_score_inputs(
            submission_id, question_id, score
        )

        try:
            # Step 2: Check for existing record (SRP)
            existing = await self._get_existing_score_record(
                submission_id, question_id, db
            )

            # Step 3: Update or create record (SRP)
            if existing:
                old_score = existing.coverage_score
                existing.coverage_score = normalized_score
                logger.info(
                    "Updated coverage score for submission=%s, question=%s: %.3f -> %.3f",
                    submission_id,
                    question_id,
                    old_score,
                    normalized_score,
                )
            else:
                new_score = SuggestionCoverageScore(
                    submission_id=submission_id,
                    question_id=question_id,
                    coverage_score=normalized_score,
                )
                db.add(new_score)
                logger.info(
                    "Created coverage score for submission=%s, question=%s: %.3f",
                    submission_id,
                    question_id,
                    normalized_score,
                )

            await db.commit()

        except SuggestionsCoverageServiceError:
            # Re-raise our custom exceptions
            raise
        except Exception as e:  # PyLint: disable=broad-except
            logger.exception(
                "Failed to save coverage score for submission=%s, question=%s",
                submission_id,
                question_id,
            )
            await db.rollback()
            handle_service_exception(
                e, SuggestionsCoverageServiceError, "saving coverage score"
            )
