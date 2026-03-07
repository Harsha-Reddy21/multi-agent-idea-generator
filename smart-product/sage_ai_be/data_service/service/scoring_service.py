"""
Scoring Service Module.

Provides scoring functionality for form submissions based on question weights,
mandatory requirements, and AI-generated suggestion coverage analysis.

This module implements:
- Weighted scoring algorithms with configurable policies
- Mandatory question validation with penalties
- LLM-based suggestion coverage analysis
- Async batch processing with timeout handling and concurrency control

Example:
    >>> from data_service.service.scoring_service import scoring_service
    >>> request = ScoreRequest(
    ...     submission_id="sub_123",
    ...     form_type="work_form",
    ...     form_data=[...]
    ... )
    >>> response = await scoring_service(request, db)
    >>> print(response.total_score)
    0.85
"""

import asyncio
import json
import logging
import re
from enum import Enum
from typing import Any, Dict, List, Optional, TypedDict
from uuid import UUID

from sqlalchemy.exc import OperationalError, SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from data_service.clients.cortex_client import CortexClient
from data_service.utils.cache_manager import cache_manager
from data_service.configurations.scoring_prompt import SCORING_PROMPT
from data_service.configurations.settings import Settings, get_settings
from data_service.constants.constants import CORTEX_MODEL, SCORING_MODEL
from data_service.models.question_scoring_config import QuestionScoringConfig
from data_service.models.suggestion_coverage_score import SuggestionCoverageScore
from data_service.models.suggestions import Suggestions
from data_service.serializers.score import ScoreRequest, ScoreResponse
from data_service.exceptions.service_errors import (
    ScoringServiceError,
    ConfigurationError,
    AnalysisError,
    ScoringValidationError,
)
from data_service.utils.error_utils import handle_service_exception
from data_service.clients.llm_gateway_client import LLMGatewayClient

logger = logging.getLogger(__name__)


class ScoringService:
    """Service for managing scoring operations."""

    def __init__(
        self,
        db: AsyncSession,
        cortex_client: Optional[CortexClient] = None,
        llm_gateway_client: Optional[LLMGatewayClient] = None,
        settings: Optional[Settings] = None,
    ):
        """
        Initialize ScoringService.

        Args:
            db: Database session
            cortex_client: Optional CortexClient instance
            llm_gateway_client: Optional LLMGatewayClient instance
            settings: Optional Settings instance
        """
        self.db = db
        self.cortex_client = (
            cortex_client if cortex_client is not None else CortexClient()
        )
        self.llm_gateway_client = (
            llm_gateway_client if llm_gateway_client is not None else LLMGatewayClient()
        )
        self.settings = settings if settings is not None else get_settings()
        logger.debug("ScoringService initialized")

    async def calculate_score(self, request: ScoreRequest) -> ScoreResponse:
        """
        Calculate and persist approval score for a submission.

        Args:
            request: Score request containing submission data and form information

        Returns:
            ScoreResponse with submission_id and calculated total_score

        Raises:
            ScoringValidationError: If input validation fails
            ConfigurationError: If scoring config or suggestions are missing
            ScoringServiceError: For database errors or timeouts
        """
        return await scoring_service(
            request=request,
            db=self.db,
            cortex_client=self.cortex_client,
            llm_gateway_client=self.llm_gateway_client,
            settings=self.settings,
        )


class MissingPolicy(str, Enum):
    """
    Policy for handling missing questions in scoring calculations

    IGNORE_AND_RENORM: Ignore missing questions and renormalize weights
                       across remaining questions
    ZERO_SCORE: Assign zero score to missing questions (stricter policy)
    """

    IGNORE_AND_RENORM = "ignore_and_renorm"
    ZERO_SCORE = "zero_score"


class SuggestionAnalysis(TypedDict):
    """Structure for suggestion analysis response"""

    score: float
    suggestions_analysis: List[Dict[str, Any]]
    error: Optional[Dict[str, str]]


class AnalysisErrorType(Enum):
    """
    Error types for suggestion analysis failures

    API_ERROR: External API call failed
    PARSING_ERROR: Failed to parse LLM response
    TIMEOUT: Operation exceeded time limit
    INVALID_INPUT: Input validation failed
    """

    API_ERROR = "api_error"
    PARSING_ERROR = "parsing_error"
    TIMEOUT = "timeout"
    INVALID_INPUT = "invalid_input"


class AnalysisResult:
    def __init__(
        self,
        score: float = 0.0,
        suggestions_analysis: List[Dict] = None,
        error: Optional[AnalysisErrorType] = None,
        error_message: Optional[str] = None,
    ):
        self.score = score
        self.suggestions_analysis = suggestions_analysis or []
        self.error = error
        self.error_message = error_message

    def to_dict(self) -> Dict[str, Any]:
        result = {
            "score": self.score,
            "suggestions_analysis": self.suggestions_analysis,
        }
        if self.error:
            result["error"] = {"type": self.error.value, "message": self.error_message}
        return result


# Custom exception classes (ConfigurationError, AnalysisError, ScoringValidationError)
# are defined in data_service.exceptions.service_errors and imported above


def aggregate_approval(
    confidences: Dict[str, float],
    weights: Dict[str, float],
    mandatory: set,
    missing_policy: MissingPolicy = MissingPolicy.IGNORE_AND_RENORM,
    settings: Optional[Settings] = None,
) -> float:
    """
    Calculate weighted approval score with mandatory question penalties

    Algorithm:
    1. Normalize confidences (0-1 range)
    2. Normalize weights (sum to 1.0)
    3. Calculate base weighted score
    4. Apply penalties for mandatory questions below threshold

    Args:
        confidences: Question ID to confidence score mapping (0-1)
        weights: Question ID to weight mapping (unnormalized)
        mandatory: Set of question IDs that are mandatory
        missing_policy: How to handle missing questions
        settings: Optional Settings instance for configuration values.
                 If None, fetches default settings via get_settings()

    Returns:
        float: Final approval score (0-1 range)

    Raises:
        ScoringValidationError: If input validation fails (invalid types or no valid questions)
    """
    # Get configuration from settings or use defaults
    if settings is None:
        settings = get_settings()

    # Input validation
    if not isinstance(confidences, dict):
        logger.error("confidences must be a dict, got %s", type(confidences).__name__)
        raise ScoringValidationError(
            f"confidences must be a dict, got {type(confidences).__name__}"
        )

    if not isinstance(weights, dict):
        logger.error("weights must be a dict, got %s", type(weights).__name__)
        raise ScoringValidationError(
            f"weights must be a dict, got {type(weights).__name__}"
        )

    if not isinstance(mandatory, set):
        logger.error("mandatory must be a set, got %s", type(mandatory).__name__)
        raise ScoringValidationError(
            f"mandatory must be a set, got {type(mandatory).__name__}"
        )

    # Load configuration constants from settings
    STATIC_PENALTY = settings.scoring_static_penalty
    MANDATORY_THRESHOLD = settings.mandatory_threshold
    DEFAULT_MANDATORY_CONFIDENCE = settings.scoring_default_mandatory_confidence

    normalized_confidences = {}
    normalized_weights = {}
    total_weight = 0.0
    included_questions = []
    # Get all unique question IDs from all sources
    all_question_ids = set(weights.keys()) | set(confidences.keys()) | mandatory

    # Combined normalization and weight calculation
    # Process each question to normalize confidence and calculate weight
    for question_id in all_question_ids:
        # Step 1: Confidence normalization
        # Get raw confidence score from input
        raw_confidence = confidences.get(question_id)

        # Handle missing confidence scores
        if raw_confidence is None:
            # For mandatory questions, use default confidence value
            if question_id in mandatory:
                confidence = DEFAULT_MANDATORY_CONFIDENCE
            else:
                # For non-mandatory, mark as None for policy handling
                confidence = None
        else:
            # Clamp confidence to valid range [0.0, 1.0]
            confidence = min(1.0, max(0.0, raw_confidence))

        # Apply missing policy for questions with no confidence score
        if confidence is None and missing_policy == MissingPolicy.IGNORE_AND_RENORM:
            continue

        # Store normalized confidence (0.0 for missing if ZERO_SCORE policy)
        normalized_confidences[question_id] = (
            confidence if confidence is not None else 0.0
        )

        # Step 2: Weight processing
        # Get weight and ensure it's non-negative
        question_weight = max(0.0, weights.get(question_id, 0.0) or 0.0)

        # Only include questions with positive weight in scoring
        if question_weight > 0:
            included_questions.append(question_id)
            total_weight += question_weight

    # Step 3: Weight normalization
    # Ensure we have valid questions to score
    if not included_questions or total_weight == 0:
        logger.error("No valid questions to score or total weight is zero")
        raise ScoringValidationError(
            "No valid questions to score or total weight is zero"
        )

    # Normalize weights to sum to 1.0 for proper weighted averaging
    for qid in included_questions:
        normalized_weights[qid] = (weights.get(qid, 0.0) or 0.0) / total_weight

    # Step 4: Calculate base weighted score
    # Sum of (normalized_weight * normalized_confidence) for all included questions
    base_score = sum(
        normalized_weights[qid] * normalized_confidences[qid]
        for qid in included_questions
    )

    # Step 5: Apply mandatory question penalties
    # Initialize penalty multiplier (1.0 = no penalty)
    penalty_multiplier = 1.0

    # Check each mandatory question against threshold
    for qid in mandatory:
        # If mandatory question score is below threshold, apply penalty
        if (
            normalized_confidences.get(qid, DEFAULT_MANDATORY_CONFIDENCE)
            < MANDATORY_THRESHOLD
        ):
            # Compound penalty: each failing mandatory question reduces score
            penalty_multiplier *= 1.0 - STATIC_PENALTY

    # Return final score: base score reduced by penalty multiplier
    return base_score * penalty_multiplier


async def _fetch_scoring_configuration(
    db: AsyncSession,
    request: ScoreRequest,
) -> tuple[list, dict[str, Any]]:
    """
    Fetch scoring configuration and suggestions from database.

    Args:
        db: Async database session
        request: Score request containing form information

    Returns:
        tuple[list, dict[str, Any]]: Tuple of (config_rows, suggestion_lookup)

    Raises:
        ConfigurationError: If no config or suggestions found
        ScoringServiceError: For database errors
    """
    try:
        # Use cache manager for scoring configuration
        # Note: We need to get all configs since there's no form_type filter
        # If form_type filtering is needed, consider adding it to cache_manager
        config_query = select(
            QuestionScoringConfig.question_id,
            QuestionScoringConfig.weight,
            QuestionScoringConfig.is_mandatory,
            QuestionScoringConfig.mandatory_threshold,
        )
        config_result = await db.execute(config_query)
        config_rows = config_result.all()

        logger.info("Found %d scoring configs", len(config_rows))

        if not config_rows:
            logger.error("No scoring configuration found in database")
            raise ConfigurationError("No scoring configuration found")

        # Use cache manager for suggestions by form type
        logger.info("Querying suggestions for form_type: %s", request.form_type)

        suggestions_rows = await cache_manager.get_suggestions_by_form_type(
            request.form_type, db
        )

        if not suggestions_rows:
            logger.error(
                "No suggestions found for form_type: %s",
                request.form_type,
            )
            raise ConfigurationError(
                f"No suggestions found for form_type: {request.form_type}"
            )

        logger.info(
            "Found %d suggestions for form_type: %s",
            len(suggestions_rows),
            request.form_type,
        )

        suggestion_lookup = {}
        for s in suggestions_rows:
            logger.info("Processing suggestion - question_id: %s", s.question_id)
            suggestion_lookup[s.question_id] = s

        logger.info("Built suggestion lookup with %d entries", len(suggestion_lookup))

        return config_rows, suggestion_lookup

    except OperationalError as e:
        logger.error(
            "Database connection error for submission %s: %s",
            request.submission_id,
            str(e),
            exc_info=True,
        )
        await db.rollback()
        handle_service_exception(
            e, ScoringServiceError, "fetching scoring configuration"
        )
    except SQLAlchemyError as e:
        logger.error(
            "Database error fetching scoring config for submission %s: %s",
            request.submission_id,
            str(e),
            exc_info=True,
        )
        await db.rollback()
        handle_service_exception(
            e, ScoringServiceError, "fetching scoring configuration"
        )


async def _load_existing_coverage_scores(
    db: AsyncSession,
    submission_id: UUID,
    questions_to_analyze: set,  # Add this parameter
) -> Dict[str, float]:
    """
    Load existing coverage scores for a submission, filtered by questions to analyze.

    Args:
        db: Async database session
        submission_id: ID of the submission
        questions_to_analyze: Set of question IDs that should be analyzed

    Returns:
        Dict[str, float]: Dictionary mapping question_id to coverage_score (only for questions in questions_to_analyze)
    """
    coverage_query = select(SuggestionCoverageScore).where(
        SuggestionCoverageScore.submission_id == submission_id,
        SuggestionCoverageScore.question_id.in_(questions_to_analyze),  # Filter here
    )
    coverage_result = await db.execute(coverage_query)
    existing_scores = coverage_result.scalars().all()

    confidence_scores = {}
    for score_record in existing_scores:
        confidence_scores[score_record.question_id] = score_record.coverage_score

    if confidence_scores:
        logger.info(
            "Found %d existing coverage scores for submission %s (filtered to %d questions to analyze)",
            len(confidence_scores),
            submission_id,
            len(questions_to_analyze),
        )

    return confidence_scores


def _build_weights_and_mandatory(
    config_rows: list,
    settings: Settings,
    submission_id: UUID,
) -> tuple[Dict[str, float], Dict[str, float]]:
    """
    Build weights and mandatory question mappings from config.

    Args:
        config_rows: Database config rows
        settings: Application settings
        submission_id: Submission ID for logging

    Returns:
        tuple[Dict[str, float], Dict[str, float]]: Tuple of (weights_dict, mandatory_dict)

    Raises:
        ConfigurationError: If weight is invalid
    """
    weights = {}
    mandatory = {}

    for question_id, weight, is_mandatory, _ in config_rows:
        if weight is None:
            logger.warning(
                "Question %s has None weight for submission %s, defaulting to %s",
                question_id,
                submission_id,
                settings.scoring_default_weight,
            )
            weight = settings.scoring_default_weight
        elif not isinstance(weight, (int, float)) or weight < 0:
            logger.error(
                "Invalid weight for question %s: %s (type: %s)",
                question_id,
                weight,
                type(weight).__name__,
            )
            raise ConfigurationError(
                f"Invalid weight for question {question_id}: {weight}. "
                f"Expected positive number, got {type(weight).__name__}"
            )

        weights[question_id] = weight

        if is_mandatory:
            mandatory[question_id] = settings.mandatory_threshold

    return weights, mandatory


def _determine_questions_to_analyze(
    mandatory: Dict[str, float],
    form_data: list,
) -> set:
    """
    Determine which questions should be analyzed based on mandatory status
    and conditional logic.

    Mandatory questions: AI-Q6, AI-Q7, AI-Q12, AI-Q20, AI-Q22, AI-Q23
    Conditional logic:
    - If AI-Q15 is "No": None of AI-Q20, AI-Q22, AI-Q23 exist
    - If AI-Q15 is "Yes":
        - AI-Q20 always exists
        - AI-Q22 always exists
        - AI-Q23 only exists if AI-Q22 is "No" or "Yes - a sampling"

    Args:
        mandatory: Dictionary of mandatory questions
        form_data: List of form entries with question answers

    Returns:
        set: Set of question IDs to analyze
    """
    # Start with all mandatory questions
    questions_to_analyze = set(mandatory.keys())

    # Build a lookup for form answers
    form_answers = {entry.questionId: entry.answer for entry in form_data}

    # Helper function to check answer text
    def check_answer(answer, keywords):
        """Check if answer contains any of the keywords (case-insensitive)"""
        if answer is None:
            return False
        if isinstance(answer, list):
            answer_text = " ".join(str(a) for a in answer).lower()
        else:
            answer_text = str(answer).lower()
        return any(keyword.lower() in answer_text for keyword in keywords)

    # Check AI-Q15 answer
    ai15_answer = form_answers.get("AI-Q15")
    ai15_is_yes = check_answer(ai15_answer, ["yes"])

    if not ai15_is_yes:
        # AI-Q15 is "No" - remove all conditional questions
        conditional_questions = ["AI-Q20", "AI-Q23"]
        for question_id in conditional_questions:
            if question_id in questions_to_analyze:
                questions_to_analyze.remove(question_id)
                logger.info(
                    "Removed %s from analysis: AI-Q15 is not 'Yes'", question_id
                )
    else:
        ai22_answer = form_answers.get("AI-Q22")
        ai22_triggers_ai23 = check_answer(ai22_answer, ["no", "yes - a sampling"])

        if "AI-Q23" in questions_to_analyze:
            if not ai22_triggers_ai23:
                questions_to_analyze.remove("AI-Q23")
                logger.info(
                    "Removed AI-Q23 from analysis: AI-Q22 is not 'No' or 'Yes - a sampling'"
                )
            else:
                logger.info(
                    "Keeping AI-Q23 in analysis: AI-Q22 is 'No' or 'Yes - a sampling'"
                )

    logger.info("Total questions to analyze: %d", len(questions_to_analyze))
    logger.info("Questions to analyze: %s", sorted(questions_to_analyze))

    return questions_to_analyze


async def _analyze_mandatory_questions(
    questions_to_analyze: set,
    request: ScoreRequest,
    suggestion_lookup: Dict[str, Any],
    cortex_client: CortexClient,
    settings: Settings,
    db: AsyncSession,
    confidence_scores: Dict[str, float],
) -> None:
    """
    Analyze mandatory questions using LLM and persist results.

    Args:
        questions_to_analyze: Set of question IDs to analyze
        request: Score request with form data
        suggestion_lookup: Mapping of question_id to suggestions
        cortex_client: CortexClient instance
        settings: Application settings
        db: Database session
        confidence_scores: Dictionary to update with scores (mutated in place)

    Raises:
        ScoringServiceError: On timeout or database errors
    """
    if not questions_to_analyze:
        return

    num_questions = len(questions_to_analyze)
    logger.info(
        "Analyzing coverage for %d mandatory questions (reprocessing all)",
        num_questions,
    )

    # Create semaphore for concurrency control
    semaphore = asyncio.Semaphore(settings.max_concurrent_llm_calls)

    analysis_tasks = []
    question_ids = []

    for question_id in questions_to_analyze:
        suggestion_entry = suggestion_lookup.get(question_id)
        if suggestion_entry:
            question_ids.append(question_id)

            form_entry = next(
                (e for e in request.form_data if e.questionId == question_id), None
            )

            analysis_tasks.append(
                asyncio.wait_for(
                    _analyze_with_semaphore(
                        semaphore=semaphore,
                        question_text=form_entry.question if form_entry else "",
                        user_text=" ".join(form_entry.answer) if form_entry else "",
                        suggestions=suggestion_lookup.get(question_id).suggestions,
                        cortex_client=cortex_client,
                        settings=settings,
                    ),
                    timeout=settings.scoring_analysis_timeout,
                )
            )
        else:
            confidence_scores[question_id] = settings.scoring_default_confidence
            logger.warning(
                "No suggestions found for question %s, assigning default confidence %s",
                question_id,
                settings.scoring_default_confidence,
            )

    try:
        # Fix N+1 problem: Fetch all existing scores for analyzed questions in one query
        existing_scores_query = select(SuggestionCoverageScore).where(
            SuggestionCoverageScore.submission_id == request.submission_id,
            SuggestionCoverageScore.question_id.in_(question_ids),
        )
        existing_scores_result = await db.execute(existing_scores_query)
        existing_scores_map = {
            score.question_id: score for score in existing_scores_result.scalars().all()
        }

        results = await asyncio.gather(*analysis_tasks, return_exceptions=True)
        for question_id, result in zip(question_ids, results):
            if isinstance(result, Exception):
                logger.error(
                    "Analysis failed for question %s: %s",
                    question_id,
                    result,
                )
                confidence_scores[question_id] = settings.scoring_default_confidence
            elif isinstance(result, dict) and "error" in result:
                logger.warning(
                    "Analysis error for question %s: %s",
                    question_id,
                    result,
                )
                # NOTE: Cannot use result score because LLM returns 0.0 on error
                # This is a known limitation - consider implementing partial scoring
                confidence_scores[question_id] = settings.scoring_default_confidence
            else:
                score = result.get("score", 0.0)
                # Validate score is within valid range [0.0, 1.0]
                if not isinstance(score, (int, float)):
                    logger.error(
                        "Invalid score type for question %s: expected number, got %s",
                        question_id,
                        type(score).__name__,
                    )
                    confidence_scores[question_id] = settings.scoring_default_confidence
                elif score < 0.0 or score > 1.0:
                    logger.warning(
                        "Score out of range for question %s: %s (clamping to [0.0, 1.0])",
                        question_id,
                        score,
                    )
                    confidence_scores[question_id] = max(0.0, min(1.0, score))
                else:

                    confidence_scores[question_id] = score

                # Use pre-fetched lookup to avoid N+1 queries
                existing_score = existing_scores_map.get(question_id)

                # # Use validated score from confidence_scores instead of raw score variable
                validated_score = confidence_scores[question_id]

                if existing_score:
                    # Update existing score
                    # existing_score.coverage_score = score
                    existing_score.coverage_score = validated_score
                    logger.info(
                        "Updated coverage score for question %s : submission %s",
                        question_id,
                        request.submission_id,
                    )
                else:
                    # Create new score
                    new_score = SuggestionCoverageScore(
                        submission_id=request.submission_id,
                        question_id=question_id,
                        # coverage_score=score,
                        coverage_score=validated_score,
                    )
                    db.add(new_score)
                    logger.info(
                        "Saved new coverage score for question %s : submission %s and score %s",
                        question_id,
                        request.submission_id,
                        # score,
                        validated_score,
                    )

        logger.debug(
            "Confidence scores for submission %s: %s",
            request.submission_id,
            confidence_scores,
        )

        await db.commit()

    except asyncio.TimeoutError as e:
        logger.error(
            "Timeout while analyzing suggestions for submission %s after %d seconds",
            request.submission_id,
            settings.scoring_analysis_timeout,
            exc_info=True,
        )
        await db.rollback()
        raise ScoringServiceError(
            error="Gateway Timeout",
            message=(
                f"Timeout while analyzing suggestions. "
                f"Operation exceeded {settings.scoring_analysis_timeout} seconds."
            ),
            status_code=504,
        ) from e


async def _persist_final_score(
    db: AsyncSession,
    submission_id: UUID,
    form_type: str,
    score: float,
) -> None:
    """
    Persist final score to submission_forms table.

    Args:
        db: Database session
        submission_id: ID of submission
        form_type: Type of form being scored
        score: Calculated final score

    Raises:
        ScoringServiceError: On database errors
    """
    try:
        # Import SubmissionForms here to avoid circular imports
        from data_service.models.submission_forms import SubmissionForms

        # Query for the specific submission form by submission_id and form_type
        submission_form_query = select(SubmissionForms).where(
            SubmissionForms.submission_id == submission_id,
            SubmissionForms.form_type == form_type,
        )
        submission_form_result = await db.execute(submission_form_query)
        submission_form = submission_form_result.scalar_one_or_none()

        if submission_form:
            submission_form.final_score = score
            logger.info(
                "Updated final score for submission %s, form_type %s",
                submission_id,
                form_type,
            )
        else:
            logger.warning(
                "Submission form not found for submission %s, form_type %s to update final score",
                submission_id,
                form_type,
            )

        await db.commit()

        logger.info(
            "Final aggregated score for submission %s, form_type %s: %s",
            submission_id,
            form_type,
            score,
        )
    except ValueError as e:
        logger.error(
            "Value error in score aggregation for submission %s: %s",
            submission_id,
            str(e),
            exc_info=True,
        )
        await db.rollback()
        raise ScoringServiceError(
            error="Validation Error",
            message=f"Invalid data for score calculation: {str(e)}",
            status_code=400,
        ) from e
    except SQLAlchemyError as e:
        logger.error(
            "Database error updating final score for submission %s: %s",
            submission_id,
            str(e),
            exc_info=True,
        )
        await db.rollback()
        handle_service_exception(e, ScoringServiceError, "updating final score")
    except Exception as e:
        logger.error(
            "Unexpected error aggregating approval for submission %s: %s",
            submission_id,
            str(e),
            exc_info=True,
        )
        await db.rollback()
        handle_service_exception(e, ScoringServiceError, "calculating final score")


async def scoring_service(
    request: ScoreRequest,
    db: AsyncSession,
    cortex_client: Optional[CortexClient] = None,
    llm_gateway_client: Optional[LLMGatewayClient] = None,
    settings: Optional[Settings] = None,
) -> ScoreResponse:
    """
    Calculate and persist approval score for a submission.

    This function orchestrates the scoring process by:
    1. Validating input data
    2. Fetching scoring configuration from database
    3. Loading existing coverage scores
    4. Building weights and mandatory question mappings
    5. Analyzing mandatory questions using LLM
    6. Calculating weighted approval score
    7. Persisting final score to database

    Args:
        request: Score request containing submission data and form information
        db: Async database session for database operations
        cortex_client: Optional CortexClient instance for dependency injection.
                      If None, creates a new instance with default configuration
        settings: Optional Settings instance for configuration values.
                 If None, fetches default settings via get_settings()

    Returns:
        ScoreResponse with submission_id and calculated total_score

    Raises:
        ScoringValidationError: If input validation fails
        ConfigurationError: If scoring config or suggestions are missing
        ScoringServiceError: For database errors or timeouts

    Example:
        >>> request = ScoreRequest(
        ...     submission_id="123",
        ...     form_type="work_form",
        ...     form_data=[...]
        ... )
        >>> response = await scoring_service(request, db)
        >>> response.total_score
        0.85
    """
    # Initialize settings and cortex client if not provided
    if settings is None:
        settings = get_settings()

    if cortex_client is None:
        cortex_client = CortexClient()

    if llm_gateway_client is None:
        llm_gateway_client = LLMGatewayClient()

    # Input validation with comprehensive type checking
    if not isinstance(request, ScoreRequest):
        error_msg = (
            f"request must be a ScoreRequest instance, got {type(request).__name__}"
        )
        logger.error(error_msg)
        raise ScoringValidationError(error_msg)

    if not request.form_data:
        error_msg = "form_data cannot be empty for submission %s"
        logger.error(error_msg, request.submission_id)
        raise ScoringValidationError(error_msg % request.submission_id)

    if not isinstance(request.form_data, list):
        error_msg = f"form_data must be a list, got {type(request.form_data).__name__}"
        logger.error(error_msg)
        raise ScoringValidationError(error_msg)

    if not request.form_type:
        error_msg = "form_type is required for submission %s"
        logger.error(error_msg, request.submission_id)
        raise ScoringValidationError(error_msg % request.submission_id)

    if not isinstance(request.form_type, str):
        error_msg = (
            f"form_type must be a string, got {type(request.form_type).__name__}"
        )
        logger.error(error_msg)
        raise ScoringValidationError(error_msg)

    # Fetch scoring configuration and suggestions
    config_rows, suggestion_lookup = await _fetch_scoring_configuration(db, request)

    # Build weights and mandatory mappings
    weights, mandatory = _build_weights_and_mandatory(
        config_rows, settings, request.submission_id
    )

    # Determine questions to analyze FIRST
    questions_to_analyze = _determine_questions_to_analyze(mandatory, request.form_data)

    # CHANGED: Load existing coverage scores AFTER determining questions to analyze
    # and pass questions_to_analyze to filter the results
    confidence_scores = await _load_existing_coverage_scores(
        db, request.submission_id, questions_to_analyze
    )

    # Analyze questions
    await _analyze_mandatory_questions(
        questions_to_analyze,
        request,
        suggestion_lookup,
        cortex_client,
        settings,
        db,
        confidence_scores,
    )

    # Calculate final score
    score = aggregate_approval(
        confidences=confidence_scores,
        weights=weights,
        mandatory=questions_to_analyze,
        missing_policy=request.missing_policy or "ignore_and_renorm",
        settings=settings,
    )

    # Persist final score
    await _persist_final_score(db, request.submission_id, request.form_type, score)

    return ScoreResponse(
        submission_id=request.submission_id,
        total_score=score,
    )


async def _analyze_with_semaphore(
    semaphore: asyncio.Semaphore,
    question_text: str,
    user_text: str,
    suggestions: List[str],
    cortex_client: CortexClient,
    settings: Settings,
) -> SuggestionAnalysis:
    """
    Wrapper for analyze_suggestions_coverage with semaphore-based concurrency control.

    Args:
        semaphore: Asyncio semaphore for limiting concurrent operations
        question_text: The original question text
        user_text: User's answer text to analyze
        suggestions: List of suggestion strings to check coverage against
        cortex_client: CortexClient instance for making API calls
        settings: Settings instance for configuration values

    Returns:
        SuggestionAnalysis dict from analyze_suggestions_coverage
    """
    async with semaphore:
        return await analyze_suggestions_coverage(
            question_text=question_text,
            user_text=user_text,
            suggestions=suggestions,
            cortex_client=cortex_client,
            settings=settings,
        )


async def analyze_suggestions_coverage(
    question_text: str,
    user_text: str,
    suggestions: List[str],
    cortex_client: CortexClient,
    llm_gateway_client: Optional[LLMGatewayClient] = None,
    settings: Optional[Settings] = None,
) -> SuggestionAnalysis:
    """
    Analyze user text coverage against question suggestions using Cortex LLM

    This function uses an LLM to determine how well the user's answer addresses
    the suggested content points for a given question. It returns a coverage
    score (0-1) and detailed analysis of each suggestion.

    Args:
        question_text: The original question text
        user_text: User's answer text to analyze
        suggestions: List of suggestion strings to check coverage against
        cortex_client: CortexClient instance for making API calls
        settings: Optional Settings instance for configuration values.
                 If None, fetches default settings via get_settings()

    Returns:
        SuggestionAnalysis dict containing:
            - score (float): Coverage score 0-1
            - suggestions_analysis (List[Dict]): Per-suggestion analysis

    Raises:
        ScoringValidationError: If input validation fails (invalid types or empty values)
        AnalysisError: If LLM analysis fails after all retry attempts or response parsing fails

    Note:
        This function uses retry logic with max_retries from settings.
        Exceptions are raised on persistent failures to enable proper error handling.

    Example:
        >>> cortex = CortexClient()
        >>> result = await analyze_suggestions_coverage(
        ...     question_text="What is your role?",
        ...     user_text="I am a software engineer",
        ...     suggestions=["Specify job title", "Describe responsibilities"],
        ...     cortex_client=cortex
        ... )
        >>> result["score"]
        0.75
    """
    # Initialize settings if not provided
    if settings is None:
        settings = get_settings()

    # Input validation with detailed error messages
    if not isinstance(question_text, str):
        logger.error(
            "question_text must be a string, got %s", type(question_text).__name__
        )
        raise ScoringValidationError(
            f"question_text must be a string, got {type(question_text).__name__}"
        )

    if not isinstance(user_text, str):
        logger.error("user_text must be a string, got %s", type(user_text).__name__)
        raise ScoringValidationError(
            f"user_text must be a string, got {type(user_text).__name__}"
        )

    if not user_text or not user_text.strip():
        logger.error("Empty or whitespace-only user_text provided")
        raise ScoringValidationError("user_text cannot be empty or whitespace-only")

    if not isinstance(suggestions, list):
        logger.error("suggestions must be a list, got %s", type(suggestions).__name__)
        raise ScoringValidationError(
            f"suggestions must be a list, got {type(suggestions).__name__}"
        )

    if not suggestions:
        logger.error("Empty suggestions list provided")
        raise ScoringValidationError("suggestions list cannot be empty")

    # Validate suggestions list items
    for idx, suggestion in enumerate(suggestions):
        if not isinstance(suggestion, str):
            logger.error(
                "suggestion at index %d must be a string, got %s",
                idx,
                type(suggestion).__name__,
            )
            raise ScoringValidationError(f"suggestion at index {idx} must be a string")

    suggestions_text = "\n".join([f"- {suggestion}" for suggestion in suggestions])

    prompt = SCORING_PROMPT.format(
        question_text=question_text,
        user_text=user_text,
        suggestions_text=suggestions_text,
    )

    max_retries = settings.scoring_llm_max_retries

    for attempt in range(1, max_retries + 1):
        try:
            if settings.use_llm_gateway and llm_gateway_client is not None:
                logger.debug("LLM Gateway enabled - routing request through gateway")
                response = await llm_gateway_client.ask_model(
                    model_name=SCORING_MODEL, prompt=prompt
                )
            else:
                response = await cortex_client.invoke_ask(
                    model_name=CORTEX_MODEL, prompt=prompt
                )

            # Parse response
            if not response:
                logger.warning("Attempt %d: Empty response from LLM", attempt)
                if attempt < max_retries:
                    continue
                else:
                    raise AnalysisError("Empty response from LLM")
            try:
                start_idx = response.find("{")
                end_idx = response.rfind("}") + 1

                if start_idx != -1 and end_idx > start_idx:
                    json_str = response[start_idx:end_idx]
                    parsed_json = json.loads(json_str)

                    # Validate response structure and data types
                    if "suggestions_analysis" in parsed_json and "score" in parsed_json:
                        score_value = parsed_json["score"]
                        if not isinstance(score_value, (int, float)):
                            logger.warning(
                                "Attempt %d: Invalid score type: %s",
                                attempt,
                                type(score_value).__name__,
                            )
                            if attempt < max_retries:
                                continue
                        # Ensure score is within valid range
                        parsed_json["score"] = max(0.0, min(1.0, float(score_value)))
                        return parsed_json
                    else:
                        logger.warning("Attempt %d: No JSON found in response", attempt)
                        if attempt < max_retries:
                            continue

            except (json.JSONDecodeError, ValueError) as e:
                logger.warning(
                    "Attempt %d: Could not parse JSON from response: %s", attempt, e
                )
                if attempt < max_retries:
                    continue
                raise AnalysisError(
                    f"Failed to parse JSON from LLM response: {str(e)}",
                    status_code=500,
                ) from e

            logger.warning(
                "Attempt %d: No valid suggestions_analysis found in response", attempt
            )
            if attempt < max_retries:
                continue
            raise AnalysisError(
                "LLM response missing required 'suggestions_analysis' or 'score' fields",
                status_code=500,
            )

        except AnalysisError:
            # Re-raise AnalysisError as-is
            raise
        except (asyncio.TimeoutError, ConnectionError, OSError) as e:
            logger.warning("Attempt %d: Error calling Cortex API: %s", attempt, str(e))
            if attempt < max_retries:
                continue
            # Use error_utils for final exception handling
            handle_service_exception(
                e, AnalysisError, "analyzing suggestions coverage with LLM"
            )

    logger.error("All %d attempts failed for analyze_suggestions_coverage", max_retries)
    raise AnalysisError(
        f"Failed to analyze suggestions coverage after {max_retries} attempts",
        status_code=503,
    )


def get_scoring_service(
    db: AsyncSession,
    cortex_client: Optional[CortexClient] = None,
    llm_gateway_client: Optional[LLMGatewayClient] = None,
    settings: Optional[Settings] = None,
) -> ScoringService:
    """
    Get or create ScoringService instance.

    Args:
        db: Database session
        cortex_client: Optional CortexClient instance
        llm_gateway_client: Optional LLMGatewayClient instance
        settings: Optional Settings instance

    Returns:
        ScoringService instance
    """
    return ScoringService(
        db=db,
        cortex_client=cortex_client,
        llm_gateway_client=llm_gateway_client,
        settings=settings,
    )
