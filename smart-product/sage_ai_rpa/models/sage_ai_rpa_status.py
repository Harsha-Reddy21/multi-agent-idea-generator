"""
Local copy of RPA Status Model - points to existing DB table managed by sage_ai_be.
No schema changes here.
"""

import uuid

from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID

from models.base import Base


class SageAIRPAStatus(Base):
    """Model for sage_ai_rpa_status table - tracks RPA job status."""

    __tablename__ = "sage_ai_rpa_status"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    submission_id = Column(
        UUID(as_uuid=True),
        ForeignKey("sage_ai_submissions.id"),
        nullable=False,
        index=True,
    )
    form_schema_id = Column(UUID(as_uuid=True), ForeignKey("sage_ai_form_schemas.id"), nullable=False)
    status = Column(String(50), nullable=False)  # pending, processing, completed, failed
    error_message = Column(Text, nullable=True)
    filled_questions = Column(Integer, default=0)
    total_questions = Column(Integer, default=0)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
