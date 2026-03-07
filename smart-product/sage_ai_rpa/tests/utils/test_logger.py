"""Tests for logger utilities"""

import pytest
import logging
import json
import os
from unittest.mock import patch
from utils.logger import JsonFormatter, configure_logging


class TestJsonFormatter:
    """Test JSON formatter functionality"""

    def test_json_formatter_basic(self):
        """Test basic JSON formatting"""
        formatter = JsonFormatter()
        record = logging.LogRecord(
            name="test_logger",
            level=logging.INFO,
            pathname="test.py",
            lineno=10,
            msg="Test message",
            args=(),
            exc_info=None,
        )

        output = formatter.format(record)
        data = json.loads(output)

        assert data["level"] == "INFO"
        assert data["logger"] == "test_logger"
        assert data["message"] == "Test message"
        assert data["module"] == "test"
        assert data["line"] == 10

    def test_json_formatter_with_exception(self):
        """Test JSON formatter with exception info"""
        formatter = JsonFormatter()
        try:
            raise ValueError("Test error")
        except ValueError:
            import sys

            exc_info = sys.exc_info()

        record = logging.LogRecord(
            name="test_logger",
            level=logging.ERROR,
            pathname="test.py",
            lineno=20,
            msg="Error occurred",
            args=(),
            exc_info=exc_info,
        )

        output = formatter.format(record)
        data = json.loads(output)

        assert "exception" in data
        assert "ValueError: Test error" in data["exception"]


class TestConfigureLogging:
    """Test logging configuration"""

    def test_configure_logging_default(self):
        """Test logging configuration with defaults"""
        with patch.dict(os.environ, {}, clear=True):
            configure_logging()

            root_logger = logging.getLogger()
            assert root_logger.level == logging.INFO
            assert len(root_logger.handlers) > 0

    @patch.dict(os.environ, {"LOG_LEVEL": "DEBUG", "LOG_FORMAT": "json"})
    def test_configure_logging_debug_json(self):
        """Test logging configuration with DEBUG level and JSON format"""
        configure_logging()

        root_logger = logging.getLogger()
        assert root_logger.level == logging.DEBUG

        # Check that handler uses JSON formatter
        handler = root_logger.handlers[0]
        assert isinstance(handler.formatter, JsonFormatter)

    @patch.dict(os.environ, {"LOG_LEVEL": "WARNING", "LOG_FORMAT": "text"})
    def test_configure_logging_warning_text(self):
        """Test logging configuration with WARNING level and text format"""
        configure_logging()

        root_logger = logging.getLogger()
        assert root_logger.level == logging.WARNING

        # Check that handler uses text formatter (not JSON)
        handler = root_logger.handlers[0]
        assert not isinstance(handler.formatter, JsonFormatter)
