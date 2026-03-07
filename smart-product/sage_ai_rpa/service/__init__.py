"""
Service layer for RPA operations
"""

from .form_automation_service import FormAutomationService
from .email_service import EmailService
from .question_comparison_service import QuestionComparisonService

__all__ = [
    "FormAutomationService",
    "EmailService",
    "QuestionComparisonService",
]
