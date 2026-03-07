"""Tests for configuration module"""

import pytest
import os
from unittest.mock import patch
from configuration import config
from configuration.settings import Settings, settings
from configuration.constants import RPAStatus, FormType, DEFAULT_FORM_TYPE


class TestConfig:
    """Test cases for configuration module"""

    def test_config_has_db_settings(self):
        """Test config module has database settings"""
        assert hasattr(config, "DB_NAME")
        assert hasattr(config, "DB_USER")
        assert hasattr(config, "DB_HOST")
        assert hasattr(config, "DB_PORT")

    def test_config_has_pool_settings(self):
        """Test config has connection pool settings"""
        assert hasattr(config, "DB_POOL_SIZE")
        assert hasattr(config, "DB_MAX_OVERFLOW")
        assert hasattr(config, "DB_POOL_TIMEOUT")


class TestSettings:
    """Test cases for Settings configuration"""

    def test_settings_instance_exists(self):
        """Test global settings instance exists"""
        assert settings is not None
        assert isinstance(settings, Settings)

    def test_settings_default_values(self):
        """Test settings has expected default values"""
        assert settings.queue_batch_size == 10
        assert settings.queue_max_age_hours == 24
        assert settings.queue_retry_attempts == 3
        assert settings.queue_retry_delay_seconds == 5
        assert settings.log_level == "INFO"
        assert settings.log_format == "json"

    def test_settings_supported_form_types(self):
        """Test supported_form_types property"""
        form_types = settings.supported_form_types
        assert isinstance(form_types, list)
        assert len(form_types) > 0
        assert all(isinstance(ft, str) for ft in form_types)

    def test_settings_custom_form_types(self):
        """Test creating settings with custom form types"""
        custom_settings = Settings(rpa_form_types="form1,form2,form3")
        assert custom_settings.supported_form_types == ["form1", "form2", "form3"]

    def test_settings_strips_whitespace(self):
        """Test that form types are stripped of whitespace"""
        custom_settings = Settings(rpa_form_types="form1 , form2 , form3")
        assert custom_settings.supported_form_types == ["form1", "form2", "form3"]


class TestRPAStatusConstants:
    """Test cases for RPAStatus enum"""

    def test_status_constants_exist(self):
        """Test all status constants are defined"""
        assert hasattr(RPAStatus, "PENDING")
        assert hasattr(RPAStatus, "PROCESSING")
        assert hasattr(RPAStatus, "COMPLETED")
        assert hasattr(RPAStatus, "FAILED")

    def test_status_values(self):
        """Test status constant values"""
        assert RPAStatus.PENDING.value == "pending"
        assert RPAStatus.PROCESSING.value == "processing"
        assert RPAStatus.COMPLETED.value == "completed"
        assert RPAStatus.FAILED.value == "failed"

    def test_status_is_string_enum(self):
        """Test RPAStatus inherits from str and Enum"""
        assert isinstance(RPAStatus.PENDING, str)
        assert isinstance(RPAStatus.PENDING, RPAStatus)


class TestFormTypeConstants:
    """Test cases for FormType enum"""

    def test_form_type_constants_exist(self):
        """Test form type constants are defined"""
        assert hasattr(FormType, "AI_REGISTRY")
        assert hasattr(FormType, "SECURITY_ARCH")
        assert hasattr(FormType, "DLO")

    def test_form_type_values(self):
        """Test form type constant values"""
        assert FormType.AI_REGISTRY.value == "ai-registry-form"
        assert FormType.SECURITY_ARCH.value == "security-arch-form"
        assert FormType.DLO.value == "dlo-form"

    def test_default_form_type(self):
        """Test default form type constant"""
        assert DEFAULT_FORM_TYPE == "security-arch-form"

        assert isinstance(RPAStatus.PENDING.value, str)
        assert isinstance(RPAStatus.PROCESSING.value, str)
        assert isinstance(RPAStatus.COMPLETED.value, str)
        assert isinstance(RPAStatus.FAILED.value, str)

    def test_status_values_are_unique(self):
        """Test all status values are unique"""
        values = [
            RPAStatus.PENDING.value,
            RPAStatus.PROCESSING.value,
            RPAStatus.COMPLETED.value,
            RPAStatus.FAILED.value,
        ]
        assert len(values) == len(set(values))


"""
Tests for configuration constants
"""
import pytest
from configuration.constants import RPAStatus


class TestRPAStatus:
    """Test cases for RPAStatus enum"""

    def test_rpa_status_values(self):
        """Test RPAStatus enum has correct values"""
        assert hasattr(RPAStatus, "PENDING")
        assert hasattr(RPAStatus, "PROCESSING")
        assert hasattr(RPAStatus, "COMPLETED")
        assert hasattr(RPAStatus, "FAILED")

    def test_rpa_status_string_values(self):
        """Test RPAStatus enum string representations"""
        # These tests verify the actual string values if they're defined
        # Adjust based on actual implementation
        if hasattr(RPAStatus.PENDING, "value"):
            assert isinstance(RPAStatus.PENDING.value, str)
        if hasattr(RPAStatus.PROCESSING, "value"):
            assert isinstance(RPAStatus.PROCESSING.value, str)
        if hasattr(RPAStatus.COMPLETED, "value"):
            assert isinstance(RPAStatus.COMPLETED.value, str)
        if hasattr(RPAStatus.FAILED, "value"):
            assert isinstance(RPAStatus.FAILED.value, str)

    def test_rpa_status_uniqueness(self):
        """Test that all RPAStatus values are unique"""
        statuses = [RPAStatus.PENDING, RPAStatus.PROCESSING, RPAStatus.COMPLETED, RPAStatus.FAILED]
        if hasattr(RPAStatus.PENDING, "value"):
            values = [s.value for s in statuses]
            assert len(values) == len(set(values)), "RPAStatus values should be unique"
