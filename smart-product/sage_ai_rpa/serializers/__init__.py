"""
Serializers for RPA-related data structures.
"""

from .rpa_schemas import (
    RPAJobRequest,
    RPAJobResponse,
    RPAStatusResponse,
    FormDataItem,
    AutomationResult,
)

__all__ = [
    "RPAJobRequest",
    "RPAJobResponse",
    "RPAStatusResponse",
    "FormDataItem",
    "AutomationResult",
]
