"""
Tests for email_utils module
"""

import pytest
from unittest.mock import MagicMock, patch, call
import smtplib

from utils.email_utils import send_simple_email


class TestSendSimpleEmail:
    """Test cases for send_simple_email function"""

    def test_send_simple_email_no_recipients(self):
        """Test sending email with no recipients"""
        result = send_simple_email(to_addresses=[], subject="Test", body="Test body")

        assert result is False

    @patch("utils.email_utils.smtplib.SMTP")
    def test_send_simple_email_success(self, mock_smtp):
        """Test successful email sending"""
        mock_server = MagicMock()
        mock_smtp.return_value = mock_server

        result = send_simple_email(to_addresses=["test@example.com"], subject="Test Subject", body="Test body content")

        assert result is True
        mock_smtp.assert_called_once()
        mock_server.sendmail.assert_called_once()
        mock_server.quit.assert_called_once()

    @patch("utils.email_utils.smtplib.SMTP")
    def test_send_simple_email_multiple_recipients(self, mock_smtp):
        """Test sending email to multiple recipients"""
        mock_server = MagicMock()
        mock_smtp.return_value = mock_server

        result = send_simple_email(
            to_addresses=["test1@example.com", "test2@example.com", "test3@example.com"],
            subject="Test Subject",
            body="Test body",
        )

        assert result is True
        # Verify sendmail was called with all recipients
        call_args = mock_server.sendmail.call_args[0]
        assert call_args[1] == ["test1@example.com", "test2@example.com", "test3@example.com"]

    @patch("utils.email_utils.smtplib.SMTP")
    def test_send_simple_email_with_custom_from_address(self, mock_smtp):
        """Test sending email with custom from address"""
        mock_server = MagicMock()
        mock_smtp.return_value = mock_server

        result = send_simple_email(
            to_addresses=["test@example.com"], subject="Test", body="Body", from_address="custom@example.com"
        )

        assert result is True
        call_args = mock_server.sendmail.call_args[0]
        assert call_args[0] == "custom@example.com"

    @patch("utils.email_utils.smtplib.SMTP")
    def test_send_simple_email_with_custom_smtp_settings(self, mock_smtp):
        """Test sending email with custom SMTP host and port"""
        mock_server = MagicMock()
        mock_smtp.return_value = mock_server

        result = send_simple_email(
            to_addresses=["test@example.com"], subject="Test", body="Body", smtp_host="custom.smtp.com", smtp_port=587
        )

        assert result is True
        mock_smtp.assert_called_once_with("custom.smtp.com", 587)

    @patch("utils.email_utils.smtplib.SMTP")
    def test_send_simple_email_uses_default_settings(self, mock_smtp):
        """Test that default settings are used when not provided"""
        mock_server = MagicMock()
        mock_smtp.return_value = mock_server

        with patch("utils.email_utils.settings") as mock_settings:
            mock_settings.email_from_address = "default@example.com"
            mock_settings.smtp_host = "smtp.default.com"
            mock_settings.smtp_port = 25

            result = send_simple_email(to_addresses=["test@example.com"], subject="Test", body="Body")

            assert result is True
            mock_smtp.assert_called_once_with("smtp.default.com", 25)

    @patch("utils.email_utils.smtplib.SMTP")
    def test_send_simple_email_message_structure(self, mock_smtp):
        """Test that email message has correct structure"""
        mock_server = MagicMock()
        mock_smtp.return_value = mock_server

        result = send_simple_email(
            to_addresses=["test@example.com"],
            subject="Test Subject",
            body="Test body content",
            from_address="sender@example.com",
        )

        assert result is True
        # Get the message string that was sent
        call_args = mock_server.sendmail.call_args[0]
        message_str = call_args[2]

        # Verify message contains expected parts
        assert "From: sender@example.com" in message_str
        assert "To: test@example.com" in message_str
        assert "Subject: Test Subject" in message_str
        assert "Test body content" in message_str
        assert "X-SES-CONFIGURATION-SET: custom-email-group" in message_str

    @patch("utils.email_utils.logger")
    @patch("utils.email_utils.smtplib.SMTP")
    def test_send_simple_email_smtp_exception(self, mock_smtp, mock_logger):
        """Test handling of SMTP exception"""
        mock_server = MagicMock()
        mock_server.sendmail.side_effect = smtplib.SMTPException("SMTP error")
        mock_smtp.return_value = mock_server

        result = send_simple_email(to_addresses=["test@example.com"], subject="Test", body="Body")

        assert result is False
        mock_server.quit.assert_called_once()

    @patch("utils.email_utils.logger")
    @patch("utils.email_utils.smtplib.SMTP")
    def test_send_simple_email_connection_refused(self, mock_smtp, mock_logger):
        """Test handling of connection refused error"""
        mock_smtp.side_effect = ConnectionRefusedError("Connection refused")

        result = send_simple_email(to_addresses=["test@example.com"], subject="Test", body="Body")

        assert result is False

    @patch("utils.email_utils.logger")
    @patch("utils.email_utils.smtplib.SMTP")
    def test_send_simple_email_os_error(self, mock_smtp, mock_logger):
        """Test handling of OS error"""
        mock_smtp.side_effect = OSError("Network error")

        result = send_simple_email(to_addresses=["test@example.com"], subject="Test", body="Body")

        assert result is False

    @patch("utils.email_utils.logger")
    @patch("utils.email_utils.smtplib.SMTP")
    def test_send_simple_email_unexpected_exception(self, mock_smtp, mock_logger):
        """Test handling of unexpected exception"""
        mock_server = MagicMock()
        mock_server.sendmail.side_effect = ValueError("Unexpected error")
        mock_smtp.return_value = mock_server

        result = send_simple_email(to_addresses=["test@example.com"], subject="Test", body="Body")

        assert result is False
        mock_server.quit.assert_called_once()

    @patch("utils.email_utils.logger")
    @patch("utils.email_utils.smtplib.SMTP")
    def test_send_simple_email_quit_exception(self, mock_smtp, mock_logger):
        """Test that quit exceptions are handled silently"""
        mock_server = MagicMock()
        mock_server.sendmail.side_effect = smtplib.SMTPException("Error")
        mock_server.quit.side_effect = Exception("Quit failed")
        mock_smtp.return_value = mock_server

        # Should not raise exception even if quit fails
        result = send_simple_email(to_addresses=["test@example.com"], subject="Test", body="Body")

        assert result is False

    @patch("utils.email_utils.logger")
    @patch("utils.email_utils.smtplib.SMTP")
    def test_send_simple_email_server_none_in_finally(self, mock_smtp, mock_logger):
        """Test that finally block handles None server gracefully"""
        mock_smtp.side_effect = ConnectionRefusedError("Connection refused")

        # Should not raise exception when server is None
        result = send_simple_email(to_addresses=["test@example.com"], subject="Test", body="Body")

        assert result is False

    @patch("utils.email_utils.smtplib.SMTP")
    def test_send_simple_email_with_long_body(self, mock_smtp):
        """Test sending email with long body content"""
        mock_server = MagicMock()
        mock_smtp.return_value = mock_server

        long_body = "Test body " * 1000  # Very long body

        result = send_simple_email(to_addresses=["test@example.com"], subject="Test", body=long_body)

        assert result is True
        call_args = mock_server.sendmail.call_args[0]
        message_str = call_args[2]
        assert long_body in message_str

    @patch("utils.email_utils.smtplib.SMTP")
    def test_send_simple_email_with_special_characters(self, mock_smtp):
        """Test sending email with special characters in subject and body"""
        mock_server = MagicMock()
        mock_smtp.return_value = mock_server

        result = send_simple_email(
            to_addresses=["test@example.com"],
            subject="Test Subject with émojis 🎉 and spéçial çhars",
            body="Body with spéçial characters: 你好, привет, مرحبا",
        )

        assert result is True

    @patch("utils.email_utils.smtplib.SMTP")
    def test_send_simple_email_smtp_server_logs_connection(self, mock_smtp):
        """Test that SMTP connection is logged"""
        mock_server = MagicMock()
        mock_smtp.return_value = mock_server

        with patch("utils.email_utils.logger") as mock_logger:
            result = send_simple_email(
                to_addresses=["test@example.com"], subject="Test", body="Body", smtp_host="smtp.test.com", smtp_port=25
            )

            assert result is True
            # Check that connection was logged
            log_calls = [str(call) for call in mock_logger.info.call_args_list]
            assert any("Connected to SMTP server" in str(call) for call in log_calls)

    @patch("utils.email_utils.smtplib.SMTP")
    def test_send_simple_email_logs_success(self, mock_smtp):
        """Test that successful email sending is logged"""
        mock_server = MagicMock()
        mock_smtp.return_value = mock_server

        with patch("utils.email_utils.logger") as mock_logger:
            result = send_simple_email(
                to_addresses=["test1@example.com", "test2@example.com"], subject="Test Subject", body="Body"
            )

            assert result is True
            # Check that success was logged with recipient count
            log_calls = [str(call) for call in mock_logger.info.call_args_list]
            assert any("Email sent successfully to 2 recipient(s)" in str(call) for call in log_calls)

    @patch("utils.email_utils.smtplib.SMTP")
    def test_send_simple_email_message_has_date_header(self, mock_smtp):
        """Test that email message includes Date header"""
        mock_server = MagicMock()
        mock_smtp.return_value = mock_server

        result = send_simple_email(to_addresses=["test@example.com"], subject="Test", body="Body")

        assert result is True
        call_args = mock_server.sendmail.call_args[0]
        message_str = call_args[2]
        assert "Date:" in message_str
