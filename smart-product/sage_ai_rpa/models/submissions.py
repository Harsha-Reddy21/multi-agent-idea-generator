"""
This module contains the SQLAlchemy models for submissions.
"""

import uuid

from sqlalchemy import Column, Text, TIMESTAMP, JSON, ForeignKey, Float, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from models.base import Base


class Submissions(Base):
    """ORM model representing a user submission and its journey data."""

    __tablename__ = "sage_ai_submissions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(Text, nullable=False)
    description = Column(Text, nullable=False)
    status = Column(Text, nullable=False)
    submission_journey = Column(JSON, nullable=False)
    submitter_id = Column(UUID(as_uuid=True), ForeignKey("sage_ai_users.id"), nullable=False)
    category_id = Column(UUID(as_uuid=True), ForeignKey("sage_ai_categories.id"), nullable=False)

    # FAISS similarity score for novelty assessment
    novelty_score = Column(Float, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    ai_interactions = relationship("AIInteractions", back_populates="submission")
