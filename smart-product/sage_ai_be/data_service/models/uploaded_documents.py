"""
Uploaded documents metadata model.
"""

import uuid

from sqlalchemy import (
    Column,
    Text,
    TIMESTAMP,
    JSON,
    ForeignKey,
    text,
)
from sqlalchemy.dialects.postgresql import UUID
from data_service.constants.constants import TableName
from data_service.models.base import Base


class UploadedDocuments(Base):
    """Stores uploaded document metadata for a submission."""

    __tablename__ = TableName.UPLOADED_DOCUMENTS.value

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    submission_id = Column(
        UUID(as_uuid=True), ForeignKey("sage_ai_submissions.id"), nullable=False
    )
    file_name = Column(Text, nullable=False)
    file_path = Column(Text, nullable=False)
    document_metadata = Column(JSON, nullable=True)
    uploaded_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))
    form_id = Column(
        UUID(as_uuid=True), ForeignKey("sage_ai_submission_forms.id"), nullable=True
    )

    def __repr__(self):
        return (
            f"<UploadedDocuments(id={self.id}, submission_id={self.submission_id}, "
            f"file_name={self.file_name})>"
        )

    def to_dict(self):
        """Convert model instance to dictionary."""
        return {
            "id": str(self.id),
            "submission_id": str(self.submission_id),
            "file_name": self.file_name,
            "file_path": self.file_path,
            "document_metadata": self.document_metadata,
            "uploaded_at": self.uploaded_at.isoformat() if self.uploaded_at else None,
            "form_id": str(self.form_id) if self.form_id else None,
        }
