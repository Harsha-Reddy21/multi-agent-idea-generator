"""
Application Settings Module
============================
Configuration settings loaded from environment variables.
"""

import os
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # RPA Form Types - Comma-separated list of form types to process
    rpa_form_types: str = (
        "ai-registry-form,security-arch-form,dlo-form,wwtp-form,ai-registry-update-form,wwtp-new-vendor-form"
    )

    # Queue Processing Configuration
    queue_batch_size: int = 10  # Number of pending jobs to process per run
    queue_max_age_hours: int = 24  # Ignore jobs older than this (in hours)
    queue_retry_attempts: int = 3
    queue_retry_delay_seconds: int = 5

    # Logging Configuration
    log_level: str = "INFO"
    log_format: str = "json"  # json or text

    # Database Configuration
    db_name: str = Field(..., description="Database name - REQUIRED")
    db_user: str = Field(..., description="Database username - REQUIRED")
    db_password: str = Field(..., description="Database password - REQUIRED")
    db_host: str = Field(..., description="Database host - REQUIRED")
    db_port: int = Field(..., description="Database port - REQUIRED")
    db_pool_size: int = 5  # Connection pool size
    db_max_overflow: int = 10  # Max overflow connections
    db_pool_timeout: int = 60  # Pool timeout in seconds

    # Email Configuration
    smtp_host: str = "smtp.messaging.svc"
    smtp_port: int = 1025
    email_from_address: str = Field(..., description="Email sender address - REQUIRED")

    @property
    def supported_form_types(self) -> list[str]:
        """Parse and return list of supported form types"""
        return [ft.strip() for ft in self.rpa_form_types.split(",") if ft.strip()]

    class Config:
        """Pydantic configuration"""

        env_file = os.getenv("ENV_FILE", ".env")
        extra = "allow"


# Global settings instance
settings = Settings()
