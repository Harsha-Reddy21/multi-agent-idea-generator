"""
Custom exceptions for the Sage AI application.
"""

from .base import ServiceError
from .service_errors import (
    DashboardServiceError,
    UserSubmissionsServiceError,
    SuggestionsCoverageServiceError,
    FormDetailsServiceError,
    FormSubmissionServiceError,
    AutoPopulateServiceError,
    UserInfoServiceError,
    DocExtractsServiceError,
    AIFeedbackServiceError,
    SuggestionsServiceError,
    ServiceNowServiceError,
)

__all__ = [
    "ServiceError",
    "DashboardServiceError",
    "UserSubmissionsServiceError",
    "SuggestionsCoverageServiceError",
    "FormDetailsServiceError",
    "FormSubmissionServiceError",
    "AIFeedbackServiceError",
    "AutoPopulateServiceError",
    "UserInfoServiceError",
    "DocExtractsServiceError",
    "SuggestionsServiceError",
    "ServiceNowServiceError",
]
