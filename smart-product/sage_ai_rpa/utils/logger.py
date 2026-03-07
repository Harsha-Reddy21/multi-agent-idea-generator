"""
Logger Configuration Module
===========================
Provides structured JSON logging for the RPA application
"""

import logging
import json
import sys
import os


class JsonFormatter(logging.Formatter):
    """
    Custom JSON formatter for structured logging
    """

    def format(self, record):
        log_data = {
            "timestamp": self.formatTime(record, self.datefmt),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }

        # Add exception info if present
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)

        # Add extra fields from record
        if hasattr(record, "extra_fields"):
            log_data.update(record.extra_fields)

        return json.dumps(log_data)


def configure_logging():
    """
    Configure logging for the application with JSON formatting

    Reads LOG_LEVEL from environment (default: INFO)
    Reads LOG_FORMAT from environment: 'json' or 'text' (default: json)
    """
    log_level = os.getenv("LOG_LEVEL", "INFO").upper()
    log_format = os.getenv("LOG_FORMAT", "json").lower()

    # Get root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)

    # Remove existing handlers
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)

    # Create console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(log_level)

    # Set formatter based on configuration
    if log_format == "json":
        formatter = JsonFormatter()
    else:
        # Text format for local development
        formatter = logging.Formatter(
            fmt="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )

    console_handler.setFormatter(formatter)
    root_logger.addHandler(console_handler)

    # Log startup message
    logging.info(
        "Logging configured - Level: %s, Format: %s",
        log_level,
        log_format,
        extra={"extra_fields": {"service": "sage-ai-rpa"}},
    )
