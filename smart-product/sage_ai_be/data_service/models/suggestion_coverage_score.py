"""SQLAlchemy model for suggestion coverage scoring.

Tracks per-question coverage scores for a user submission.
"""

from datetime import datetime
import uuid

from sqlalchemy import (
    Column,
    String,
    Float,
    DateTime,
    ForeignKey,
)
from sqlalchemy.dialects.postgresql import UUID

from data_service.models.base import Base
from data_service.constants.constants import TableName


class SuggestionCoverageScore(Base):
    """ORM model storing coverage score for suggestions.

    Attributes:
        id: Primary key UUID.
        submission_id: Related submission UUID.
        question_id: Question identifier.
        coverage_score: Calculated coverage as float.
        created_at: Creation timestamp.
        updated_at: Update timestamp.
    """

    __tablename__ = TableName.SUGGESTION_COVERAGE_SCORE.value

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    submission_id = Column(
        UUID(as_uuid=True),
        ForeignKey(TableName.SUBMISSIONS.value + ".id"),
        nullable=False,
    )
    question_id = Column(
        String, ForeignKey(TableName.QUESTIONS.value + ".id"), nullable=False
    )
    coverage_score = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    def __repr__(self):
        return (
            f"<SuggestionCoverageScore(id={self.id}, "
            f"submission_id={self.submission_id}, "
            f"question_id={self.question_id}, "
            f"coverage_score={self.coverage_score})>"
        )

    def to_dict(self):
        """Convert model instance to dictionary."""
        return {
            "id": str(self.id),
            "submission_id": str(self.submission_id),
            "question_id": self.question_id,
            "coverage_score": self.coverage_score,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
