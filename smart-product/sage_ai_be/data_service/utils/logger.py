"""
Logger Configuration Module
===========================
Provides structured JSON logging with trace context for the application
"""

import logging
import json
import sys
import os
from opentelemetry import trace


class JsonFormatter(logging.Formatter):
    """
    Custom JSON formatter for structured logging with trace context
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

        # Add trace context (trace_id and span_id) if available
        span = trace.get_current_span()
        if span:
            span_context = span.get_span_context()
            if span_context and span_context.is_valid:
                log_data["trace_id"] = format(span_context.trace_id, "032x")
                log_data["span_id"] = format(span_context.span_id, "016x")

        # Add exception info if present
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)

        # Add extra fields from record
        if hasattr(record, "extra_fields"):
            log_data.update(record.extra_fields)

        return json.dumps(log_data)


def configure_logging():
    """
    Configure structured JSON logging for the application.
    Log level can be set via LOG_LEVEL environment variable.
    Defaults to INFO if not set.
    """
    # Get log level from environment variable, default to INFO
    log_level_str = os.getenv("LOG_LEVEL", "INFO").upper()

    # Map string to logging level
    log_level_map = {
        "DEBUG": logging.DEBUG,
        "INFO": logging.INFO,
        "WARNING": logging.WARNING,
        "ERROR": logging.ERROR,
        "CRITICAL": logging.CRITICAL,
    }

    log_level = log_level_map.get(log_level_str, logging.INFO)

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JsonFormatter())
    logging.basicConfig(level=log_level, handlers=[handler])

    logging.info("Logging configured with level: %s", log_level_str)
