"""
Submission Processing Status Model - Tracks document extraction background processing
"""

from sqlalchemy import Column, Text, TIMESTAMP, ForeignKey, Enum as SQLEnum, text
from sqlalchemy.dialects.postgresql import UUID
from data_service.constants.constants import TableName, ProcessingStatus
from data_service.models.base import Base


class SubmissionProcessingStatus(Base):
    """Status row per submission for extraction workflow progress."""

    __tablename__ = TableName.SUBMISSION_PROCESSING_STATUS.value

    submission_id = Column(
        UUID(as_uuid=True),
        ForeignKey("sage_ai_submissions.id"),
        primary_key=True,
        nullable=False,
        index=True,
    )

    status = Column(
        SQLEnum(ProcessingStatus, name="processing_status_enum", create_type=True),
        nullable=False,
        index=True,
    )

    message = Column(Text, nullable=False)

    created_at = Column(
        TIMESTAMP(timezone=True),
        server_default=text("CURRENT_TIMESTAMP"),
        nullable=False,
    )
    updated_at = Column(
        TIMESTAMP(timezone=True),
        server_default=text("CURRENT_TIMESTAMP"),
        onupdate=text("CURRENT_TIMESTAMP"),
        nullable=False,
    )

    def __repr__(self):
        return (
            f"<SubmissionProcessingStatus(submission_id={self.submission_id}, "
            f"status={self.status})>"
        )

    def to_dict(self):
        """Convert model instance to dictionary."""
        return {
            "submission_id": str(self.submission_id),
            "status": (
                self.status.value if hasattr(self.status, "value") else str(self.status)
            ),
            "message": self.message,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
