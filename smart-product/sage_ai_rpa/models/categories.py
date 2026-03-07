"""
SQLAlchemy model definitions for categories.
Copied from sage_ai_be for foreign key resolution.
"""

import uuid

from sqlalchemy import (
    Column,
    Text,
    Boolean,
    TIMESTAMP,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from models.base import Base


class Categories(Base):
    """ORM model representing a category grouping submissions."""

    __tablename__ = "sage_ai_categories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(Text, nullable=False)
    description = Column(Text, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP, server_default=func.now())  # pylint: disable=not-callable
