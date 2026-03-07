"""
Local copy of SubmissionForms model referencing existing table.
No schema changes.
"""

import uuid
from sqlalchemy import Column, Text, TIMESTAMP, JSON, Float, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from models.base import Base


class SubmissionForms(Base):
    """Stores individual form data and status per submission."""

    __tablename__ = "sage_ai_submission_forms"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    submission_id = Column(UUID(as_uuid=True), ForeignKey("sage_ai_submissions.id"), nullable=False)
    form_schema_id = Column(UUID(as_uuid=True), ForeignKey("sage_ai_form_schemas.id"), nullable=False)
    form_type = Column(Text, nullable=False)
    form_data = Column(JSON, nullable=False)
    status = Column(Text, nullable=False)
    ai_metadata = Column(JSON, nullable=True)
    final_score = Column(Float, nullable=True)
    submitted_at = Column(
        TIMESTAMP, server_default=func.now()  # pylint: disable=not-callable
    )  # pylint: disable=not-callable
