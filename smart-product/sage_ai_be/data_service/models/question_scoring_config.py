"""
This module contains the SQLAlchemy model for the question scoring configuration table.
"""

import uuid

from sqlalchemy import Column, Text, Boolean, Float, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from data_service.constants.constants import TableName
from data_service.models.base import Base


class QuestionScoringConfig(Base):
    """
    Question scoring configuration model - stores weights and mandatory settings per question
    """

    __tablename__ = TableName.QUESTION_SCORING_CONFIG.value

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    question_id = Column(
        Text, ForeignKey(f"{TableName.QUESTIONS.value}.id"), nullable=False, unique=True
    )
    weight = Column(Float, nullable=False, default=1.0)
    is_mandatory = Column(Boolean, nullable=False, default=False)
    mandatory_threshold = Column(Float, nullable=True)
    threshold_penalty = Column(Float, nullable=True)

    def __repr__(self):
        return (
            f"<QuestionScoringConfig(id={self.id}, "
            f"question_id={self.question_id}, "
            f"weight={self.weight})>"
        )

    def to_dict(self):
        """Convert model instance to dictionary."""
        return {
            "id": str(self.id),
            "question_id": self.question_id,
            "weight": self.weight,
            "is_mandatory": self.is_mandatory,
            "mandatory_threshold": self.mandatory_threshold,
            "threshold_penalty": self.threshold_penalty,
        }
