"""
SQLAlchemy model for form schemas.
Copied from sage_ai_be for foreign key resolution.
"""

import uuid

from sqlalchemy import (
    Column,
    Text,
    TIMESTAMP,
    JSON,
    Boolean,
    ForeignKey,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from models.base import Base


class FormSchemas(Base):
    """Defines schema metadata and JSON structure for forms."""

    __tablename__ = "sage_ai_form_schemas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    category_id = Column(UUID(as_uuid=True), ForeignKey("sage_ai_categories.id"), nullable=False)
    name = Column(Text, nullable=False)
    form_type = Column(Text, nullable=False)
    version = Column(Text, nullable=False)
    schema_json = Column(JSON, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())  # pylint: disable=not-callable
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())  # pylint: disable=not-callable
    is_active = Column(Boolean, default=True)
