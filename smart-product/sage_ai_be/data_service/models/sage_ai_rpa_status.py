"""
RPA Status Model - Tracks form submission automation status
"""

import uuid

from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    Text,
    ForeignKey,
    text,
)
from sqlalchemy.dialects.postgresql import UUID
from data_service.constants.constants import TableName
from data_service.models.base import Base


class SageAIRPAStatus(Base):
    """Tracks automation (RPA) processing status for a submission."""

    __tablename__ = TableName.RPA_STATUS.value

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    submission_id = Column(
        UUID(as_uuid=True),
        ForeignKey("sage_ai_submissions.id"),
        nullable=False,
        index=True,
    )
    form_schema_id = Column(
        UUID(as_uuid=True), ForeignKey("sage_ai_form_schemas.id"), nullable=False
    )
    status = Column(
        String(50), nullable=False
    )  # pending, processing, completed, failed
    error_message = Column(Text, nullable=True)
    filled_questions = Column(Integer, default=0)
    total_questions = Column(Integer, default=0)
    started_at = Column(
        DateTime(timezone=True), server_default=text("CURRENT_TIMESTAMP")
    )
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(
        DateTime(timezone=True), server_default=text("CURRENT_TIMESTAMP")
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=text("CURRENT_TIMESTAMP"),
        onupdate=text("CURRENT_TIMESTAMP"),
    )

    def __repr__(self):
        return (
            f"<SageAIRPAStatus(id={self.id}, submission_id={self.submission_id}, "
            f"status={self.status})>"
        )

    def to_dict(self):
        """Convert model instance to dictionary."""
        return {
            "id": str(self.id),
            "submission_id": str(self.submission_id),
            "form_schema_id": str(self.form_schema_id),
            "status": self.status,
            "error_message": self.error_message,
            "filled_questions": self.filled_questions,
            "total_questions": self.total_questions,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": (
                self.completed_at.isoformat() if self.completed_at else None
            ),
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
