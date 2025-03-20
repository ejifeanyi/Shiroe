import os
from typing import Any, Dict, Optional

from pydantic import BaseSettings, PostgresDsn, validator


class Settings(BaseSettings):
    PROJECT_NAME: str = "Shiroe"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "supersecretkey")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days

    # Supabase Database settings
    SUPABASE_URL: str = os.getenv("SUPABASE_URL")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY")
    SUPABASE_DB_HOST: str = os.getenv("SUPABASE_DB_HOST")
    SUPABASE_DB_PORT: str = os.getenv("SUPABASE_DB_PORT", "5432")
    SUPABASE_DB_USER: str = os.getenv("SUPABASE_DB_USER")
    SUPABASE_DB_PASSWORD: str = os.getenv("SUPABASE_DB_PASSWORD")
    SUPABASE_DB_NAME: str = os.getenv("SUPABASE_DB_NAME", "postgres")

    # For direct database connection with SQLAlchemy
    SQLALCHEMY_DATABASE_URI: Optional[PostgresDsn] = None

    @validator("SQLALCHEMY_DATABASE_URI", pre=True)
    def assemble_db_connection(cls, v: Optional[str], values: Dict[str, Any]) -> Any:
        if isinstance(v, str):
            return v
        return PostgresDsn.build(
            scheme="postgresql",
            user=values.get("SUPABASE_DB_USER"),
            password=values.get("SUPABASE_DB_PASSWORD"),
            host=values.get("SUPABASE_DB_HOST"),
            port=values.get("SUPABASE_DB_PORT"),
            path=f"/{values.get('SUPABASE_DB_NAME') or ''}",
        )

    # CORS settings
    BACKEND_CORS_ORIGINS: list = ["*"]  # For development, restrict this in production

    class Config:
        env_file = ".env"


settings = Settings()
