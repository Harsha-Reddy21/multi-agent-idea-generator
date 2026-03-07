"""
Tests for service-specific exception classes.
"""

import pytest
from data_service.exceptions.service_errors import (
    DashboardServiceError,
    UserSubmissionsServiceError,
    SuggestionsCoverageServiceError,
    FormDetailsServiceError,
    FormSubmissionServiceError,
    SuggestionsServiceError,
    EnhanceAnswerServiceError,
    DocumentExtractionServiceError,
    AIFeedbackServiceError,
    FAISSServiceError,
    ScoringServiceError,
    ConfigurationError,
    AnalysisError,
)
from data_service.exceptions.base import ServiceError


def test_dashboard_service_error():
    """Test DashboardServiceError."""
    error = DashboardServiceError(
        error="DashboardError", message="Dashboard error occurred", status_code=400
    )
    assert isinstance(error, ServiceError)
    assert error.error == "DashboardError"


def test_user_submissions_service_error():
    """Test UserSubmissionsServiceError."""
    error = UserSubmissionsServiceError(
        error="SubmissionError", message="Submission error occurred", status_code=400
    )
    assert isinstance(error, ServiceError)
    assert error.error == "SubmissionError"


def test_suggestions_coverage_service_error():
    """Test SuggestionsCoverageServiceError."""
    error = SuggestionsCoverageServiceError(
        error="CoverageError", message="Coverage error occurred", status_code=400
    )
    assert isinstance(error, ServiceError)
    assert error.error == "CoverageError"


def test_form_details_service_error():
    """Test FormDetailsServiceError."""
    error = FormDetailsServiceError(
        error="FormDetailsError", message="Form details error occurred", status_code=400
    )
    assert isinstance(error, ServiceError)
    assert error.error == "FormDetailsError"


def test_form_submission_service_error():
    """Test FormSubmissionServiceError."""
    error = FormSubmissionServiceError(
        error="SubmitFormError", message="Submit form error occurred", status_code=400
    )
    assert isinstance(error, ServiceError)
    assert error.error == "SubmitFormError"


def test_suggestions_service_error():
    """Test SuggestionsServiceError."""
    error = SuggestionsServiceError(
        error="SuggestionError", message="Suggestion error occurred", status_code=400
    )
    assert isinstance(error, ServiceError)
    assert error.error == "SuggestionError"


def test_enhance_answer_service_error():
    """Test EnhanceAnswerServiceError."""
    error = EnhanceAnswerServiceError(
        error="EnhanceError", message="Enhance error occurred", status_code=400
    )
    assert isinstance(error, ServiceError)
    assert error.error == "EnhanceError"


def test_document_extraction_service_error():
    """Test DocumentExtractionServiceError."""
    error = DocumentExtractionServiceError(
        error="ExtractionError", message="Extraction error occurred", status_code=400
    )
    assert isinstance(error, ServiceError)
    assert error.error == "ExtractionError"


def test_ai_feedback_service_error():
    """Test AIFeedbackServiceError."""
    error = AIFeedbackServiceError(
        error="FeedbackError", message="Feedback error occurred", status_code=400
    )
    assert isinstance(error, ServiceError)
    assert error.error == "FeedbackError"


def test_faiss_service_error():
    """Test FAISSServiceError."""
    error = FAISSServiceError(
        error="FAISSError", message="FAISS error occurred", status_code=400
    )
    assert isinstance(error, ServiceError)
    assert error.error == "FAISSError"


def test_scoring_service_error():
    """Test ScoringServiceError."""
    error = ScoringServiceError(
        error="ScoringError", message="Scoring error occurred", status_code=400
    )
    assert isinstance(error, ServiceError)
    assert error.error == "ScoringError"


def test_configuration_error():
    """Test ConfigurationError."""
    error = ConfigurationError(message="Configuration is invalid")
    assert isinstance(error, ScoringServiceError)
    assert error.error == "Configuration Error"
    assert error.message == "Configuration is invalid"
    assert error.status_code == 500


def test_analysis_error_default_status():
    """Test AnalysisError with default status code."""
    error = AnalysisError(message="Analysis failed")
    assert isinstance(error, ScoringServiceError)
    assert error.status_code == 500


def test_analysis_error_custom_status():
    """Test AnalysisError with custom status code."""
    error = AnalysisError(message="Analysis failed", status_code=503)
    assert isinstance(error, ScoringServiceError)
    assert error.status_code == 503
