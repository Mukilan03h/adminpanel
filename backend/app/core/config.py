from __future__ import annotations

from functools import lru_cache

from pydantic import Field, computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings, loaded from environment / .env."""

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore", case_sensitive=False
    )

    # --- App ---
    app_name: str = "PeopleHub API"
    environment: str = "development"  # development | production | test
    debug: bool = True
    api_v1_prefix: str = "/api/v1"

    # --- Database ---
    # Full async SQLAlchemy URL, e.g. postgresql+asyncpg://user:pass@host:5432/db
    database_url: str = "postgresql+asyncpg://postgres@127.0.0.1:5432/peoplehub"
    db_echo: bool = False

    # --- Security / JWT ---
    # Generate with: python -c "import secrets; print(secrets.token_urlsafe(48))"
    secret_key: str = Field(default="CHANGE_ME_dev_only_secret_key_do_not_use_in_prod_000")
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 14
    mfa_token_expire_minutes: int = 5

    # Fernet key for encrypting TOTP secrets at rest (urlsafe base64, 32 bytes).
    # Generate with: python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
    mfa_encryption_key: str = Field(default="")

    # --- CORS ---
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:4173"]

    # --- Rate limiting ---
    rate_limit_login: str = "10/minute"
    rate_limit_default: str = "200/minute"

    # --- Email (dev: codes are logged / returned) ---
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    email_from: str = "no-reply@peoplehub.local"
    expose_dev_otp: bool = True  # in dev, return email OTP in the response for testing

    @computed_field  # type: ignore[prop-decorator]
    @property
    def is_production(self) -> bool:
        return self.environment == "production"

    @property
    def sync_database_url(self) -> str:
        """psycopg/sync URL for Alembic (strips the async driver)."""
        return (
            self.database_url.replace("+asyncpg", "")
            .replace("+aiosqlite", "")
            .replace("postgresql://", "postgresql+psycopg2://")
            if self.database_url.startswith("postgresql")
            else self.database_url.replace("+aiosqlite", "")
        )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
