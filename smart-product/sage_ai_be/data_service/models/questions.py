"""
This module contains the SQLAlchemy model for the questions table.
"""

from sqlalchemy import Column, Text
from sqlalchemy.orm import relationship

from data_service.constants.constants import TableName
from data_service.models.base import Base


class Questions(Base):
    """Questions model representing individual question metadata."""

    __tablename__ = TableName.QUESTIONS.value

    id = Column(Text, primary_key=True)
    question = Column(Text, nullable=False)
    question_type = Column(Text, nullable=False)
    prompt = Column(Text, nullable=False)

    # Relationships
    ai_interactions = relationship("AIInteractions", back_populates="question")

    def __repr__(self):
        return f"<Questions(id={self.id}, question_type={self.question_type})>"

    def to_dict(self):
        """Convert model instance to dictionary."""
        return {
            "id": self.id,
            "question": self.question,
            "question_type": self.question_type,
            "prompt": self.prompt,
        }
