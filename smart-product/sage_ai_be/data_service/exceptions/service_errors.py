"""
Service-specific exception classes.
"""

from .base import ServiceError


class DashboardServiceError(ServiceError):
    """
    Exception raised for errors in the dashboard service.

    Used for business logic errors such as:
    - User authentication/authorization failures
    - Submission validation errors
    - Database errors during dashboard data retrieval
    - Unexpected errors in dashboard operations
    """


class UserSubmissionsServiceError(ServiceError):
    """
    Exception raised for errors in the user submissions service.

    Used for business logic errors such as:
    - User authentication/authorization failures
    - Submission ID validation errors
    - Database errors during submission data retrieval
    - Unexpected errors in submission operations
    """


class SuggestionsCoverageServiceError(ServiceError):
    """
    Exception raised for errors in the suggestions coverage service.

    Used for business logic errors such as:
    - Question or suggestions not found
    - Invalid suggestions data format
    - Cortex API failures
    - Database errors during coverage analysis
    - Timeout or network errors with external API
    """


class FormDetailsServiceError(ServiceError):
    """
    Exception raised for errors in the form details service.

    Used for business logic errors such as:
    - User authentication/authorization failures
    - Form or submission validation errors
    - Form not found or access denied
    - Database errors during form data retrieval
    - Unexpected errors in form operations
    """


class FormSubmissionServiceError(ServiceError):
    """
    Exception raised for errors in the form submission service.

    Used for business logic errors such as:
    - User authentication/authorization failures
    - Form or submission validation errors
    - Form status validation (e.g., already completed)
    - Database errors during form submission
    - Unexpected errors in form submission operations
    """


class AutoPopulateServiceError(ServiceError):
    """
    Exception raised for errors in the auto-populate common fields service.

    Used for business logic errors such as:
    - User authentication/authorization failures
    - Form type or submission validation errors
    - Question mapping not found
    - Database errors during data retrieval
    - Unexpected errors in auto-populate operations
    """


class UserInfoServiceError(ServiceError):
    """
    Exception raised for errors in the user information service.

    Used for business logic errors such as:
    - User authentication/authorization failures
    - User creation or update errors
    - Database errors during user operations
    - Unexpected errors in user info retrieval
    """


class DocExtractsServiceError(ServiceError):
    """
    Exception raised for errors in the document extraction service.

    Used for business logic errors such as:
    - User authentication/authorization failures
    - Submission or form validation errors
    - Processing status check failures
    - Extraction data not found
    - Database errors during extraction data retrieval
    - Unexpected errors in document extraction operations
    """


class AIFeedbackServiceError(ServiceError):
    """
    Exception raised for errors in the AI feedback service.

    Used for business logic errors such as:
    - AI interaction not found
    - Invalid feedback data format
    - Database errors during feedback creation
    - Unexpected errors in AI feedback operations
    """


class SuggestionsServiceError(ServiceError):
    """
    Exception raised for errors in the suggestions service.

    Used for business logic errors such as:
    - Form type validation errors
    - Database errors during suggestions retrieval
    - Unexpected errors in suggestions operations
    """


class ServiceNowServiceError(ServiceError):
    """
    Exception raised for errors in the ServiceNow service.

    Used for business logic errors such as:
    - ServiceNow API failures
    - Invalid response from ServiceNow API
    - Network/timeout errors with ServiceNow
    - Data parsing errors from ServiceNow responses
    - Unexpected errors in ServiceNow operations
    """


class ScoringServiceError(ServiceError):
    """
    Exception raised for errors in the scoring service.

    Used for business logic errors such as:
    - Configuration data validation errors
    - Missing scoring configuration or suggestions
    - Database errors during scoring operations
    - LLM analysis failures
    - Timeout errors with external APIs
    - Unexpected errors in scoring operations
    """


class ConfigurationError(ScoringServiceError):
    """Configuration data is invalid or missing."""

    def __init__(self, message: str):
        super().__init__(
            error="Configuration Error",
            message=message,
            status_code=500,
        )


class AnalysisError(ScoringServiceError):
    """LLM analysis failed."""

    def __init__(self, message: str, status_code: int = 500):
        super().__init__(
            error="Analysis Error",
            message=message,
            status_code=status_code,
        )


class ScoringValidationError(ScoringServiceError):
    """Input validation failed in scoring service."""

    def __init__(self, message: str):
        super().__init__(
            error="Validation Error",
            message=message,
            status_code=400,
        )


class EnhanceAnswerServiceError(ServiceError):
    """
    Exception raised for errors in the enhance answer service.

    Used for business logic errors such as:
    - Question not found or invalid
    - Input validation failures
    - Database errors during data retrieval
    - LLM API failures or timeouts
    - Document extraction errors
    - Unexpected errors in enhancement operations
    """


class FAISSServiceError(ServiceError):
    """
    Exception raised for errors in the FAISS service.

    Used for business logic errors such as:
    - Index or metadata file loading failures
    - S3 download errors
    - Invalid search parameters
    - Search execution failures
    - Metadata validation errors
    - Unexpected errors in FAISS operations
    """


class HybridRetrieverServiceError(ServiceError):
    """
    Exception raised for errors in the Hybrid Retriever service.

    Used for business logic errors such as:
    - Invalid input parameters (blocks, alpha, batch_size, query, top_k)
    - Empty or invalid text content in blocks
    - BM25 initialization failures
    - Embedding generation failures
    - Retrieval execution failures
    - Unexpected errors in hybrid retrieval operations
    """


class ParallelExtractionServiceError(ServiceError):
    """
    Exception raised for errors in the Parallel Extraction service.

    Used for business logic errors such as:
    - No questions found in database
    - No text content extracted from files
    - File reading or processing failures
    - Block extraction failures
    - LLM extraction failures
    - Hybrid retriever initialization errors
    - Unexpected errors in parallel extraction operations
    """


class DocumentExtractionServiceError(ServiceError):
    """
    Exception raised for errors in the Document Extraction service.

    Used for business logic errors such as:
    - Invalid submission, form, or question IDs
    - Processing status validation errors (pending, processing, failed)
    - Extraction data not found
    - LLM extraction failures
    - Document content extraction errors
    - Database errors during extraction operations
    - Unexpected errors in document extraction operations
    """


class CortexClientError(ServiceError):
    """
    Exception raised for errors in the Cortex API client.

    Used for client-level errors such as:
    - Authentication/authorization failures with Cortex API
    - Network errors communicating with Cortex
    - Request timeouts
    - Invalid input or response validation errors
    - Unexpected errors during Cortex API operations
    """


class LLMGatewayClientError(ServiceError):
    """
    Exception raised for errors in the LLM Gateway API client.

    Used for client-level errors such as:
    - Authentication/authorization failures with LLM Gateway API
    - Network errors communicating with LLM Gateway
    - Request timeouts
    - Invalid input or response validation errors
    - Unexpected errors during LLM Gateway API operations
    """


class S3ClientError(ServiceError):
    """
    Exception raised for errors in the S3 client.

    Used for client-level errors such as:
    - Authentication/authorization failures with AWS S3
    - File not found (404) errors
    - Access denied (403) errors
    - Network errors communicating with S3
    - Invalid bucket or key names
    - Upload/download failures
    - Unexpected errors during S3 operations
    """
