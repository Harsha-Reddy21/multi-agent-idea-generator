from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    openai_api_key: str = ""
    openai_model: str = "gpt-4o"
    app_host: str = "0.0.0.0"
    app_port: int = 8000
    frontend_url: str = "http://localhost:5173"

    # Scoring constants (from Sage AI)
    mandatory_threshold: float = 0.6
    static_penalty: float = 0.15
    default_weight: float = 1.0
    default_mandatory_confidence: float = 0.5
    coverage_accept_threshold: float = 0.7

    class Config:
        env_file = ".env"


settings = Settings()
