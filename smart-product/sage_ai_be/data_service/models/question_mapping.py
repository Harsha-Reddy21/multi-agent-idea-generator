"""
This module contains the SQLAlchemy model for question mapping.
"""

import uuid

from sqlalchemy import Column, Text, Integer
from sqlalchemy.dialects.postgresql import UUID
from data_service.constants.constants import TableName
from data_service.models.base import Base


class QuestionMapping(Base):
    """
    QuestionMapping model
    """

    __tablename__ = TableName.QUESTION_MAPPING.value

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_question_id = Column(Text, nullable=False)
    target_question_id = Column(Text, nullable=False)
    target_form_type = Column(Text, nullable=False)
    priority = Column(Integer, nullable=False, default=1, server_default="1")

    def __repr__(self):
        return (
            f"<QuestionMapping(id={self.id}, "
            f"source_question_id={self.source_question_id}, "
            f"target_question_id={self.target_question_id})>"
        )

    def to_dict(self):
        """Convert model instance to dictionary."""
        return {
            "id": str(self.id),
            "source_question_id": self.source_question_id,
            "target_question_id": self.target_question_id,
            "target_form_type": self.target_form_type,
            "priority": self.priority,
        }
