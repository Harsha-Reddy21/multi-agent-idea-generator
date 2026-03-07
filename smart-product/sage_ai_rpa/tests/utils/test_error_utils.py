"""
Tests for error utility functions
"""

import pytest
from unittest.mock import patch
from sqlalchemy.exc import OperationalError, SQLAlchemyError
from exceptions import FormAutomationServiceError
from utils.error_utils import handle_service_exception


class TestErrorUtils:
    """Test cases for error utility functions"""

    @patch("utils.error_utils.logger")
    def test_handle_service_exception_with_operational_error(self, mock_logger):
        """Test handling OperationalError"""
        error = OperationalError("DB connection failed", None, None)

        with pytest.raises(FormAutomationServiceError) as exc_info:
            handle_service_exception(error, FormAutomationServiceError, "test_operation")

        assert "Service Unavailable" in exc_info.value.error
        assert "temporarily unavailable" in exc_info.value.message.lower()

    @patch("utils.error_utils.logger")
    def test_handle_service_exception_with_sqlalchemy_error(self, mock_logger):
        """Test handling SQLAlchemyError"""
        error = SQLAlchemyError("SQL error")

        with pytest.raises(FormAutomationServiceError) as exc_info:
            handle_service_exception(error, FormAutomationServiceError, "test_operation")

        assert "Database Error" in exc_info.value.error
        assert "test_operation" in exc_info.value.message.lower()

    @patch("utils.error_utils.logger")
    def test_handle_service_exception_with_value_error(self, mock_logger):
        """Test handling ValueError"""
        error = ValueError("Invalid value")

        with pytest.raises(FormAutomationServiceError) as exc_info:
            handle_service_exception(error, FormAutomationServiceError, "test_operation")

        assert "Validation Error" in exc_info.value.error
        assert "Invalid data" in exc_info.value.message

    @patch("utils.error_utils.logger")
    def test_handle_service_exception_with_type_error(self, mock_logger):
        """Test handling TypeError"""
        error = TypeError("Type mismatch")

        with pytest.raises(FormAutomationServiceError) as exc_info:
            handle_service_exception(error, FormAutomationServiceError, "test_operation")

        assert "Validation Error" in exc_info.value.error

    @patch("utils.error_utils.logger")
    def test_handle_service_exception_with_generic_error(self, mock_logger):
        """Test handling generic exception"""
        error = RuntimeError("Generic error")

        with pytest.raises(FormAutomationServiceError) as exc_info:
            handle_service_exception(error, FormAutomationServiceError, "test_operation")

        assert "Internal Server Error" in exc_info.value.error
        assert "unexpected error" in exc_info.value.message.lower()

    @patch("utils.error_utils.logger")
    def test_handle_service_exception_different_contexts(self, mock_logger):
        """Test error handling for different contexts"""
        contexts = ["database_query", "form_fill", "status_update"]

        for context in contexts:
            with pytest.raises(FormAutomationServiceError) as exc_info:
                handle_service_exception(ValueError(f"Error in {context}"), FormAutomationServiceError, context)

            assert context in exc_info.value.message.lower()
