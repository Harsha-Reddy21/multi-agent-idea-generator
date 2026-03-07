"""
Root conftest.py for sage_ai_rpa

CRITICAL: This file MUST exist at the root of sage_ai_rpa to ensure
environment variables are set BEFORE any module imports during pytest collection.

When pytest starts, it loads conftest.py files from the root upward,
so this file will execute before __init__.py imports happen.
"""

import os
import sys

# Add the current directory to Python path to enable imports
# This allows tests to import configuration, models, etc. directly
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Set all required environment variables BEFORE any imports
# This prevents Pydantic ValidationError during Settings instantiation
os.environ.setdefault("DB_USER", "test_user")
os.environ.setdefault("DB_PASSWORD", "test_password")
os.environ.setdefault("DB_HOST", "localhost")
os.environ.setdefault("DB_PORT", "5432")
os.environ.setdefault("DB_NAME", "test_rpa_db")
os.environ.setdefault("DB_POOL_SIZE", "5")
os.environ.setdefault("DB_MAX_OVERFLOW", "10")
os.environ.setdefault("DB_POOL_TIMEOUT", "60")
os.environ.setdefault("EMAIL_FROM_ADDRESS", "test@example.com")
os.environ.setdefault("PYTEST_RUNNING", "1")

# Import pytest and required modules AFTER environment is set
import pytest
from datetime import datetime
from uuid import uuid4, UUID
from unittest.mock import MagicMock


# Shared test fixtures
@pytest.fixture
def sample_submission_id() -> UUID:
    """Fixture providing a sample submission ID"""
    return uuid4()


@pytest.fixture
def sample_form_schema_id() -> UUID:
    """Fixture providing a sample form schema ID"""
    return uuid4()


@pytest.fixture
def sample_queue_job(sample_submission_id, sample_form_schema_id):
    """Fixture providing a sample QueueJobInfo object"""
    from serializers.rpa_schemas import QueueJobInfo

    return QueueJobInfo(
        rpa_status_id=uuid4(),
        submission_id=sample_submission_id,
        form_schema_id=sample_form_schema_id,
        form_type="ai-registry-form",
        created_at=datetime.utcnow(),
    )


@pytest.fixture
def mock_browser_automation():
    """Fixture providing a mock BrowserAutomation instance"""
    mock = MagicMock()
    mock.driver = MagicMock()
    mock.wait = MagicMock()
    return mock
