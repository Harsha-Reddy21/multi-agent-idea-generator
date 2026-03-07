"""Context builders for enhancement service"""

from typing import Any, Dict, List
from sqlalchemy.ext.asyncio import AsyncSession
from data_service.service.doc_extract_service import DocumentExtractionService
from data_service.utils.cache_manager import cache_manager
import logging

logger = logging.getLogger(__name__)


class QuestionContextBuilder:
    """Builds question and suggestions context"""

    def __init__(self, db: AsyncSession):
        self.db = db
        self.cache_manager = cache_manager

    async def build(self, question_id: str) -> Dict[str, Any]:
        """Fetch question and suggestions using cache manager"""
        # Use cache manager to fetch both question and suggestions
        data = await self.cache_manager.get_question_with_suggestions(
            question_id, self.db
        )

        question_obj = data["question"]
        suggestions = data["suggestions"]

        if not question_obj:
            from data_service.exceptions.service_errors import EnhanceAnswerServiceError

            raise EnhanceAnswerServiceError(
                error="Not Found",
                message=f"Question with ID '{question_id}' not found",
                status_code=404,
            )

        return {
            "question": question_obj.question,
            "suggestions": suggestions if suggestions else [],
        }


class DocumentContextBuilder:
    """Builder for document extraction context."""

    def __init__(
        self, document_service: DocumentExtractionService, default_message: str
    ):
        self.document_service = document_service
        self.default_message = default_message

    async def build(
        self, submission_id: str, form_id: str, question_id: str, db: AsyncSession
    ) -> str:
        """
        Build document context from extraction service.
        """
        logger.info(
            "[ENHANCE_ANSWER] DocumentContextBuilder fetching extracts: submission_id=%s, form_id=%s, question_id=%s",
            submission_id,
            form_id,
            question_id,
        )
        try:
            document_extracted = await self.document_service.get_question_extraction(
                submission_id=submission_id,
                form_id=form_id,
                question_id=question_id,
                db=db,
            )

            logger.info(
                "[ENHANCE_ANSWER] Document extraction result: has_data=%s, type=%s",
                document_extracted is not None,
                type(document_extracted).__name__ if document_extracted else "None",
            )

            if document_extracted and isinstance(document_extracted, dict):
                # The key is "extracted_content", not "document_content"
                content = document_extracted.get(
                    "extracted_content", self.default_message
                )

                logger.info(
                    "[ENHANCE_ANSWER] Extracted content length: %d chars, using_default=%s, available_keys=%s",
                    len(str(content)),
                    content == self.default_message,
                    list(document_extracted.keys()),
                )

                # Handle different content types
                if not isinstance(content, str):
                    logger.info(
                        "[ENHANCE_ANSWER] Document content is type=%s, attempting to convert to string",
                        type(content).__name__,
                    )

                    # If it's a dict, try to extract text or convert to JSON string
                    if isinstance(content, dict):
                        # Log the structure for debugging
                        logger.info(
                            "[ENHANCE_ANSWER] Content dict keys: %s",
                            list(content.keys()) if content else [],
                        )

                        # Try to get 'text' or 'content' field if it exists
                        if "text" in content:
                            content = content["text"]
                        elif "content" in content:
                            content = content["content"]
                        else:
                            # Convert entire dict to formatted JSON string
                            import json

                            content = json.dumps(content, indent=2)
                    elif isinstance(content, list):
                        # If it's a list, join the items
                        content = "\n".join(str(item) for item in content)
                    else:
                        content = str(content)

                    logger.info(
                        "[ENHANCE_ANSWER] Converted content to string, length=%d chars",
                        len(content),
                    )

                return content if isinstance(content, str) else self.default_message

            logger.warning(
                "[ENHANCE_ANSWER] No document extraction found, returning default message"
            )
            return self.default_message

        except Exception as e:
            logger.warning(
                "[ENHANCE_ANSWER] Document extraction failed for question_id=%s, submission_id=%s, form_id=%s: %s, using default message",
                question_id,
                submission_id,
                form_id,
                str(e),
            )
            return self.default_message


class FormDataContextBuilder:
    """Builds form data context"""

    @staticmethod
    def build(form_data: List[Any]) -> str:
        """Format form data entries"""
        if not form_data:
            return ""

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
                logger.warning(f"Failed to format form entry: {e}")
                continue

        return "\n\n".join(formatted_entries)
