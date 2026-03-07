"""
Models package for sage_ai_rpa.
Import all models to ensure they're registered with SQLAlchemy.
"""

# Import all models to register them with SQLAlchemy Base
from .base import Base
from .submission_forms import SubmissionForms
from .sage_ai_rpa_status import SageAIRPAStatus
from .submissions import Submissions
from .form_schemas import FormSchemas
from .users import Users
from .categories import Categories
from .questions import Questions
from .ai_interactions import AIInteractions
from .ai_feedback import AIFeedback

__all__ = [
    "Base",
    "SubmissionForms",
    "SageAIRPAStatus",
    "Submissions",
    "FormSchemas",
    "Users",
    "Categories",
    "Questions",
    "AIInteractions",
    "AIFeedback",
]
