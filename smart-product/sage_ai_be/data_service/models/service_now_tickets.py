"""
ServiceNow tickets model.
"""

import uuid

from sqlalchemy import (
    Column,
    Text,
    TIMESTAMP,
    ForeignKey,
    text,
)
from sqlalchemy.dialects.postgresql import UUID
from data_service.constants.constants import TableName
from data_service.models.base import Base


class ServiceNowTickets(Base):
    """Stores ServiceNow ticket linkage for a submission."""

    __tablename__ = TableName.SERVICE_NOW_TICKETS.value

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    submission_id = Column(
        UUID(as_uuid=True), ForeignKey("sage_ai_submissions.id"), nullable=False
    )
    ticket_number = Column(Text, nullable=True)
    status = Column(Text, nullable=False)
    created_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))
    updated_at = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP"),
        onupdate=text("CURRENT_TIMESTAMP"),
    )

    def __repr__(self):
        return (
            f"<ServiceNowTickets(id={self.id}, submission_id={self.submission_id}, "
            f"ticket_number={self.ticket_number})>"
        )

    def to_dict(self):
        """Convert model instance to dictionary."""
        return {
            "id": str(self.id),
            "submission_id": str(self.submission_id),
            "ticket_number": self.ticket_number,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
