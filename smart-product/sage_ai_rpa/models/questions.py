"""
This module contains the SQLAlchemy model for the questions table.
"""

from sqlalchemy import Column, Text
from sqlalchemy.orm import relationship

from models.base import Base


class Questions(Base):
    """Questions model representing individual question metadata."""

    __tablename__ = "sage_ai_questions"

    id = Column(Text, primary_key=True)
    question = Column(Text, nullable=False)
    question_type = Column(Text, nullable=False)
    prompt = Column(Text, nullable=False)

    # Relationships
    ai_interactions = relationship("AIInteractions", back_populates="question")
