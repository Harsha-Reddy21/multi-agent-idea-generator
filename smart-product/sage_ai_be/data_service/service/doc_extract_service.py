"""
Document Extraction Service
============================
Modular service for document extraction, LLM analysis, and form mapping
"""

import asyncio
import logging

from concurrent.futures import ThreadPoolExecutor
from typing import Dict, Any, List, Optional

from data_service.clients.llm_gateway_client import llm_gateway_client
from data_service.clients.cortex_client import cortex_client
from data_service.utils.cache_manager import cache_manager
from data_service.configurations.prompts.document_extract_prompt import (
    DOCUMENT_EXTRACTION_PROMPT,
    DOCUMENT_EXTRACTION_PROMPT_V1,
)
from data_service.constants.extraction_mapping import (
    PREFIX_TO_FORM,
    EXCLUDED_EXTRACTION_FORMS,
    INCLUDED_QUESTION_IDS,
)
from data_service.configurations.settings import settings
from data_service.constants.constants import ProcessingStatus
from data_service.constants.extraction_mapping import PREFIX_TO_FORM
from data_service.exceptions.service_errors import DocumentExtractionServiceError
from data_service.models.form_extractions import FormExtractions
from data_service.models.questions import Questions
from data_service.models.submission_processing_status import SubmissionProcessingStatus
from data_service.utils import error_utils
from data_service.utils.document_extractor import DocumentExtractor
from data_service.models.document_extract import Answer, Block
from data_service.utils.validation import validate_and_get_user, validate_uuid_format
from data_service.utils.form_validators import validate_submission_ownership
from data_service.utils.ai_interaction_utils import create_ai_interaction
from data_service.serializers.ai_feedback import AIFeatureType
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

# Constants for API names in race strategy
API_NAME_LLM_GATEWAY = "llm_gateway"
API_NAME_CORTEX = "cortex"

# Constants for question types
QUESTION_TYPE_TEXT = "Text"
QUESTION_TYPE_LONG_TEXT = "Text (Long Text)"
QUESTION_TYPE_LONG_TEXT_ALT = "Long Text"

# Constants for result keys
RESULT_KEY_SUCCESS = "success"
RESULT_KEY_ERROR = "error"
RESULT_KEY_PARSED_JSON = "parsed_json"
RESULT_KEY_ATTEMPTS = "attempts"

# Default values
DEFAULT_ERROR_MESSAGE = "Unknown error"
DEFAULT_QUESTION_ID = "unknown"


class DocumentExtractionService:
    """Service for extracting and analyzing document content"""

    def __init__(self, model_name: Optional[str] = None) -> None:
        """
        Initialize the document extraction service

        Args:
            model_name: Cortex model name (defaults to settings.document_analysis_model)
        """
        self.cortex = cortex_client
        self.llm_gateway_client = llm_gateway_client
        self.model_name = model_name or settings.document_analysis_model
        self.document_extractor = DocumentExtractor()
        logger.info(
            "DocumentExtractionService initialized with model: %s", self.model_name
        )

    async def fetch_text_questions_from_db(
        self, db: AsyncSession
    ) -> List[Dict[str, str]]:
        """
        Fetch all TEXT-type questions from database

        Args:
            db: Database session

        Returns:
            List of dicts with question_id and question_text
            Example: [
                {"id": "AI-Q1", "question": "What is the title..."},
                {"id": "W-Q3", "question": "Products/Services..."}
            ]
        """
        logger.info("Fetching TEXT-type questions from database...")

        # Query for text-type questions using cache
        questions = await cache_manager.get_text_questions(db)

        # Apply exclusion filters
        questions = self._filter_excluded_questions(questions)

        question_list = [{"id": q.id, "question": q.question} for q in questions]

        logger.info("Found %d TEXT-type questions after filtering", len(question_list))
        return question_list

    def _filter_excluded_questions(self, questions: List[Questions]) -> List[Questions]:
        """
        Filter questions based on inclusion/exclusion rules.

        Supports:
            - Form-level exclusions (via EXCLUDED_EXTRACTION_FORMS)
            - Individual question ID inclusions (via INCLUDED_QUESTION_IDS)

        Logic:
            1. Exclude questions from EXCLUDED_EXTRACTION_FORMS
            2. If INCLUDED_QUESTION_IDS is not empty, only include those questions
            3. If INCLUDED_QUESTION_IDS is empty, include all remaining questions

        This method is modular and can be extended to support:
            - JSON config file loading
            - Database-driven inclusions/exclusions
            - Dynamic rules

        Args:
            questions: List of Question model instances

        Returns:
            Filtered list of Question instances

        Note:
            Early returns empty list if questions is None or empty
        """

        if not questions:
            return []

        # Get prefixes to exclude based on excluded forms
        excluded_prefixes = [
            prefix
            for prefix, form_name in PREFIX_TO_FORM.items()
            if form_name in EXCLUDED_EXTRACTION_FORMS
        ]

        filtered_questions = []
        excluded_by_form = 0
        excluded_by_inclusion = 0

        for question in questions:
            # Check if question belongs to an excluded form
            if excluded_prefixes and any(
                question.id.startswith(f"{prefix}-") for prefix in excluded_prefixes
            ):
                excluded_by_form += 1
                continue

            # If INCLUDED_QUESTION_IDS is specified, only include those questions
            if INCLUDED_QUESTION_IDS:
                if question.id in INCLUDED_QUESTION_IDS:
                    filtered_questions.append(question)
                else:
                    excluded_by_inclusion += 1
            else:
                # If no inclusion list, include all remaining questions
                filtered_questions.append(question)

        # Log filtering details
        if excluded_by_form > 0:
            forms_list = ", ".join(EXCLUDED_EXTRACTION_FORMS)
            logger.info(
                "Excluded %d questions from forms: %s", excluded_by_form, forms_list
            )
        if INCLUDED_QUESTION_IDS:
            ids_list = ", ".join(INCLUDED_QUESTION_IDS)
            logger.info(
                "Included %d questions (from %d total): %s",
                len(filtered_questions),
                len(questions),
                ids_list,
            )
        if excluded_by_inclusion > 0:
            logger.info(
                "Excluded %d questions (not in inclusion list)", excluded_by_inclusion
            )

        return filtered_questions

    def build_combined_content(
        self, questions: List[Dict[str, str]], document_text: str
    ) -> str:
        """
        Build combined content with questions and document in single variable.
        This will be passed as {document_text} to your prompt template.

        Args:
            questions: List of question dicts from database
            document_text: Extracted document content

        Returns:
            Combined markdown-formatted string
        """
        # Build questions section in clean markdown format
        questions_md = "=== FORM QUESTIONS TO ANSWER ===\n\n"
        for q in questions:
            questions_md += f"{q['id']}: {q['question']}\n"

        # Combine with document
        combined = f"{questions_md}\n\n=== DOCUMENT CONTENT ===\n\n{document_text}"

        logger.info(
            "Combined content: %d questions + %d chars document",
            len(questions),
            len(document_text),
        )
        return combined

    def _sync_extract_content(
        self, file_content: bytes, filename: str, content_type: str
    ) -> Dict[str, Any]:
        """
        Synchronous wrapper for document text extraction.

        Delegates to DocumentExtractor for actual extraction logic.
        Executed in thread pool to avoid blocking event loop.

        Args:
            file_content: Raw bytes of the file
            filename: Name of the file
            content_type: MIME type of the file

        Returns:
            Dict containing extraction results with keys: success, text, etc.
        """
        chars_per_page = settings.chars_per_page

        def page_marker_callback(
            text: str, chars_per_page_override: int = 3000
        ) -> tuple[str, int]:
            """Inner callback for adding page markers to text."""
            return DocumentExtractor.add_page_markers_by_chars(
                text, chars_per_page_override or chars_per_page
            )

        return self.document_extractor.extract_content(
            file_content=file_content,
            filename=filename,
            content_type=content_type,
            add_page_markers_callback=page_marker_callback,
        )

    async def extract_single_file_with_content(
        self,
        file_name: str,
        file_content: bytes,
        content_type: str,
        questions: List[Dict[str, str]],
        max_retries: int = 3,
        semaphore: asyncio.Semaphore = None,
        doc_executor: ThreadPoolExecutor = None,
    ) -> Dict[str, Any]:
        """
        Extract answers from file content using dynamic questions

        This method works with pre-loaded file content to enable true parallelization
        without file I/O blocking. Semaphore is applied only to LLM calls.

        Args:
            file_name: Name of the file
            file_content: Pre-loaded file content as bytes
            content_type: MIME type of the file
            questions: Pre-fetched list of questions from database
            max_retries: Maximum retry attempts
            semaphore: Optional semaphore for controlling concurrent LLM calls

        Returns:
            {
                "success": bool,
                "file_name": str,
                "question_answers": dict,
                "validation_passed": bool,
                "validation_errors": list,
                "can_skip_enrichment": bool,
                "attempts": int,
                "error": str (if failed)
            }
        """
        logger.info("Starting extraction for file: %s", file_name)

        try:
            loop = asyncio.get_running_loop()
            extraction_result = await loop.run_in_executor(
                doc_executor,
                self._sync_extract_content,
                file_content,
                file_name,
                content_type,
            )

            if not extraction_result.get("success"):
                error_msg = extraction_result.get(
                    "error", "Text extraction failed: Unknown error"
                )
                logger.error("Text extraction failed for %s: %s", file_name, error_msg)
                return {
                    "success": False,
                    "file_name": file_name,
                    "error": error_msg,
                    "attempts": 0,
                }

            document_text = f"[FILE: {file_name}]\n{extraction_result['text']}"

            # combined_content = self.build_combined_content(questions, document_text)

            questions_str_list = [
                f"{question['id']}: {question['question']}" for question in questions
            ]
            questions_str = "\n".join(questions_str_list)

            final_prompt = DOCUMENT_EXTRACTION_PROMPT.format(
                questions=questions_str,
                document_text=document_text,  # Match the placeholder name
            )

            # if prompt_template:
            #     final_prompt = prompt_template.replace("{document_text}", combined_content)
            # else:
            #     final_prompt = combined_content

            logger.info(
                "Invoking LLM for %s with %d questions", file_name, len(questions)
            )

            if semaphore:
                if settings.use_llm_gateway:
                    async with semaphore:
                        logger.info("Acquired LLM semaphore for %s", file_name)
                        llm_result = await self.llm_gateway_client.ask_model_with_retry_doc_extract(
                            self.model_name, final_prompt, max_retries, True
                        )
                        logger.info("Released LLM semaphore for %s", file_name)
                else:
                    async with semaphore:
                        logger.info("Acquired LLM semaphore for %s", file_name)
                        llm_result = await self.cortex.ask_model_with_retry_doc_extract(
                            self.model_name, final_prompt, max_retries, True
                        )
                        logger.info("Released LLM semaphore for %s", file_name)
            else:
                if settings.use_llm_gateway:
                    llm_result = (
                        await self.llm_gateway_client.ask_model_with_retry_doc_extract(
                            self.model_name, final_prompt, max_retries, True
                        )
                    )
                else:
                    llm_result = await self.cortex.ask_model_with_retry_doc_extract(
                        self.model_name, final_prompt, max_retries, True
                    )

            if not llm_result["success"]:
                error_detail = llm_result.get("error", "Unknown error")
                logger.error(
                    "LLM extraction failed for %s: %s", file_name, error_detail
                )
                return {
                    "success": False,
                    "file_name": file_name,
                    "error": error_detail,
                    "attempts": llm_result.get("attempts", 0),
                }

            logger.info(
                "LLM extraction successful for %s, attempts: %d",
                file_name,
                llm_result["attempts"],
            )

            validation_passed = llm_result.get("validation_passed", True)
            if not validation_passed:
                logger.warning("Schema validation failed for %s", file_name)

            return {
                "success": True,
                "file_name": file_name,
                "question_answers": llm_result["parsed_json"],
                "validation_passed": validation_passed,
                "validation_errors": llm_result.get("validation_errors", []),
                "can_skip_enrichment": llm_result.get("can_skip_enrichment", False),
                "attempts": llm_result["attempts"],
            }

        except DocumentExtractionServiceError:
            # Re-raise DocumentExtractionServiceError as-is
            raise
        except Exception as e:
            logger.exception("Exception during extraction of %s: %s", file_name, str(e))
            error_utils.handle_service_exception(
                e, DocumentExtractionServiceError, f"extracting file {file_name}"
            )

    def group_answers_by_form_prefix(
        self, answers: List[Answer]
    ) -> Dict[str, Dict[str, Any]]:
        """
        Group question answers by form prefix

        Args:
            answers: List of Answer objects from extraction

        Returns:
            Dict grouped by form type with answer details

        Note:
            Form prefix mappings are defined in:
            `data_service.constants.extraction_mapping.PREFIX_TO_FORM`
        """
        form_jsons = {form_name: {} for form_name in PREFIX_TO_FORM.values()}

        for answer in answers:
            question_id = answer.question_id
            # Extract prefix (e.g., "AI" from "AI-Q1")
            prefix = question_id.split("-")[0] if "-" in question_id else None

            if prefix and prefix in PREFIX_TO_FORM:
                form_name = PREFIX_TO_FORM[prefix]
                form_jsons[form_name][question_id] = {
                    "answer_text": answer.answer_text,
                    "provenance": answer.provenance,
                    "confidence": answer.confidence,
                }

        # Log distribution
        for form_name, questions in form_jsons.items():
            if questions:  # Only log non-empty forms
                logger.info("  %s: %d questions", form_name, len(questions))

        return form_jsons

    async def get_question_extraction(
        self,
        submission_id: str,
        form_id: str,
        question_id: str,
        db: AsyncSession,
        x_webauth_email: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Retrieve extraction data for a specific question from a specific form

        This method first checks the processing status to ensure extraction is complete
        before returning the requested data.

        Args:
            submission_id: UUID of the submission
            form_id: UUID of the form (SubmissionForms.id)
            question_id: Question ID (e.g., "S-Q1", "B-Q3", "AI-Q1")
            x_webauth_email: User's email from authentication header
            db: Database session

        Returns:
            Dict containing question's extracted content
            {
                "question_id": "S-Q3",
                "extracted_content": [...],
                "submission_id": "...",
                "form_id": "...",
                "created_at": "...",
                "updated_at": "...",
                "interaction_id": "..."
            }

        Raises:
            DocumentExtractionError: If validation fails, processing incomplete, or extraction not found
        """
        if x_webauth_email:
            # Validate authentication and get user
            user = await validate_and_get_user(
                x_webauth_email, db, DocumentExtractionServiceError
            )
        # Validate question_id
        if not question_id or not question_id.strip():
            raise DocumentExtractionServiceError(
                error="Validation Error",
                message="Question information is missing. Please try again.",
                status_code=400,
            )

        # Validate UUID formats
        submission_uuid = validate_uuid_format(
            submission_id, "submission id", DocumentExtractionServiceError
        )
        form_uuid = validate_uuid_format(
            form_id, "form id", DocumentExtractionServiceError
        )

        if x_webauth_email:
            # Validate submission ownership
            submission = await validate_submission_ownership(
                submission_id=submission_uuid,
                user_id=user.id,
                db=db,
                error_class=DocumentExtractionServiceError,
            )
        else:
            # Validate submission existence only
            submission = await validate_submission_ownership(
                submission_id=submission_uuid,
                user_id=None,
                db=db,
                error_class=DocumentExtractionServiceError,
            )

        # Check processing status first
        status_result = await db.execute(
            select(SubmissionProcessingStatus).where(
                SubmissionProcessingStatus.submission_id == submission_uuid
            )
        )
        processing_status = status_result.scalar_one_or_none()

        # Handle different processing states
        if not processing_status:
            raise DocumentExtractionServiceError(
                error="Not Found",
                message="Unable to retrieve document processing status. Please try again.",
                status_code=404,
            )

        if processing_status.status == ProcessingStatus.PENDING:
            raise DocumentExtractionServiceError(
                error="Processing Pending",
                message="Your documents are being prepared for processing. Please wait a moment.",
                status_code=202,  # 202 Accepted - processing not complete
            )

        if processing_status.status == ProcessingStatus.PROCESSING:
            raise DocumentExtractionServiceError(
                error="Processing In Progress",
                message="Your documents are currently being processed. Please wait a moment.",
                status_code=202,  # 202 Accepted - processing not complete
            )

        if processing_status.status == ProcessingStatus.FAILED:
            raise DocumentExtractionServiceError(
                error="Processing Failed",
                message="Cortex is not responding. Please try again later.",
                status_code=400,
            )

        # Only proceed if status is COMPLETED
        if processing_status.status != ProcessingStatus.COMPLETED:
            raise DocumentExtractionServiceError(
                error="Processing Incomplete",
                message="Document processing is not yet complete. Please wait a moment.",
                status_code=202,
            )

        # Query extraction for this specific submission and form
        result = await db.execute(
            select(FormExtractions).where(
                FormExtractions.submission_id == submission_uuid,
                FormExtractions.form_id == form_uuid,
            )
        )
        extraction = result.scalar_one_or_none()

        if not extraction:
            raise DocumentExtractionServiceError(
                error="Not Found",
                message="No extracted data found for this form. Please check back later or fill out the form manually.",
                status_code=404,
            )

        # Get the extracted_data JSONB
        extracted_data = extraction.extracted_data or {}

        # Check if the question exists in this form's data
        if question_id not in extracted_data:
            raise DocumentExtractionServiceError(
                error="Not Found",
                message="No extracted data found for this question. Please fill it out manually.",
                status_code=404,
            )

        # Persist AI interaction for this document extraction so frontend users can submit feedback
        interaction_id = None
        try:
            ai_generated_content = {
                "question_id": question_id,
                "extracted_content": extracted_data[question_id],
            }

            # create interaction; non-critical — swallow errors and log
            interaction = await create_ai_interaction(
                db=db,
                submission_id=submission_uuid,
                question_id=question_id,
                form_id=form_uuid,
                ai_feature_type=AIFeatureType.DATA_EXTRACT,
                ai_generated_content=ai_generated_content,
                user_input=None,
                is_accepted=False,
                commit=True,
            )
            interaction_id = interaction.id
        except Exception:
            logger.exception("Failed to persist AI interaction for document extraction")

        return {
            "question_id": question_id,
            "extracted_content": extracted_data[question_id],
            "submission_id": str(extraction.submission_id),
            "form_id": str(extraction.form_id),
            "created_at": extraction.created_at.isoformat(),
            "updated_at": extraction.updated_at.isoformat(),
            "interaction_id": interaction_id,
        }

    async def _call_llm_with_race_strategy(
        self,
        prompt: str,
        max_retries: int,
        semaphore: asyncio.Semaphore = None,
    ) -> Dict[str, Any]:
        """
        Call both LLM Gateway and Cortex simultaneously, return first successful response.

        Race condition strategy:
        1. Launch both API calls concurrently
        2. Return the first successful response
        3. Ignore error from the other API if one succeeds
        4. Only raise exception if both APIs fail

        Args:
            prompt: The formatted prompt to send
            max_retries: Maximum retry attempts per API
            semaphore: Optional semaphore for rate limiting

        Returns:
            Dict containing the successful API response

        Raises:
            DocumentExtractionServiceError: If both APIs fail
        """

        async def call_llm_gateway():
            """Wrapper for LLM Gateway call"""
            try:
                if semaphore:
                    async with semaphore:
                        logger.info("[RACE] LLM Gateway: Acquired semaphore")
                        result = await self.llm_gateway_client.ask_model_with_retry_doc_extract(
                            model_name=settings.DOC_EXTRACT_LLM_GATEWAY_MODEL,
                            document_content=prompt,
                            max_retries=max_retries,
                            validate_schema=True,
                        )
                        logger.info("[RACE] LLM Gateway: Released semaphore")
                        return (API_NAME_LLM_GATEWAY, result)
                else:
                    result = (
                        await self.llm_gateway_client.ask_model_with_retry_doc_extract(
                            model_name=settings.DOC_EXTRACT_LLM_GATEWAY_MODEL,
                            document_content=prompt,
                            max_retries=max_retries,
                            validate_schema=True,
                        )
                    )
                    return (API_NAME_LLM_GATEWAY, result)
            except Exception as e:
                logger.warning("[RACE] LLM Gateway failed: %s", str(e))
                return (
                    API_NAME_LLM_GATEWAY,
                    {RESULT_KEY_SUCCESS: False, RESULT_KEY_ERROR: str(e)},
                )

        async def call_cortex():
            """Wrapper for Cortex call"""
            try:
                if semaphore:
                    async with semaphore:
                        logger.info("[RACE] Cortex: Acquired semaphore")
                        result = await self.cortex.ask_model_with_retry_doc_extract(
                            model_name=self.model_name,
                            document_content=prompt,
                            max_retries=max_retries,
                            validate_schema=True,
                        )
                        logger.info("[RACE] Cortex: Released semaphore")
                        return (API_NAME_CORTEX, result)
                else:
                    result = await self.cortex.ask_model_with_retry_doc_extract(
                        model_name=self.model_name,
                        document_content=prompt,
                        max_retries=max_retries,
                        validate_schema=True,
                    )
                    return (API_NAME_CORTEX, result)
            except Exception as e:
                logger.warning("[RACE] Cortex failed: %s", str(e))
                return (
                    API_NAME_CORTEX,
                    {RESULT_KEY_SUCCESS: False, RESULT_KEY_ERROR: str(e)},
                )

        logger.info("[RACE] Starting dual API race: LLM Gateway vs Cortex")

        # Launch both API calls concurrently
        tasks = [
            asyncio.create_task(call_llm_gateway()),
            asyncio.create_task(call_cortex()),
        ]

        # Wait for first successful completion, but track all results
        successful_result = None
        failed_results: List[Dict[str, Any]] = []

        # Use as_completed to process tasks as they finish
        for completed_task in asyncio.as_completed(tasks):
            try:
                result = await completed_task

                if isinstance(result, Exception):
                    error_msg = str(result)
                    logger.error("[RACE] API call raised exception: %s", error_msg)
                    failed_results.append(
                        {RESULT_KEY_SUCCESS: False, RESULT_KEY_ERROR: error_msg}
                    )
                else:
                    api_name, api_result = result
                    if api_result.get(RESULT_KEY_SUCCESS):
                        # First successful result - return immediately
                        logger.info("[RACE] %s succeeded (first to complete)", api_name)
                        successful_result = (api_name, api_result)
                        break
                    else:
                        error_msg = api_result.get(
                            RESULT_KEY_ERROR, DEFAULT_ERROR_MESSAGE
                        )
                        failed_results.append(api_result)
                        logger.warning(
                            "[RACE] %s failed: %s",
                            api_name,
                            error_msg,
                        )
            except Exception as e:
                error_msg = str(e)
                logger.error("[RACE] Exception processing task: %s", error_msg)
                failed_results.append(
                    {RESULT_KEY_SUCCESS: False, RESULT_KEY_ERROR: error_msg}
                )

        # Cancel remaining tasks if we got a successful result
        if successful_result:
            for task in tasks:
                if not task.done():
                    task.cancel()
                    logger.info("[RACE] Cancelled remaining task")

            winner_name, winner_result = successful_result
            logger.info(
                "[RACE] Using result from %s (first successful completion)",
                winner_name,
            )
            return winner_result

        # Both APIs failed - raise exception
        error_details = " | ".join(
            [
                str(r.get(RESULT_KEY_ERROR, DEFAULT_ERROR_MESSAGE))
                for r in failed_results
            ]
        )
        logger.error(
            "[RACE] Both LLM Gateway and Cortex failed. Errors: %s", error_details
        )
        raise DocumentExtractionServiceError(
            error="LLM Service Unavailable",
            message=f"Both LLM Gateway and Cortex failed to process the request. Details: {error_details}",
            status_code=503,
        )

    async def extract_answer_from_blocks(
        self,
        blocks: List[Block],
        question: Dict[str, str],
        max_retries: int = 3,
        semaphore: asyncio.Semaphore = None,
        block_lookup: Dict[int, Block] = None,
    ) -> Answer:
        """
        Extract answer from text blocks for a specific question

        Args:
            blocks: List of text blocks
            question: Question string
            max_retries: Maximum retry attempts
            semaphore: Optional semaphore for controlling concurrent LLM calls
            block_lookup: Optional dictionary mapping span_id to Block for efficient provenance lookup
        Returns:
            Answer object with extracted answer, evidence span IDs, and provenance metadata
        """
        context_parts = []
        for block in blocks:
            context_parts.append(f"[SPAN_{block.span_id}] {block.text}")

        context_text = "\n\n".join(context_parts)

        # Format the single question for the prompt
        question_str = f"{question['id']}: {question['question']}"

        try:
            prompt = DOCUMENT_EXTRACTION_PROMPT_V1.format(
                questions=question_str, document_text=context_text
            )

            # Dual API race strategy: call both APIs simultaneously, use first success
            if settings.use_dual_api_race:
                llm_result = await self._call_llm_with_race_strategy(
                    prompt=prompt,
                    max_retries=max_retries,
                    semaphore=semaphore,
                )
            else:
                # Original single API logic (backward compatibility)
                if semaphore:
                    if settings.use_llm_gateway:
                        async with semaphore:
                            logger.info(
                                "Acquired LLM semaphore for question extraction"
                            )
                            llm_result = await self.llm_gateway_client.ask_model_with_retry_doc_extract(
                                model_name=settings.DOC_EXTRACT_LLM_GATEWAY_MODEL,
                                document_content=prompt,
                                max_retries=max_retries,
                                validate_schema=True,
                            )
                            logger.info(
                                "Released LLM semaphore for question extraction"
                            )
                    else:
                        async with semaphore:
                            logger.info(
                                "Acquired LLM semaphore for question extraction"
                            )
                            llm_result = (
                                await self.cortex.ask_model_with_retry_doc_extract(
                                    self.model_name, prompt, max_retries, True
                                )
                            )
                            logger.info(
                                "Released LLM semaphore for question extraction"
                            )
                else:
                    if settings.use_llm_gateway:
                        llm_result = await self.llm_gateway_client.ask_model_with_retry_doc_extract(
                            model_name=self.model_name,
                            document_content=prompt,
                            max_retries=max_retries,
                            validate_schema=True,
                        )
                    else:
                        llm_result = await self.cortex.ask_model_with_retry_doc_extract(
                            self.model_name, prompt, max_retries, True
                        )

            if not llm_result.get(RESULT_KEY_SUCCESS):
                question_id = question.get("id", DEFAULT_QUESTION_ID)
                error = llm_result.get(RESULT_KEY_ERROR, DEFAULT_ERROR_MESSAGE)
                logger.error(
                    "LLM extraction failed for question %s: %s", question_id, error
                )
                return Answer(
                    question_id=question["id"],
                    answer_text="",
                    span_ids=[],
                    confidence=0.0,
                    provenance=None,
                )

            parsed_response = llm_result.get(RESULT_KEY_PARSED_JSON)

            # Log complete LLM response
            import json

            logger.info(
                "Complete LLM response for question %s: %s",
                question.get("id", DEFAULT_QUESTION_ID),
                json.dumps(parsed_response, indent=2),
            )
            question_id = parsed_response.get("question_id", question["id"])
            answer_text = parsed_response.get("answer", "")
            span_ids = parsed_response.get("span_ids", [])
            confidence = parsed_response.get("confidence", 0.0)

            # Validate that span_ids reference actual blocks
            valid_span_ids = [
                sid for sid in span_ids if any(block.span_id == sid for block in blocks)
            ]

            if len(valid_span_ids) < len(span_ids):
                logger.warning(
                    "Some span_ids from LLM don't match provided blocks "
                    "for question %s: expected %s, valid %s",
                    question_id,
                    span_ids,
                    valid_span_ids,
                )

            if answer_text:
                logger.info(
                    "Extracted answer for %s: %d chars, "
                    "%d span_ids, confidence=%.2f",
                    question["id"],
                    len(answer_text),
                    len(valid_span_ids),
                    confidence,
                )

                # Build provenance list for this answer's span_ids
                provenance = []
                if block_lookup and valid_span_ids:
                    for span_id in valid_span_ids:
                        if block := block_lookup.get(span_id):
                            provenance.append(
                                {
                                    "span_id": span_id,
                                    "file_name": block.file_name,
                                    "page_or_slide": block.page_or_slide,
                                    "block_index": block.block_index,
                                    "text": block.text,
                                    "char_start": block.char_start,
                                    "char_end": block.char_end,
                                    "block_type": block.block_type,
                                }
                            )

                return Answer(
                    question_id=question_id,
                    answer_text=answer_text,
                    span_ids=valid_span_ids,
                    confidence=confidence,
                    provenance=provenance if provenance else None,
                )
            else:
                logger.warning(
                    "No answer found in LLM response for question: %s", question["id"]
                )
                return Answer(
                    question_id=question_id,
                    answer_text="",
                    span_ids=[],
                    confidence=0.0,
                    provenance=None,
                )

        except (ValueError, KeyError, TypeError) as e:
            question_id = question.get("id", DEFAULT_QUESTION_ID)
            logger.exception(
                "Data validation error during extraction for question %s: %s",
                question_id,
                str(e),
            )
            return Answer(
                question_id=question_id,
                answer_text="",
                span_ids=[],
                confidence=0.0,
                provenance=None,
            )
        except DocumentExtractionServiceError:
            # Re-raise service errors
            raise
        except Exception as e:
            question_id = question.get("id", DEFAULT_QUESTION_ID)
            logger.exception(
                "Unexpected error during extraction for question %s: %s",
                question_id,
                str(e),
            )
            return Answer(
                question_id=question_id,
                answer_text="",
                span_ids=[],
                confidence=0.0,
                provenance=None,
            )


# Singleton instance
doc_extraction_service = DocumentExtractionService()
