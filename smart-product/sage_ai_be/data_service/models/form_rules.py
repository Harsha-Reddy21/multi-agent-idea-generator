"""
SQLAlchemy model definitions for form rules.
"""

import uuid

from sqlalchemy import (
    Column,
    Text,
    TIMESTAMP,
    ForeignKey,
    text,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from data_service.constants.constants import TableName
from data_service.models.base import Base


class FormRules(Base):
    """ORM model storing evaluation rules linked to form schemas."""

    __tablename__ = TableName.FORM_RULES.value

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    form_id = Column(
        UUID(as_uuid=True), ForeignKey("sage_ai_form_schemas.id"), nullable=False
    )
    category = Column(Text, nullable=False)
    condition_json = Column(JSONB, nullable=False)
    created_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))
    updated_at = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP"),
        onupdate=text("CURRENT_TIMESTAMP"),
    )

    def __repr__(self):
        return f"<FormRules(id={self.id}, form_id={self.form_id}, category={self.category})>"

    def to_dict(self):
        """Convert model instance to dictionary."""
        return {
            "id": str(self.id),
            "form_id": str(self.form_id),
            "category": self.category,
            "condition_json": self.condition_json,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
