"""
Application Settings Module
============================
Configuration settings loaded from environment variables.
Provides dependency injection support for FastAPI.
"""

import os
from functools import lru_cache
from typing import Annotated

from fastapi import Depends
from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # Azure AD / MSAL Configuration
    client_id: str = Field(..., description="Azure AD client ID - REQUIRED")
    client_secret: str = Field(..., description="Azure AD client secret - REQUIRED")
    tenant_id: str = Field(..., description="Azure AD tenant ID - REQUIRED")

    # Database Configuration
    db_name: str = Field(..., description="Database name - REQUIRED")
    db_user: str = Field(..., description="Database username - REQUIRED")
    db_password: str = Field(..., description="Database password - REQUIRED")
    db_host: str = Field(..., description="Database host - REQUIRED")
    db_port: int = Field(..., description="Database port - REQUIRED")
    db_pool_size: int = 5  # Connection pool size
    db_max_overflow: int = 10  # Max overflow connections
    db_pool_timeout: int = 60  # Pool timeout in seconds

    # Cortex API Configuration
    cortex_base_url: str = Field(..., description="Cortex API base URL - REQUIRED")
    cortex_scope: str = "api://Cortex.lilly.com/.default"

    # Model Configuration
    enhance_model_config: str = "sage-ai-enhance-field-model-v2"
    test_model_config: str = "ht-structured-output-test"
    document_analysis_model: str = "sageai-doc-extract-model-v3"
    summarize_compound_field_model: str = "summarize-compound-form-model-v1"

    # LLM Configuration
    llm_max_retries: int = 3
    cortex_max_retries: int = 3
    llm_timeout: int = 360

    # HTTP Client Configuration
    http_timeout: float = 30.0  # Total timeout in seconds
    http_connect_timeout: float = 10.0  # Connection timeout in seconds
    http_max_connections: int = 50  # Maximum concurrent connections
    http_max_keepalive_connections: int = 20  # Maximum keepalive connections

    # HTTP Client Retry Configuration
    http_retry_attempts: int = 3
    http_retry_min_wait: int = 1  # seconds
    http_retry_max_wait: int = 10  # seconds
    http_retry_multiplier: int = 1  # exponential backoff multiplier

    # Cortex HTTP Client Configurations
    cortex_http_timeout: int = 150  # Default timeout for HTTP requests
    cortex_max_connections: int = 50  # Maximum number of concurrent connections
    cortex_max_keepalive_connections: int = 20  # Maximum keepalive connections
    # Refresh token N seconds before expiry (5 minutes)
    cortex_token_refresh_buffer: int = 300
    # Default token expiry in seconds (10 minutes)
    cortex_token_default_expiry: int = 600
    cortex_file_upload_timeout: int = 60  # Timeout for file upload operations
    # Default workflow timeout (30 minutes)
    cortex_workflow_timeout: int = 1800
    # Additional buffer for workflow timeout
    cortex_workflow_timeout_buffer: int = 30

    # LLM Gateway Configuration
    use_llm_gateway: bool = False
    llm_max_retries: int = 3
    llm_timeout: int = 360
    llm_gateway_url: str = Field(..., description="LLM Gateway URL - REQUIRED")
    llm_gateway_key: str = Field(..., description="LLM Gateway API key - REQUIRED")
    llm_gateway_scope: str = "api://llm-gateway.lilly.com/.default"
    DOC_EXTRACT_LLM_GATEWAY_MODEL: str = "gpt-5-2025-08-07"

    # Deterministic Extraction Configuration
    llm_temperature: float = 0.0  # Temperature for deterministic responses
    llm_seed: int = 42  # Fixed seed for reproducible LLM outputs
    embedding_seed: int = 42  # Fixed seed for consistent embeddings

    # Dual API Race Strategy Configuration
    # Call both LLM Gateway and Cortex simultaneously, use first success
    use_dual_api_race: bool = False

    # LLM Gateway HTTP Client Configuration
    llm_gateway_http_timeout: int = 120  # Default timeout for HTTP requests
    # Maximum number of concurrent connections
    llm_gateway_max_connections: int = 50
    llm_gateway_max_keepalive_connections: int = 20  # Maximum keepalive connections
    # Refresh token N seconds before expiry (5 minutes)
    llm_gateway_token_refresh_buffer: int = 300
    # Default token expiry in seconds (10 minutes)
    llm_gateway_token_default_expiry: int = 600
    # Default workflow timeout (30 minutes)
    llm_gateway_workflow_timeout: int = 1800
    # Additional buffer for workflow timeout
    llm_gateway_workflow_timeout_buffer: int = 30

    # Document Extraction Configuration
    chars_per_page: int = 3000  # Character count for page estimation in DOCX/TXT files
    # Maximum concurrent LLM API calls (semaphore limit)
    max_concurrent_llm_calls: int = 5
    max_concurrent_llm_calls: int = (
        5  # Maximum concurrent LLM API calls (semaphore limit)
    )

    # MongoDB Configuration
    mongodb_uri: str = ""

    # S3 Configuration
    s3_bucket: str = Field(..., description="S3 bucket name - REQUIRED")
    s3_prefix: str = Field(..., description="S3 prefix - REQUIRED")
    upload_s3_prefix: str = "uploads/"

    # File Upload Configuration
    upload_max_file_size: int = 50 * 1024 * 1024  # 50MB
    upload_allowed_extensions: list = [".pdf", ".docx", ".txt", ".pptx"]
    upload_allowed_mime_types: list = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ]

    # AWS Configuration
    aws_region: str = "us-east-1"

    # Logging Configuration
    log_level: str = "INFO"  # DEBUG, INFO, WARNING, ERROR, CRITICAL

    # ServiceNow Configuration
    service_now_base_url: str = Field(..., description="ServiceNow base URL - REQUIRED")
    service_now_username: str = Field(..., description="ServiceNow username - REQUIRED")
    service_now_password: str = Field(..., description="ServiceNow password - REQUIRED")
    service_now_timeout: float = 30.0
    service_now_connect_timeout: float = 10.0
    service_now_max_connections: int = 20
    service_now_max_keepalive_connections: int = 10

    # Scoring Configuration
    mandatory_threshold: float = 0.6
    default_threshold_penalty: float = 0.0
    lambda_strict: float = 0.0
    # 15% penalty per failed mandatory question
    scoring_static_penalty: float = 0.15
    # Default confidence when missing
    scoring_default_mandatory_confidence: float = 0.5
    # Default weight for questions with None weight
    scoring_default_weight: float = 0.5
    # Default confidence for missing suggestions
    scoring_default_confidence: float = 0.5
    scoring_analysis_timeout: int = 10  # Timeout in seconds for suggestion analysis
    scoring_llm_max_retries: int = 3  # Max retries for LLM calls in scoring

    # Form Field Mappings
    idea_form_title_question_id: str = (
        "D-Q01"  # Question ID for submission title in idea-sub-form
    )
    # Question ID for submission title in idea-sub-form
    idea_form_title_question_id: str = "D-Q01"

    # Text Enhancement Configuration
    enhancement_default_no_data_message: str = "No Data Extracted"
    enhancement_default_failed_message: str = (
        "Enhancement failed or returned no answer."
    )
    enhancement_max_user_text_length: int = 1000

    # Suggestions Coverage Configuration
    suggestions_coverage_max_user_text_length: int = 1000
    suggestions_coverage_max_suggestion_length: int = 5000

    # FAISS Configuration
    faiss_index_path: str = ""  # Path to precomputed FAISS index file (.index)
    faiss_metadata_path: str = ""  # Path to metadata parquet file (.parquet)
    faiss_enabled: bool = True  # Enable/disable FAISS service at startup
    faiss_use_s3: bool = True  # Download FAISS files from S3 if True
    # S3 key for FAISS index file (REQUIRED if faiss_enabled and faiss_use_s3)
    faiss_s3_index_key: str = ""
    faiss_s3_metadata_key: str = ""  # REQUIRED if faiss_enabled and faiss_use_s3
    # Local directory to cache downloaded files
    faiss_local_cache_dir: str = "./faiss_cache"

    # RPA Configuration
    # Note: Keep as string to avoid circular imports. Uses FormType enum values.
    rpa_supported_form_types: str = (
        "ai-registry-form,security-arch-form,dlo-form,wwtp-form,wwtp-new-vendor-form"
    )

    # CORS Configuration
    cors_allowed_origins: str = (
        "https://lilly-sage-ai.dev.bu.lilly.com, http://localhost:5173"
    )
    cors_allow_credentials: bool = True
    cors_allowed_methods: str = "GET,POST,PUT,DELETE,PATCH,OPTIONS"
    cors_allowed_headers: str = "Content-Type,Authorization,X-Trace-Id,X-WEBAUTH-EMAIL"
    cors_expose_headers: str = "X-Trace-Id"

    @property
    def cors_origins_list(self) -> list[str]:
        """Parse and return list of allowed CORS origins"""
        if self.cors_allowed_origins == "*":
            return ["*"]
        return [
            origin.strip()
            for origin in self.cors_allowed_origins.split(",")
            if origin.strip()
        ]

    @property
    def cors_methods_list(self) -> list[str]:
        """Parse and return list of allowed CORS methods"""
        if self.cors_allowed_methods == "*":
            return ["*"]
        return [
            method.strip()
            for method in self.cors_allowed_methods.split(",")
            if method.strip()
        ]

    @property
    def cors_headers_list(self) -> list[str]:
        """Parse and return list of allowed CORS headers"""
        if self.cors_allowed_headers == "*":
            return ["*"]
        return [
            header.strip()
            for header in self.cors_allowed_headers.split(",")
            if header.strip()
        ]

    @property
    def cors_expose_headers_list(self) -> list[str]:
        """Parse and return list of exposed CORS headers"""
        return [
            header.strip()
            for header in self.cors_expose_headers.split(",")
            if header.strip()
        ]

    @property
    def rpa_form_types_list(self) -> list[str]:
        """Parse and return list of RPA supported form types"""
        return [
            ft.strip() for ft in self.rpa_supported_form_types.split(",") if ft.strip()
        ]

    class Config:
        """Pydantic configuration"""

        env_file = os.getenv("ENV_FILE", ".env")
        extra = "allow"

        def __repr__(self):
            """String representation of config."""
            return f"<Config(env_file={self.env_file}, extra={self.extra})>"

        def to_dict(self):
            """Convert config to dictionary."""
            return {
                "env_file": self.env_file,
                "extra": self.extra,
            }


# Singleton instance for backward compatibility
settings = Settings()


# Dependency injection function with caching
@lru_cache()
def get_settings() -> Settings:
    """
    Dependency injection function for FastAPI routes.
    Uses lru_cache to ensure single instance (singleton pattern).

    Usage in FastAPI routes:
        @app.get("/endpoint")
        async def my_endpoint(settings: Annotated[Settings, Depends(get_settings)]):
            return {"model": settings.document_analysis_model}

    Usage in services:
        def my_service(settings: Settings = Depends(get_settings)):
            # Use settings here
            pass

    Benefits:
    - Easy testing (can override with app.dependency_overrides)
    - Explicit dependencies
    - Type-safe with IDE autocomplete
    - Single source of truth
    """
    return Settings()


# Type alias for cleaner dependency injection syntax
SettingsDep = Annotated[Settings, Depends(get_settings)]
