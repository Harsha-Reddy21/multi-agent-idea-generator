"""
This module contains the SQLAlchemy models for submissions.
"""

import uuid

from sqlalchemy import Column, Text, TIMESTAMP, JSON, ForeignKey, Float, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from data_service.constants.constants import TableName
from data_service.models.base import Base


class Submissions(Base):
    """ORM model representing a user submission and its journey data."""

    __tablename__ = TableName.SUBMISSIONS.value

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(Text, nullable=False)
    description = Column(Text, nullable=False)
    status = Column(Text, nullable=False)
    submission_journey = Column(JSON, nullable=False)
    submitter_id = Column(
        UUID(as_uuid=True), ForeignKey("sage_ai_users.id"), nullable=False
    )
    category_id = Column(
        UUID(as_uuid=True), ForeignKey("sage_ai_categories.id"), nullable=False
    )

    # FAISS similarity score for novelty assessment
    novelty_score = Column(Float, nullable=True)
    created_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))
    updated_at = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP"),
        onupdate=text("CURRENT_TIMESTAMP"),
    )

    ai_interactions = relationship("AIInteractions", back_populates="submission")

    def __repr__(self):
        return f"<Submissions(id={self.id}, title={self.title}, status={self.status})>"

    def to_dict(self):
        """Convert model instance to dictionary."""
        return {
            "id": str(self.id),
            "title": self.title,
            "description": self.description,
            "status": self.status,
            "submission_journey": self.submission_journey,
            "submitter_id": str(self.submitter_id),
            "category_id": str(self.category_id),
            "novelty_score": self.novelty_score,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
