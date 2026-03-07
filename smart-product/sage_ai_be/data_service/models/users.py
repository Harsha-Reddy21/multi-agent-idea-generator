"""
SQLAlchemy model definitions for users.
"""

import uuid

from sqlalchemy import (
    Column,
    String,
    Text,
    Boolean,
    TIMESTAMP,
    Index,
    text,
)
from sqlalchemy.dialects.postgresql import UUID
from data_service.constants.constants import TableName
from data_service.models.base import Base


class Users(Base):
    """ORM model representing system users and roles."""

    __tablename__ = TableName.USERS.value

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(Text, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    role = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(
        TIMESTAMP(timezone=True), server_default=text("CURRENT_TIMESTAMP")
    )

    __table_args__ = (Index("AK", "email"),)

    def __repr__(self):
        return f"<Users(id={self.id}, email={self.email}, role={self.role})>"

    def to_dict(self):
        """Convert model instance to dictionary."""
        return {
            "id": str(self.id),
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
