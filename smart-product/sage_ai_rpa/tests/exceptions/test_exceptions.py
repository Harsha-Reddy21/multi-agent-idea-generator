"""
Tests for exception classes
"""

import pytest
from exceptions.base import ServiceError
from exceptions.service_errors import FormAutomationServiceError


class TestServiceError:
    """Test cases for ServiceError base class"""

    def test_service_error_creation(self):
        """Test creating ServiceError"""
        error = ServiceError(error="Test Error", message="Test message", status_code=500)

        assert error.error == "Test Error"
        assert error.message == "Test message"
        assert error.status_code == 500

    def test_service_error_str(self):
        """Test string representation"""
        error = ServiceError(error="Test Error", message="Test message", status_code=400)

        error_str = str(error)
        assert "Test message" in error_str or "Test Error" in error_str


class TestFormAutomationServiceError:
    """Test cases for FormAutomationServiceError"""

    def test_form_automation_service_error_creation(self):
        """Test creating FormAutomationServiceError"""
        error = FormAutomationServiceError(error="Automation Error", message="Automation failed", status_code=503)

        assert error.error == "Automation Error"
        assert error.message == "Automation failed"
        assert error.status_code == 503

    def test_form_automation_service_error_inheritance(self):
        """Test FormAutomationServiceError inherits from ServiceError"""
        error = FormAutomationServiceError(error="Test", message="Test", status_code=500)

        assert isinstance(error, ServiceError)
        assert isinstance(error, FormAutomationServiceError)

    def test_form_automation_service_error_default_status(self):
        """Test default status code"""
        error = FormAutomationServiceError(error="Test", message="Test")

        # Should have a status code even if not provided
        assert hasattr(error, "status_code")
