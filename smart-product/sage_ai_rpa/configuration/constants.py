"""Module to store constants used across the RPA service."""

from enum import Enum


# ENUMS
class RPAStatus(str, Enum):
    """
    RPA job status types
    Used in sage_ai_rpa_status table
    """

    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class FormType(str, Enum):
    """
    Supported form types for RPA automation
    """

    AI_REGISTRY = "ai-registry-form"
    SECURITY_ARCH = "security-arch-form"
    DLO = "dlo-form"


# DEFAULT VALUES
DEFAULT_FORM_TYPE = FormType.SECURITY_ARCH.value
DEFAULT_BATCH_SIZE = 10
