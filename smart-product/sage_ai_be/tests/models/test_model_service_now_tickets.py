"""
Tests for ServiceNow tickets model.
"""

import uuid
from datetime import datetime
import pytest


def test_service_now_tickets_model_structure():
    """Test ServiceNow tickets model has correct structure."""
    from data_service.models.service_now_tickets import ServiceNowTickets

    # Verify model has expected attributes
    assert hasattr(ServiceNowTickets, "__tablename__")
    assert hasattr(ServiceNowTickets, "id")
    assert hasattr(ServiceNowTickets, "submission_id")
    assert hasattr(ServiceNowTickets, "ticket_number")
    assert hasattr(ServiceNowTickets, "status")
    assert hasattr(ServiceNowTickets, "created_at")

    # Verify we can create an instance
    ticket_id = uuid.uuid4()
    submission_id = uuid.uuid4()
    ticket = ServiceNowTickets(
        id=ticket_id,
        submission_id=submission_id,
        ticket_number="INC0012345",
        status="open",
    )

    assert ticket.id == ticket_id
    assert ticket.submission_id == submission_id
    assert ticket.ticket_number == "INC0012345"
    assert ticket.status == "open"


def test_service_now_tickets_nullable_ticket_number():
    """Test that ticket_number can be None."""
    from data_service.models.service_now_tickets import ServiceNowTickets

    ticket = ServiceNowTickets(
        id=uuid.uuid4(),
        submission_id=uuid.uuid4(),
        ticket_number=None,
        status="pending",
    )

    assert ticket.ticket_number is None
    assert ticket.status == "pending"
