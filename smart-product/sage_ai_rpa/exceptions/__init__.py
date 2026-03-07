"""
Custom exceptions for the Sage AI RPA application.
"""

from .base import ServiceError
from .service_errors import FormAutomationServiceError
from .question_extraction_errors import (
    QuestionExtractionError,
    FormLoadError,
    QuestionScraperError,
    ConditionalExplorationError,
    QuestionComparisonError,
    EmailNotificationError,
    ConfigurationError,
)

__all__ = [
    "ServiceError",
    "FormAutomationServiceError",
    "QuestionExtractionError",
    "FormLoadError",
    "QuestionScraperError",
    "ConditionalExplorationError",
    "QuestionComparisonError",
    "EmailNotificationError",
    "ConfigurationError",
]
