"""
SQLAlchemy model for form schemas.
"""

import uuid

from sqlalchemy import (
    Column,
    Text,
    TIMESTAMP,
    JSON,
    Boolean,
    ForeignKey,
    text,
)
from sqlalchemy.dialects.postgresql import UUID
from data_service.constants.constants import TableName
from data_service.models.base import Base


class FormSchemas(Base):
    """Defines schema metadata and JSON structure for forms."""

    __tablename__ = TableName.FORM_SCHEMA.value

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    category_id = Column(
        UUID(as_uuid=True), ForeignKey("sage_ai_categories.id"), nullable=False
    )
    name = Column(Text, nullable=False)
    form_type = Column(Text, nullable=False)
    version = Column(Text, nullable=False)
    schema_json = Column(JSON, nullable=False)
    created_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))
    updated_at = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP"),
        onupdate=text("CURRENT_TIMESTAMP"),
    )
    is_active = Column(Boolean, default=True)

    def __repr__(self):
        return (
            f"<FormSchemas(id={self.id}, name={self.name}, "
            f"form_type={self.form_type}, version={self.version})>"
        )

    def to_dict(self):
        """Convert model instance to dictionary."""
        return {
            "id": str(self.id),
            "category_id": str(self.category_id),
            "name": self.name,
            "form_type": self.form_type,
            "version": self.version,
            "schema_json": self.schema_json,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "is_active": self.is_active,
        }
