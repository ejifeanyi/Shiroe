# app/core/config.py
import os
from typing import List

# Update this import
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Shiroe"
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8080"]

    # Security
    SECRET_KEY: str = os.getenv(
        "SECRET_KEY", "d2181484eab576e2d5b36c520808eeb21110b1b1cffeb22bcbb317fd54535331"
    )
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 11520  # 8 days

    # Database settings
    # Default to SQLite for development
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./shiroe.db")

    # For compatibility with existing code
    SQLALCHEMY_DATABASE_URI: str = DATABASE_URL

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
