"""Application-wide constant values and mapping definitions.

Includes:
- Static string constants used across modules
- Extraction and scoring mappings
- Enumerations and simple lookup structures

These constants centralize magic values and improve maintainability.
"""

from .constants import (
    FormStatus,
    FormAction,
    SubmissionStatus,
    ProcessingStatus,
    TableName,
)

__all__ = [
    "FormStatus",
    "FormAction",
    "SubmissionStatus",
    "ProcessingStatus",
    "TableName",
]
