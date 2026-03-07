"""
Utils module for RPA service
"""

from .logger import configure_logging
from .error_utils import handle_service_exception
from .browser_automation import BrowserAutomation
from .form_processor import FormProcessor
from .email_utils import send_simple_email

__all__ = [
    "configure_logging",
    "handle_service_exception",
    "BrowserAutomation",
    "FormProcessor",
    "send_simple_email",
]
