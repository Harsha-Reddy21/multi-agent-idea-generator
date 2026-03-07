"""
SQLAlchemy model definitions for categories.
"""

import uuid

from sqlalchemy import (
    Column,
    Text,
    Boolean,
    TIMESTAMP,
    text,
)
from sqlalchemy.dialects.postgresql import UUID
from data_service.constants.constants import TableName
from data_service.models.base import Base


class Categories(Base):
    """ORM model representing a category grouping submissions."""

    __tablename__ = TableName.CATEGORIES.value

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(Text, nullable=False)
    description = Column(Text, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))

    def __repr__(self):
        return (
            f"<Categories(id={self.id}, name={self.name}, is_active={self.is_active})>"
        )

    def to_dict(self):
        """Convert model instance to dictionary."""
        return {
            "id": str(self.id),
            "name": self.name,
            "description": self.description,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
