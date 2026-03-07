"""Test suite for Sage AI RPA Service"""

import os

# Set test environment variables IMMEDIATELY at module import
# This must happen BEFORE any other sage_ai_rpa imports
# to prevent config.py from failing when trying to convert None to int
os.environ.setdefault("DB_USER", "test_user")
os.environ.setdefault("DB_PASSWORD", "test_password")
os.environ.setdefault("DB_HOST", "localhost")
os.environ.setdefault("DB_PORT", "5432")
os.environ.setdefault("DB_NAME", "test_rpa_db")
os.environ.setdefault("DB_POOL_SIZE", "5")
os.environ.setdefault("DB_MAX_OVERFLOW", "10")
os.environ.setdefault("DB_POOL_TIMEOUT", "60")
os.environ.setdefault("PYTEST_RUNNING", "1")
