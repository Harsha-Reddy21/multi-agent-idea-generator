"""
Submission form instances for a submission.
"""

import uuid

from sqlalchemy import (
    Column,
    Text,
    TIMESTAMP,
    JSON,
    ForeignKey,
    Float,
    text,
)
from sqlalchemy.dialects.postgresql import UUID
from data_service.constants.constants import TableName
from data_service.models.base import Base


class SubmissionForms(Base):
    """Stores individual form data and status per submission."""

    __tablename__ = TableName.SUBMISSION_FORMS.value

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    submission_id = Column(
        UUID(as_uuid=True), ForeignKey("sage_ai_submissions.id"), nullable=False
    )
    form_schema_id = Column(
        UUID(as_uuid=True), ForeignKey("sage_ai_form_schemas.id"), nullable=False
    )
    form_type = Column(Text, nullable=False)
    form_data = Column(JSON, nullable=False)
    status = Column(Text, nullable=False)
    form_category = Column(Text, nullable=True)  # recommended or optional
    ai_metadata = Column(JSON, nullable=True)
    final_score = Column(Float, nullable=True)
    submitted_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))

    def __repr__(self):
        return (
            f"<SubmissionForms(id={self.id}, submission_id={self.submission_id}, "
            f"form_type={self.form_type}, status={self.status})>"
        )

    def to_dict(self):
        """Convert model instance to dictionary."""
        return {
            "id": str(self.id),
            "submission_id": str(self.submission_id),
            "form_schema_id": str(self.form_schema_id),
            "form_type": self.form_type,
            "form_data": self.form_data,
            "status": self.status,
            "form_category": self.form_category,
            "ai_metadata": self.ai_metadata,
            "final_score": self.final_score,
            "submitted_at": (
                self.submitted_at.isoformat() if self.submitted_at else None
            ),
        }
