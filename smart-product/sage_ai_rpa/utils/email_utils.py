"""
Email Utility Module
====================
Utility functions for sending emails via SMTP.
"""

import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.utils import formatdate
from typing import List

from configuration.settings import settings

logger = logging.getLogger(__name__)


def send_simple_email(
    to_addresses: List[str],
    subject: str,
    body: str,
    from_address: str = None,
    smtp_host: str = None,
    smtp_port: int = None,
) -> bool:
    """
    Send a simple text email using CATS email server.

    Args:
        to_addresses: List of recipient email addresses
        subject: Email subject
        body: Plain text email body
        from_address: Sender email address
        smtp_host: SMTP server hostname
        smtp_port: SMTP server port

    Returns:
        bool: True if email sent successfully, False otherwise
    """
    if not to_addresses:
        logger.error("At least one recipient email address is required")
        return False

    # Use settings defaults
    from_address = from_address or settings.email_from_address
    smtp_host = smtp_host or settings.smtp_host
    smtp_port = smtp_port or settings.smtp_port

    server = None
    try:
        # Create multipart message
        message = MIMEMultipart()
        message["From"] = from_address
        message["To"] = ", ".join(to_addresses)
        message["Subject"] = subject
        message["Date"] = formatdate(localtime=True)

        # Add custom SES configuration header
        message.add_header("X-SES-CONFIGURATION-SET", "custom-email-group")

        logger.info("Email message created: To=%s, Subject=%s", ", ".join(to_addresses), subject)

        # Add body to email
        message.attach(MIMEText(body, "plain"))

        # Connect to SMTP server (no authentication for CATS)
        server = smtplib.SMTP(smtp_host, smtp_port)
        logger.info(f"Connected to SMTP server at {smtp_host}:{smtp_port}")

        # Send email
        server.sendmail(from_address, to_addresses, message.as_string())

        logger.info(f"Email sent successfully to {len(to_addresses)} recipient(s): {subject}")

        return True

    except smtplib.SMTPException as e:
        logger.error(f"SMTP error occurred while sending email: {e}")
        return False
    except (ConnectionRefusedError, OSError) as e:
        logger.error(f"Cannot connect to SMTP server {smtp_host}:{smtp_port}. Error: {e}")
        return False
    except Exception as e:
        logger.error(f"Unexpected error while sending email: {e}", exc_info=True)
        return False
    finally:
        if server:
            try:
                server.quit()
            except Exception:
                pass
