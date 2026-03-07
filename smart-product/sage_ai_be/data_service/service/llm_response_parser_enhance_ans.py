"""LLM response parsing utilities"""

import json
import logging
from typing import Any, Dict

logger = logging.getLogger(__name__)


class LLMResponseParser:
    """Parses and validates LLM responses"""

    def __init__(self, default_failed_message: str):
        self.default_failed_message = default_failed_message

    def parse(self, llm_response: Any) -> Dict[str, Any]:
        """Parse LLM response with comprehensive error handling"""
        default_response = {
            "enhanced_answer": self.default_failed_message,
            "improvements_summary": "",
        }

        if not llm_response:
            logger.warning("LLM response is empty")
            return default_response

        # Extract content from structured response
        content = self._extract_content(llm_response)
        if content is None:
            return default_response

        # Parse JSON content
        return self._parse_json_content(content, default_response)

    def _extract_content(self, llm_response: Any) -> str:
        """Extract text content from various response formats"""
        if isinstance(llm_response, dict):
            return self._extract_from_dict(llm_response)

        if not isinstance(llm_response, str):
            logger.warning(
                f"Converting response type {type(llm_response).__name__} to string"
            )
            return str(llm_response)

        return llm_response

    def _extract_from_dict(self, response_dict: Dict) -> str:
        """Extract content from dict response (OpenAI format)"""
        if "choices" in response_dict and response_dict["choices"]:
            try:
                content = response_dict["choices"][0]["message"]["content"]
                if isinstance(content, str):
                    return content
                logger.warning(
                    "LLM content is not a string (type=%s), converting",
                    type(content).__name__,
                )
                return str(content)
            except (KeyError, IndexError, TypeError) as e:
                logger.error(f"Failed to extract content from API response: {e}")
                return None

        if "enhanced_answer" in response_dict:
            logger.debug("LLM response is already a dict, attempting to use directly")
            return json.dumps(response_dict)

        logger.warning("Dict response has unexpected structure, converting to string")
        return str(response_dict)

    def _parse_json_content(
        self, content: str, default_response: Dict
    ) -> Dict[str, Any]:
        """Parse JSON string content"""
        try:
            enhanced_data = json.loads(content)

            if not isinstance(enhanced_data, dict):
                logger.error(
                    f"Parsed content is not a dict: {type(enhanced_data).__name__}"
                )
                return default_response

            # Validate and normalize
            return self._validate_enhanced_data(enhanced_data, default_response)

        except json.JSONDecodeError as e:
            logger.error(
                "JSON decoding failed at position %d: %s. Response preview: %s",
                e.pos,
                str(e),
                content[:200] if len(content) > 200 else content,
            )
            return default_response
        except Exception as e:
            logger.exception(f"Unexpected parsing error: {e}")
            return default_response

    def _validate_enhanced_data(
        self, data: Dict, default_response: Dict
    ) -> Dict[str, Any]:
        """Validate and normalize enhanced data fields"""
        if "enhanced_answer" not in data:
            logger.warning("Missing 'enhanced_answer' in response")
            data["enhanced_answer"] = default_response["enhanced_answer"]
        elif not isinstance(data["enhanced_answer"], str):
            logger.warning(
                "enhanced_answer is not a string (type=%s), converting",
                type(data["enhanced_answer"]).__name__,
            )
            data["enhanced_answer"] = str(data["enhanced_answer"])

        return data
