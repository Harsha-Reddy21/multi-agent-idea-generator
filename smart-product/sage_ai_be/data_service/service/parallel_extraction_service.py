"""
Parallel Document Extraction Service
Orchestrates parallel processing of multiple document files for LLM extraction
"""

import asyncio
import logging
import time
from concurrent.futures import ThreadPoolExecutor
from typing import Any, Dict, List, Optional

from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from data_service.configurations.settings import settings
from data_service.constants.constants import (
    UploadStatus,
    ItemProcessingStatus,
    DEFAULT_MAX_CONCURRENT,
    DEFAULT_DOC_WORKERS,
    DEFAULT_MAX_RETRIES,
    DEFAULT_RETRIEVAL_ALPHA,
    DEFAULT_TOP_K_BLOCKS,
)
from data_service.exceptions.service_errors import ParallelExtractionServiceError
from data_service.service.doc_extract_service import doc_extraction_service
from data_service.models.document_extract import Answer, Block
from data_service.utils import error_utils
from data_service.utils.document_extractor import DocumentExtractor
from data_service.utils.sse_progress_tracker import (
    ProgressStatus,
    sse_progress_tracker,
)
from data_service.service.hybrid_retriever import HybridRetriever
from data_service.utils.embedding_model import get_embedding_model


logger = logging.getLogger(__name__)


class ParallelExtractionService:
    """Service for parallel document extraction across multiple files.

    This service orchestrates parallel processing of document files using:
    - Async I/O for concurrent file operations
    - Thread pools for CPU-bound extraction tasks
    - Semaphores for rate limiting
    - Progress tracking via SSE
    """

    def __init__(self, max_concurrent: int = DEFAULT_MAX_CONCURRENT) -> None:
        """Initialize parallel extraction service.

        Args:
            max_concurrent: Maximum number of concurrent LLM calls
        """
        self.max_concurrent = max_concurrent
        self.semaphore = asyncio.Semaphore(max_concurrent)
        self.document_extractor = DocumentExtractor()
        self.llm_executor = ThreadPoolExecutor(
            max_workers=max_concurrent, thread_name_prefix="llm_extract"
        )
        self.doc_executor = ThreadPoolExecutor(
            max_workers=DEFAULT_DOC_WORKERS, thread_name_prefix="doc_extract_cpu"
        )
        self.block_extraction_semaphore = asyncio.Semaphore(max_concurrent)
        self.doc_service = doc_extraction_service

    async def extract_documents_parallel(
        self,
        files: List[UploadFile],
        file_metadata: Dict[str, Dict[str, Any]],  # Reserved for future use
        db: AsyncSession,
        max_retries: int = DEFAULT_MAX_RETRIES,
        submission_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Extract content from multiple files in parallel using LLM

        Args:
            files: List of uploaded files
            file_metadata: Dict mapping filename to metadata (s3_key, presigned_url, upload_status)
            db: Database session
            max_retries: Maximum retry attempts per file
            submission_id: Submission ID for SSE progress tracking (optional)

        Returns:
            {
                "success": bool,
                "question_answers": dict (merged from all files),
                "form_jsons": dict (grouped by form prefix),
                "validation_passed": bool,
                "validation_errors": list,
                "metadata_enriched": bool,
                "stats": {
                    "total_files": int,
                    "successful_files": int,
                    "failed_files": int,
                    "total_time": float
                },
                "error": str (if failed)
            }
        """
        start_time = time.time()
        total_files = len(files)

        logger.info(
            "Starting parallel extraction for %d files (max %d concurrent LLM calls)",
            total_files,
            self.max_concurrent,
        )

        try:
            # Update SSE progress - fetching questions
            if submission_id:
                await sse_progress_tracker.update_progress(
                    submission_id=submission_id,
                    status=ProgressStatus.FETCHING_QUESTIONS,
                    message="Fetching extraction questions from database",
                )

            # Fetch questions and extract blocks in parallel
            questions_task = self.doc_service.fetch_text_questions_from_db(db)
            blocks_task = self._extract_all_blocks(files, submission_id)

            questions, (blocks, file_stats) = await asyncio.gather(
                questions_task, blocks_task
            )

            if not questions:
                raise ParallelExtractionServiceError(
                    error="Validation Error",
                    message="No text extraction questions found in database.",
                    status_code=400,
                )

            logger.info("Fetched %d questions from database", len(questions))
            logger.info(
                "Block extraction: %d/%d files succeeded, %d failed",
                len(file_stats["successful_files"]),
                file_stats["total_files"],
                len(file_stats["failed_files"]),
            )

            # Update SSE progress - questions fetched
            if submission_id:
                await sse_progress_tracker.update_progress(
                    submission_id=submission_id,
                    status=ProgressStatus.QUESTIONS_FETCHED,
                    message=f"Fetched {len(questions)} extraction questions",
                    metadata={
                        "question_count": len(questions),
                        "total_blocks": len(blocks),
                    },
                )

            # Allow partial success - only fail if no blocks AND all files failed
            if not blocks:
                if len(file_stats["failed_files"]) == file_stats["total_files"]:
                    # All files failed - this is a complete failure
                    error_details = "\n".join(
                        [
                            f"- {f['filename']}: {f['error']}"
                            for f in file_stats["failed_files"][:3]
                        ]
                    )
                    raise ParallelExtractionServiceError(
                        error="Extraction Error",
                        message=f"Failed to extract content from all {file_stats['total_files']} files. Sample errors:\n{error_details}",
                        status_code=400,
                    )
                else:
                    # Some files succeeded but produced no blocks (unlikely edge case)
                    logger.warning(
                        "No blocks extracted despite %d/%d files succeeding",
                        len(file_stats["successful_files"]),
                        file_stats["total_files"],
                    )
                    raise ParallelExtractionServiceError(
                        error="Validation Error",
                        message="Files processed successfully but no text content could be extracted.",
                        status_code=400,
                    )

            retriever = HybridRetriever(
                blocks=blocks,
                embedding_model=get_embedding_model(),
                alpha=DEFAULT_RETRIEVAL_ALPHA,
            )

            # Update SSE progress - processing questions
            if submission_id:
                await sse_progress_tracker.update_progress(
                    submission_id=submission_id,
                    status=ProgressStatus.PROCESSING_QUESTIONS,
                    message=f"Processing {len(questions)} questions with LLM",
                    metadata={
                        "total_questions": len(questions),
                        "total_blocks": len(blocks),
                    },
                )

            # Create block lookup for provenance
            block_lookup = {
                block.span_id: block for block in blocks if hasattr(block, "span_id")
            }

            async def process_questions(
                q: Dict[str, str], question_index: int, total_questions: int
            ) -> Answer:
                try:
                    relevant_blocks = await asyncio.to_thread(
                        retriever.retrieve,
                        query=q["question"],
                        top_k=DEFAULT_TOP_K_BLOCKS,
                    )
                    answer = await self.doc_service.extract_answer_from_blocks(
                        question=q,
                        blocks=relevant_blocks,
                        semaphore=self.semaphore,
                        max_retries=max_retries,
                        block_lookup=block_lookup,
                    )

                    # Update SSE progress - individual question processed
                    if submission_id:
                        await sse_progress_tracker.update_question_progress(
                            submission_id=submission_id,
                            question_id=q.get("id", "unknown"),
                            question_index=question_index,
                            total_questions=total_questions,
                            # Truncate for display
                            message=q["question"],
                            status=ItemProcessingStatus.COMPLETED,
                        )

                    return answer
                except Exception as e:
                    logger.error(
                        "Failed to process question %s: %s",
                        q.get("id", "unknown"),
                        str(e),
                    )
                    # Update SSE progress - question failed
                    if submission_id:
                        await sse_progress_tracker.update_question_progress(
                            submission_id=submission_id,
                            question_id=q.get("id", "unknown"),
                            question_index=question_index,
                            total_questions=total_questions,
                            message=f"Failed: {str(e)[:50]}",
                            status=ItemProcessingStatus.FAILED,
                        )
                    # Return empty answer to allow other questions to succeed
                    return Answer(
                        question_id=q["id"],
                        answer_text="",
                        span_ids=[],
                        confidence=0.0,
                        provenance=None,
                    )

            # Use return_exceptions=True to handle question processing failures gracefully
            answer_results = await asyncio.gather(
                *[
                    process_questions(q, i, len(questions))
                    for i, q in enumerate(questions)
                ],
                return_exceptions=True,
            )

            # Filter out exceptions and count failures
            answers = []
            question_failures = 0
            for idx, result in enumerate(answer_results):
                if isinstance(result, Exception):
                    logger.error(
                        "Question %s failed with exception: %s",
                        questions[idx].get("id", "unknown"),
                        str(result),
                    )
                    question_failures += 1
                    # Create empty answer for failed question
                    answers.append(
                        Answer(
                            question_id=questions[idx]["id"],
                            answer_text="",
                            span_ids=[],
                            confidence=0.0,
                            provenance=None,
                        )
                    )
                else:
                    answers.append(result)

            # Group answers by form type (provenance is now embedded in each Answer object)
            form_jsons = self.doc_service.group_answers_by_form_prefix(answers)

            total_time = time.time() - start_time
            successful_files_count = len(file_stats["successful_files"])
            failed_files_count = len(file_stats["failed_files"])
            successful_questions = len(answers) - question_failures

            logger.info(
                "Parallel extraction completed: %d/%d files succeeded, %d/%d questions succeeded, "
                "grouped into %d forms, completed in %.2fs",
                successful_files_count,
                total_files,
                successful_questions,
                len(questions),
                len(form_jsons),
                total_time,
            )

            # Determine overall success - succeed if ANY content was extracted
            overall_success = len(blocks) > 0 and successful_questions > 0

            return {
                "success": overall_success,
                "question_answers": [ans.to_dict() for ans in answers],
                "form_jsons": form_jsons,
                "validation_passed": True,
                "validation_errors": [],
                "metadata_enriched": True,
                "stats": {
                    "total_files": total_files,
                    "successful_files": successful_files_count,
                    "failed_files": failed_files_count,
                    "failed_file_details": file_stats["failed_files"],
                    "total_blocks_extracted": len(blocks),
                    "total_time": total_time,
                    "total_questions": len(questions),
                    "successful_questions": successful_questions,
                    "failed_questions": question_failures,
                },
            }

        except ParallelExtractionServiceError:
            # Re-raise ParallelExtractionServiceError as-is
            raise
        except (RuntimeError, ValueError, IOError) as e:
            logger.exception("Parallel extraction failed with known error")
            raise ParallelExtractionServiceError(
                error="Internal Server Error",
                message=f"Parallel extraction failed: {str(e)}",
                status_code=500,
            ) from e
        except (AttributeError, TypeError, KeyError) as e:
            logger.exception("Unexpected error in parallel extraction")
            error_utils.handle_service_exception(
                e, ParallelExtractionServiceError, "parallel document extraction"
            )
        except Exception as e:  # pylint: disable=broad-except
            # Final catch-all for any unexpected errors
            logger.exception("Critical unexpected error in parallel extraction")
            error_utils.handle_service_exception(
                e, ParallelExtractionServiceError, "parallel document extraction"
            )

    async def _extract_single_file_with_content(
        self,
        file_name: str,
        file_content: bytes,
        content_type: str,
        questions: List[Dict[str, str]],
        _prompt_template: str,
        max_retries: int,
    ) -> Dict[str, Any]:
        """
        Extract from a single file using pre-loaded content.

        Semaphore control is now handled at LLM invocation level.

        Note: _prompt_template parameter kept for interface compatibility.
        """
        logger.info("Starting parallel extraction for %s", file_name)

        result = await self.doc_service.extract_single_file_with_content(
            file_name=file_name,
            file_content=file_content,
            content_type=content_type,
            questions=questions,
            max_retries=max_retries,
            semaphore=self.semaphore,
            doc_executor=self.doc_executor,
        )
        return result

    async def _apply_fallback_mechanism(
        self,
        failed_results: List[Dict[str, Any]],
        _file_metadata: Dict[str, Dict[str, Any]],
        _questions: List[Dict[str, str]],
        _prompt_template: str,
        _max_retries: int,
    ) -> List[Dict[str, Any]]:
        """Apply fallback mechanism for failed file extractions.

        Args:
            failed_results: List of failed extraction results
            _file_metadata: Metadata for files (reserved for future use)
            _questions: List of questions (reserved for future use)
            _prompt_template: Template for prompts (reserved for future use)
            _max_retries: Maximum retry attempts (reserved for future use)

        Returns:
            List of fallback results (currently empty)

        Note:
            This method is a placeholder for future fallback logic implementation.
            Parameters prefixed with underscore are reserved for future use.
        """
        logger.info(
            "Fallback mechanism invoked for %d failed file(s)", len(failed_results)
        )

        for failed in failed_results:
            logger.warning(
                "File '%s' will be marked as failed. Error: %s",
                failed["file_name"],
                failed.get("error", "Unknown error"),
            )

        # Placeholder for custom fallback logic
        # Future implementation may retry with different parameters,
        # use alternative extraction methods, or apply error recovery strategies

        return []

    async def _extract_all_blocks(
        self, files: List[UploadFile], submission_id: Optional[str] = None
    ) -> tuple[List[Block], Dict[str, Any]]:
        """Extract all text blocks from multiple files in parallel.

        Reads files sequentially first to avoid I/O conflicts,
        then processes in parallel.

        Args:
            files: List of uploaded files
            submission_id: Submission ID for SSE progress tracking (optional)

        Returns:
            Tuple of (blocks, file_stats) where file_stats contains per-file success info
        """
        # Step 1: Read all files SEQUENTIALLY to avoid UploadFile race conditions
        # Sort files by filename to ensure consistent processing order across runs
        sorted_files = sorted(enumerate(files), key=lambda x: x[1].filename)
        logger.info(
            "Reading %d files sequentially (sorted by filename for consistency)...",
            len(files),
        )
        file_contents = []

        for original_idx, file in sorted_files:
            idx = original_idx  # Preserve original index for tracking
            try:
                await file.seek(0)
                content = await file.read()

                file_contents.append(
                    {
                        "idx": idx,
                        "filename": file.filename,
                        "content": content,
                        "extension": file.filename.split(".")[-1].lower(),
                    }
                )
                logger.debug(
                    "Successfully read file %d/%d: %s",
                    idx + 1,
                    len(files),
                    file.filename,
                )
            except (IOError, OSError, ValueError, AttributeError) as e:
                logger.error("Failed to read file %s: %s", file.filename, str(e))
                continue

        logger.info("Successfully read %d/%d files", len(file_contents), len(files))
        # Update SSE progress - extracting blocks
        if submission_id:
            await sse_progress_tracker.update_progress(
                submission_id=submission_id,
                status=ProgressStatus.EXTRACTING_BLOCKS,
                message=f"Extracting text blocks from {len(file_contents)} document(s)",
                metadata={"total_files": len(file_contents)},
            )

        # Capture total_files count BEFORE parallel execution to avoid race conditions
        # This ensures all parallel tasks use the same consistent value
        total_files_count = len(file_contents)

        # Step 2: Extract blocks from all files in PARALLEL
        async def extract_blocks_from_content(file_data: Dict[str, Any]) -> List[Block]:
            """Extract blocks from pre-loaded file content"""
            async with self.block_extraction_semaphore:  # Use dedicated semaphore
                try:
                    idx = file_data["idx"]
                    filename = file_data["filename"]
                    content = file_data["content"]
                    file_ext = file_data["extension"]
                    file_id = f"file_{idx}"

                    blocks = []
                    if file_ext == "pdf":
                        blocks = await self.document_extractor.extract_pdf_blocks(
                            file_id=file_id, file_name=filename, file_bytes=content
                        )
                    elif file_ext in ["docx", "doc"]:
                        blocks = await self.document_extractor.extract_docx_blocks(
                            file_id=file_id, file_name=filename, file_bytes=content
                        )
                    elif file_ext in ["pptx", "ppt"]:
                        blocks = await self.document_extractor.extract_pptx_blocks(
                            file_id=file_id, file_name=filename, file_bytes=content
                        )
                    else:
                        logger.warning(
                            "Unsupported file type for block extraction: %s (file %d)",
                            filename,
                            idx,
                        )
                        return []

                    logger.info("Extracted %d blocks from %s", len(blocks), filename)
                    # Update SSE progress - individual file processed
                    if submission_id:
                        logger.info(
                            "Sending file progress update for %s (file %d/%d, submission: %s)",
                            filename,
                            idx + 1,
                            total_files_count,
                            submission_id,
                        )
                        await sse_progress_tracker.update_file_progress(
                            submission_id=submission_id,
                            file_name=filename,
                            file_index=idx,
                            message=f"Extracted {len(blocks)} blocks from {filename}",
                            total_files=total_files_count,
                            status=ItemProcessingStatus.COMPLETED,
                        )

                    return blocks

                except (IOError, ValueError, RuntimeError) as e:
                    logger.error(
                        "Failed to extract blocks from %s: %s", filename, str(e)
                    )

                    # Update SSE progress - file failed
                    if submission_id:
                        await sse_progress_tracker.update_file_progress(
                            submission_id=submission_id,
                            file_name=filename,
                            file_index=idx,
                            message=f"Failed to extract blocks: {str(e)}",
                            total_files=total_files_count,
                            status=ItemProcessingStatus.FAILED,
                        )

                    return []
                finally:
                    # Free memory after processing
                    if "content" in file_data:
                        del file_data["content"]

        logger.info(
            "Extracting blocks from %d files in parallel...", len(file_contents)
        )
        all_blocks_lists = await asyncio.gather(
            *[extract_blocks_from_content(file_data) for file_data in file_contents],
            return_exceptions=True,
        )

        # Flatten results and handle exceptions, track per-file stats
        extracted_blocks = []
        file_stats = {
            "successful_files": [],
            "failed_files": [],
            "total_files": len(file_contents),
        }

        for idx, result in enumerate(all_blocks_lists):
            filename = file_contents[idx]["filename"]
            if isinstance(result, Exception):
                logger.error(
                    "Failed to extract blocks from file %s: %s",
                    filename,
                    result,
                )
                file_stats["failed_files"].append(
                    {
                        "filename": filename,
                        "error": str(result),
                    }
                )
            elif result:
                extracted_blocks.extend(result)
                file_stats["successful_files"].append(
                    {
                        "filename": filename,
                        "block_count": len(result),
                    }
                )
            else:
                # Empty result means file failed but didn't raise exception
                file_stats["failed_files"].append(
                    {
                        "filename": filename,
                        "error": "No blocks extracted",
                    }
                )

        # Clean up
        del file_contents

        # Reassign globally unique span_id values across all files
        # IMPORTANT: Each file's extraction method (extract_pdf_blocks, extract_docx_blocks, etc.)
        # assigns span_id=len(blocks) locally, resulting in duplicate span_ids across files.
        # We must reassign span_ids globally to ensure uniqueness for:
        # 1. Block lookup dictionary (block_lookup) used for provenance
        # 2. LLM responses that reference specific blocks via span_ids
        # 3. Answer validation that checks span_ids against available blocks

        # Sort by (file_id, original_span_id) first for consistent ordering across runs
        extracted_blocks.sort(
            key=lambda b: (
                (b.file_id, b.span_id) if hasattr(b, "span_id") else (b.file_id, 0)
            )
        )

        # Reassign span_id sequentially to ensure global uniqueness
        for idx, block in enumerate(extracted_blocks):
            block.span_id = idx

        logger.info(
            "Total blocks extracted: %d from %d/%d files (reassigned unique span_ids: 0-%d)",
            len(extracted_blocks),
            len(file_stats["successful_files"]),
            file_stats["total_files"],
            len(extracted_blocks) - 1 if extracted_blocks else 0,
        )

        # Log preview of extracted blocks
        for i, block in enumerate(extracted_blocks[:3]):  # Show first 3 blocks
            preview = block.text[:100] if len(block.text) > 100 else block.text
            logger.info(
                "Block %d preview (span_id=%d, page=%s, type=%s): %s...",
                i,
                block.span_id,
                block.page_or_slide,
                block.block_type,
                preview,
            )
        if len(extracted_blocks) > 10:
            logger.info("... and %d more blocks", len(extracted_blocks) - 10)

        # Update SSE progress - blocks extraction complete
        if submission_id:
            await sse_progress_tracker.update_progress(
                submission_id=submission_id,
                status=ProgressStatus.BLOCKS_EXTRACTED,
                message=f"Extracted {len(extracted_blocks)} text blocks from {len(file_stats['successful_files'])}/{file_stats['total_files']} documents",
                metadata={
                    "total_blocks": len(extracted_blocks),
                    "successful_files": len(file_stats["successful_files"]),
                    "failed_files": len(file_stats["failed_files"]),
                },
            )

        return extracted_blocks, file_stats

    def _merge_extraction_results(
        self, results: List[Dict[str, Any]]
    ) -> Dict[str, List[Dict[str, Any]]]:
        """
        Merge question answers from multiple files

        Each file may have answers for the same questions.
        This method combines all answers for each question ID.
        """
        merged = {}

        for result in results:
            question_answers = result.get("question_answers", {})

            for question_id, answers in question_answers.items():
                if question_id not in merged:
                    merged[question_id] = []

                merged[question_id].extend(answers)

        return merged

    def _enrich_with_mixed_validation(
        self,
        merged_answers: Dict[str, List[Dict]],
        file_metadata: Dict[str, Dict[str, Any]],
        validation_states: Dict[str, bool],
    ) -> tuple[Dict[str, Any], bool]:
        """
        Enrich answers with file metadata

        Handles mixed validation outcomes where some files passed validation
        and some didn't. Only enriches answers from validated files.

        Returns:
            (enriched_answers, metadata_enriched_flag)
        """
        enriched = {}
        any_enriched = False

        for question_id, answers in merged_answers.items():
            enriched_answers = []

            for answer_obj in answers:
                file_name = answer_obj.get("file")

                file_validated = validation_states.get(file_name, False)

                if file_validated and file_name in file_metadata:
                    file_meta = file_metadata[file_name]
                    enriched_answer = {
                        "answer": answer_obj.get("answer"),
                        "file_name": file_name,
                        "page": answer_obj.get("page"),
                        "presigned_url": file_meta.get("presigned_url"),
                        "upload_status": file_meta.get(
                            "upload_status", UploadStatus.UNKNOWN
                        ),
                    }
                    any_enriched = True
                else:
                    enriched_answer = {
                        "answer": answer_obj.get("answer"),
                        "file_name": file_name,
                        "page": answer_obj.get("page"),
                        "presigned_url": None,
                        "upload_status": UploadStatus.VALIDATION_FAILED,
                    }

                enriched_answers.append(enriched_answer)

            enriched[question_id] = enriched_answers

        return enriched, any_enriched

    async def cleanup(self) -> None:
        """Cleanup resources (thread pools, connections).

        Should be called when shutting down the service to properly
        release resources and avoid warnings.
        """
        logger.info("Shutting down ParallelExtractionService...")

        # Shutdown thread pools gracefully
        self.llm_executor.shutdown(wait=True)
        self.doc_executor.shutdown(wait=True)

        logger.info("ParallelExtractionService cleanup completed")


# Singleton instance
parallel_extraction_service = ParallelExtractionService(
    max_concurrent=settings.max_concurrent_llm_calls
)
