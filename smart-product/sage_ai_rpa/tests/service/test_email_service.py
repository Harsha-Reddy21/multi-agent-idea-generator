"""
Tests for EmailService class
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4

from service.email_service import EmailService


class TestEmailService:
    """Test cases for EmailService"""

    def test_init(self):
        """Test EmailService initialization"""
        service = EmailService()
        assert service.logger is not None

    @pytest.mark.asyncio
    async def test_send_completion_email_success_no_mismatches(self):
        """Test sending completion email with no mismatches"""
        service = EmailService()

        submission_id = uuid4()
        automation_result = {"matched_count": 10, "failed_count": 0, "unmatched_questions": []}

        with patch("service.email_service.send_simple_email") as mock_send:
            await service.send_completion_email(
                user_email="test@example.com",
                submission_id=submission_id,
                form_type="ai-registry-form",
                automation_result=automation_result,
                total_questions=10,
            )

            mock_send.assert_called_once()
            args = mock_send.call_args[0]
            assert args[0] == ["test@example.com"]
            assert "completed successfully" in args[1]
            assert "10/10 questions filled" in args[1]

    @pytest.mark.asyncio
    async def test_send_completion_email_with_mismatches(self):
        """Test sending completion email with unmatched questions"""
        service = EmailService()

        submission_id = uuid4()
        automation_result = {"matched_count": 8, "failed_count": 1, "unmatched_questions": ["Question 1"]}

        with patch("service.email_service.send_simple_email") as mock_send:
            await service.send_completion_email(
                user_email="test@example.com",
                submission_id=submission_id,
                form_type="dlo-form",
                automation_result=automation_result,
                total_questions=10,
            )

            mock_send.assert_called_once()
            args = mock_send.call_args[0]
            assert args[0] == ["test@example.com"]
            assert "completed with" in args[1]
            assert "1 unmatched" in args[1]
            assert "1 failed" in args[1]

    @pytest.mark.asyncio
    async def test_send_completion_email_with_failed_count(self):
        """Test sending completion email with failed questions but no unmatched"""
        service = EmailService()

        submission_id = uuid4()
        automation_result = {"matched_count": 9, "failed_count": 1, "unmatched_questions": []}

        with patch("service.email_service.send_simple_email") as mock_send:
            await service.send_completion_email(
                user_email="test@example.com",
                submission_id=submission_id,
                form_type="ai-registry-form",
                automation_result=automation_result,
                total_questions=10,
            )

            mock_send.assert_called_once()
            args = mock_send.call_args[0]
            assert "completed with" in args[1]
            assert "0 unmatched" in args[1]
            assert "1 failed" in args[1]

    @pytest.mark.asyncio
    async def test_send_completion_email_exception_handling(self):
        """Test exception handling in send_completion_email"""
        service = EmailService()

        submission_id = uuid4()
        automation_result = {"matched_count": 10, "failed_count": 0, "unmatched_questions": []}

        with patch("service.email_service.send_simple_email", side_effect=Exception("Email error")):
            # Should not raise - exception is caught and logged
            await service.send_completion_email(
                user_email="test@example.com",
                submission_id=submission_id,
                form_type="ai-registry-form",
                automation_result=automation_result,
                total_questions=10,
            )

    @pytest.mark.asyncio
    async def test_send_failure_email_success(self):
        """Test sending failure email successfully"""
        service = EmailService()

        submission_id = uuid4()

        with patch("service.email_service.send_simple_email") as mock_send:
            await service.send_failure_email(
                user_email="test@example.com",
                submission_id=submission_id,
                form_type="ai-registry-form",
                error_message="Form validation failed",
            )

            mock_send.assert_called_once()
            args = mock_send.call_args[0]
            assert args[0] == ["test@example.com"]
            assert "processing failed" in args[1]
            assert str(submission_id) in args[1]
            assert "Form validation failed" in args[2]

    @pytest.mark.asyncio
    async def test_send_failure_email_exception_handling(self):
        """Test exception handling in send_failure_email"""
        service = EmailService()

        submission_id = uuid4()

        with patch("service.email_service.send_simple_email", side_effect=Exception("Email error")):
            # Should not raise - exception is caught and logged
            await service.send_failure_email(
                user_email="test@example.com",
                submission_id=submission_id,
                form_type="dlo-form",
                error_message="Browser automation failed",
            )

    @pytest.mark.asyncio
    async def test_send_completion_email_missing_keys_in_result(self):
        """Test completion email with missing keys in automation_result"""
        service = EmailService()

        submission_id = uuid4()
        automation_result = {}  # Empty result

        with patch("service.email_service.send_simple_email") as mock_send:
            await service.send_completion_email(
                user_email="test@example.com",
                submission_id=submission_id,
                form_type="ai-registry-form",
                automation_result=automation_result,
                total_questions=10,
            )

            mock_send.assert_called_once()
            args = mock_send.call_args[0]
            # Should use defaults: 0 matched, 0 failed, [] unmatched
            assert "0/10 questions filled" in args[1]
