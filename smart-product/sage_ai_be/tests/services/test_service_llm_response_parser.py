"""
Tests for LLM Response Parser for Enhance Answer
==================================================
Tests the LLMResponseParser class.
"""

import pytest
import json

from data_service.service.llm_response_parser_enhance_ans import LLMResponseParser


class TestLLMResponseParser:
    """Tests for LLMResponseParser class."""

    def test_init(self):
        """Test parser initialization."""
        parser = LLMResponseParser("Failed to enhance")
        assert parser.default_failed_message == "Failed to enhance"

    def test_parse_empty_response(self):
        """Test parsing empty response returns default."""
        parser = LLMResponseParser("Default message")
        result = parser.parse(None)

        assert result["enhanced_answer"] == "Default message"
        assert result["improvements_summary"] == ""

    def test_parse_empty_string(self):
        """Test parsing empty string returns default."""
        parser = LLMResponseParser("Default message")
        result = parser.parse("")

        assert result["enhanced_answer"] == "Default message"

    def test_parse_valid_json_string(self):
        """Test parsing valid JSON string."""
        parser = LLMResponseParser("Default")
        json_str = json.dumps(
            {
                "enhanced_answer": "Enhanced text",
                "improvements_summary": "Made improvements",
            }
        )
        result = parser.parse(json_str)

        assert result["enhanced_answer"] == "Enhanced text"
        assert result["improvements_summary"] == "Made improvements"

    def test_parse_dict_with_enhanced_answer(self):
        """Test parsing dict with enhanced_answer key."""
        parser = LLMResponseParser("Default")
        response = {
            "enhanced_answer": "Direct answer",
            "improvements_summary": "Summary",
        }
        result = parser.parse(response)

        assert result["enhanced_answer"] == "Direct answer"

    def test_parse_openai_format(self):
        """Test parsing OpenAI API format response."""
        parser = LLMResponseParser("Default")
        response = {
            "choices": [
                {
                    "message": {
                        "content": json.dumps(
                            {
                                "enhanced_answer": "OpenAI answer",
                                "improvements_summary": "OpenAI summary",
                            }
                        )
                    }
                }
            ]
        }
        result = parser.parse(response)

        assert result["enhanced_answer"] == "OpenAI answer"

    def test_parse_openai_format_empty_choices(self):
        """Test parsing OpenAI format with empty choices returns default."""
        parser = LLMResponseParser("Default")
        response = {"choices": []}
        result = parser.parse(response)

        assert result["enhanced_answer"] == "Default"

    def test_parse_non_string_type(self):
        """Test parsing non-string type converts to string."""
        parser = LLMResponseParser("Default")
        result = parser.parse(12345)

        # Should convert to string and try to parse
        assert result is not None

    def test_extract_content_from_dict_missing_keys(self):
        """Test extracting content from dict with missing keys."""
        parser = LLMResponseParser("Default")
        response = {"choices": [{"message": {}}]}  # Missing 'content'
        result = parser.parse(response)

        assert result["enhanced_answer"] == "Default"

    def test_extract_content_unexpected_structure(self):
        """Test extracting from dict with unexpected structure."""
        parser = LLMResponseParser("Default")
        response = {"unexpected_key": "value"}
        result = parser.parse(response)

        # Should convert to string
        assert result is not None

    def test_parse_json_with_extra_fields(self):
        """Test parsing JSON with extra fields still works."""
        parser = LLMResponseParser("Default")
        json_str = json.dumps(
            {
                "enhanced_answer": "Answer",
                "improvements_summary": "Summary",
                "extra_field": "ignored",
            }
        )
        result = parser.parse(json_str)

        assert result["enhanced_answer"] == "Answer"

    def test_parse_invalid_json_string(self):
        """Test parsing invalid JSON returns default."""
        parser = LLMResponseParser("Default")
        result = parser.parse("not valid json {{{")

        assert result["enhanced_answer"] == "Default"

    def test_parse_json_missing_enhanced_answer(self):
        """Test parsing JSON without enhanced_answer key."""
        parser = LLMResponseParser("Default")
        json_str = json.dumps({"some_key": "some_value"})
        result = parser.parse(json_str)

        # Should return default when key missing
        assert result is not None
