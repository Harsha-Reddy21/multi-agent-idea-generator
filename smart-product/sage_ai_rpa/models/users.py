"""
SQLAlchemy model definitions for users.
Copied from sage_ai_be for foreign key resolution.
"""

import uuid

from sqlalchemy import (
    Column,
    String,
    Text,
    Boolean,
    TIMESTAMP,
    Index,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from models.base import Base


class Users(Base):
    """ORM model representing system users and roles."""

    __tablename__ = "sage_ai_users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(Text, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    role = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())  # pylint: disable=not-callable

    __table_args__ = (Index("AK", "email"),)
