"""
Tests for base exception classes.
"""

import pytest
from data_service.exceptions.base import ServiceError


def test_service_error_creation():
    """Test creating a ServiceError."""
    error = ServiceError(
        error="ValidationError", message="Invalid input provided", status_code=400
    )

    assert error.error == "ValidationError"
    assert error.message == "Invalid input provided"
    assert error.status_code == 400
    assert str(error) == "Invalid input provided"


def test_service_error_repr():
    """Test ServiceError __repr__ method."""
    error = ServiceError(
        error="NotFound", message="Resource not found", status_code=404
    )

    repr_str = repr(error)
    assert "ServiceError" in repr_str
    assert "error='NotFound'" in repr_str
    assert "message='Resource not found'" in repr_str
    assert "status_code=404" in repr_str


def test_service_error_inheritance():
    """Test that ServiceError inherits from Exception."""
    error = ServiceError(error="TestError", message="Test message", status_code=500)

    assert isinstance(error, Exception)


def test_service_error_can_be_raised():
    """Test that ServiceError can be raised and caught."""
    with pytest.raises(ServiceError) as exc_info:
        raise ServiceError(
            error="TestError", message="Test error message", status_code=400
        )

    assert exc_info.value.error == "TestError"
    assert exc_info.value.message == "Test error message"
    assert exc_info.value.status_code == 400
