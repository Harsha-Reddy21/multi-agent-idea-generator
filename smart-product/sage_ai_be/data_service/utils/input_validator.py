"""Input validation utilities"""

import logging
from typing import Optional

logger = logging.getLogger(__name__)


class InputValidator:
    """Validates and sanitizes user inputs"""

    def __init__(self, max_length: int):
        self.max_length = max_length
        self.dangerous_patterns = [
            "```",
            "system:",
            "assistant:",
            "\n\n---\n\n",
            "<|endoftext|>",
            "<|im_end|>",
        ]

    def sanitize_user_text(self, user_text: Optional[str]) -> str:
        """Sanitize user input to prevent prompt injection"""
        if user_text is None:
            return ""

        if not isinstance(user_text, str):
            raise TypeError(
                f"user_text must be string or None, " f"got {type(user_text).__name__}"
            )

        if not user_text:
            return ""

        # Check length
        if len(user_text) > self.max_length * 2:
            logger.warning(
                "User text extremely long (%d chars), truncating to %d",
                len(user_text),
                self.max_length,
            )

        # Truncate
        sanitized = user_text[: self.max_length]

        # Remove dangerous patterns
        for pattern in self.dangerous_patterns:
            sanitized = sanitized.replace(pattern, "")

        return sanitized.strip()

    @staticmethod
    def validate_question_id(question_id: str) -> None:
        """Validate question ID format"""
        if not question_id or not isinstance(question_id, str):
            raise ValueError("question_id must be a non-empty string")

        if not question_id.strip():
            raise ValueError("question_id cannot be whitespace-only")
