import os
from pydantic import field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict
from typing import Annotated, List


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Greenwood Academy ERP"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Server
    PORT: int = 8000

    # Database — must be set via environment variable in production
    DATABASE_URL: str = "postgresql://erp_user:erp_password@localhost:5432/school_erp"

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def parse_database_url(cls, value):
        # Supabase / Render sometimes return postgres:// — normalise to postgresql://
        if isinstance(value, str) and value.startswith("postgres://"):
            return value.replace("postgres://", "postgresql://", 1)
        return value

    # JWT
    SECRET_KEY: str = "your-super-secret-jwt-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS — set ALLOWED_ORIGINS env var to comma-separated list in production
    # e.g. "https://your-app.vercel.app,https://www.yourdomain.com"
    ALLOWED_ORIGINS: Annotated[List[str], NoDecode] = [
        "http://localhost:5173",
        "http://localhost:3000",
    ]

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_allowed_origins(cls, value):
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()

