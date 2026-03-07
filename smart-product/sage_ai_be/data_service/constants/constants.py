"""Module to store constants used across the data service."""

from enum import Enum

# SCHEMA CONSTANTS -> Setting default to public for development purposes
SERVICE_SCHEMA = "public"
# SERVICE_SCHEMA = "sage_ai_service"


# SERVICENOW API ENDPOINTS
SERVICE_NOW_STATS_ENDPOINT = "/api/now/stats/x_inell_ai_reg_approved_ai_systems"
SERVICE_NOW_TABLE_ENDPOINT = "/api/now/table/x_inell_ai_reg_approved_ai_systems"

# cortex model
CORTEX_MODEL = "sageai-enhance-model"

SCORING_MODEL = "claude-sonnet-4.5-20250929-v1"

ENHANCE_MODEL = "gpt-5-2025-08-07"


# ENUMS
class FormType(str, Enum):
    """
    Form type values
    Used to identify different form types in the system
    """

    AI_REGISTRY = "ai-registry-form"
    AI_REGISTRY_UPDATE = "ai-registry-update-form"
    WWTP = "wwtp-form"
    DLO = "dlo-form"
    GCO_RISK_REGISTRY = "gco-risk-registry-form"
    SECURITY_ARCH = "security-arch-form"
    IDEA_SUB = "idea-sub-form"
    WWTP_NEW_VENDOR = "wwtp-new-vendor-form"


class TableName(Enum):
    """
    Enum of table names
    """

    USERS = "sage_ai_users"
    CATEGORIES = "sage_ai_categories"
    FORM_SCHEMA = "sage_ai_form_schemas"
    SUBMISSIONS = "sage_ai_submissions"
    SUBMISSION_FORMS = "sage_ai_submission_forms"
    UPLOADED_DOCUMENTS = "sage_ai_uploaded_documents"
    SERVICE_NOW_TICKETS = "sage_ai_service_now_tickets"
    QUESTIONS = "sage_ai_questions"
    QUESTION_MAPPING = "sage_ai_question_mapping"
    FORM_EXTRACTIONS = "sage_ai_form_extractions"
    RPA_STATUS = "sage_ai_rpa_status"
    SUGGESTIONS = "sage_ai_suggestions"
    QUESTION_SCORING_CONFIG = "sage_ai_question_scoring_config"
    FORM_RULES = "sage_ai_form_rules"
    SUBMISSION_PROCESSING_STATUS = "sage_ai_submission_processing_status"
    SUGGESTION_COVERAGE_SCORE = "sage_ai_suggestion_coverage_score"
    AI_INTERACTIONS = "sage_ai_ai_interactions"
    AI_FEEDBACK = "sage_ai_ai_feedback"


class ProcessingStatus(str, Enum):
    """
    Document extraction processing status
    Used in sage_ai_submission_processing_status table
    """

    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class FormStatus(str, Enum):
    """
    Form submission status values
    Used in sage_ai_submission_forms table
    """

    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class SubmissionStatus(str, Enum):
    """
    Submission status values
    Used in sage_ai_submissions table

    Flow: submitted → in_progress (implicit) → completed
    """

    SUBMITTED = "submitted"  # Initial status when submission is created
    # When user is working on forms (not explicitly set)
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"  # All forms completed


class FormAction(str, Enum):
    """
    Valid actions for form submission endpoint
    """

    SAVE = "save"
    SUBMIT = "submit"


class RPAStatus(str, Enum):
    """
    RPA job status types
    Used in sage_ai_rpa_status table
    """

    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class SuggestionCoverageStatus(str, Enum):
    """
    AI-generated suggestion coverage status
    Used in suggestions coverage analysis response from LLM
    """

    COMPLETED = "completed"  # Suggestion is adequately addressed in user's answer
    REQUIRED = "required"  # Suggestion needs more detail in user's answer


# Suggestions Coverage Response Field Keys
# Used for parsing LLM response JSON in suggestions coverage analysis
RESPONSE_KEY_SUGGESTIONS_ANALYSIS = "suggestions_analysis"
RESPONSE_KEY_SCORE = "score"
RESPONSE_KEY_TEXT = "text"
RESPONSE_KEY_RATIONALE = "rationale"
RESPONSE_KEY_STATUS = "status"


class UploadStatus(str, Enum):
    """
    File upload status values
    Used for tracking file upload success/failure
    """

    SUCCESS = "success"  # File uploaded successfully
    FAILED = "failed"  # File upload failed
    UNKNOWN = "unknown"  # Upload status is unknown
    VALIDATION_FAILED = "validation_failed"  # File validation failed


class ItemProcessingStatus(str, Enum):
    """
    Individual item processing status
    Used for tracking status of individual files/questions/items during processing
    """

    COMPLETED = "completed"  # Item processing completed successfully
    FAILED = "failed"  # Item processing failed


# ============================================================================
# SSE PROGRESS TRACKER CONSTANTS
# ============================================================================
# Configuration constants for SSE progress tracking and Redis integration

# Redis Configuration
REDIS_TTL_SECONDS = 7200  # 2 hours - TTL for progress data in Redis
REDIS_SOCKET_TIMEOUT_SECONDS = 5  # Redis connection timeout
REDIS_MAX_CONNECTIONS = 20  # Maximum Redis connections in pool

# Queue Configuration
QUEUE_MAX_SIZE = 500  # Maximum updates queued per subscriber
QUEUE_PUT_TIMEOUT_SECONDS = 1.0  # Timeout for putting items in queue

# Timeout Configuration
SUBSCRIBER_TIMEOUT_SECONDS = 180.0  # 3 minutes for slow LLM operations
KEEPALIVE_INTERVAL_SECONDS = 30.0  # Keepalive interval for SSE connections


# ============================================================================
# PARALLEL EXTRACTION SERVICE CONSTANTS
# ============================================================================
# Configuration constants for parallel document extraction service

# Concurrency Configuration
DEFAULT_MAX_CONCURRENT = 5  # Maximum concurrent LLM calls
DEFAULT_DOC_WORKERS = 4  # CPU-bound document processing workers

# Retry Configuration
DEFAULT_MAX_RETRIES = 3  # Maximum retry attempts per operation

# Retrieval Configuration
# Hybrid retrieval alpha parameter (BM25 vs semantic weight)
DEFAULT_RETRIEVAL_ALPHA = 0.7
DEFAULT_TOP_K_BLOCKS = 10  # Number of blocks to retrieve per question
