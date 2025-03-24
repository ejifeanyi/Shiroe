# app/core/config.py
import os
from typing import List

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Shiroe"
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8000"]

    # Security
    SECRET_KEY: str = os.getenv(
        "SECRET_KEY", "d2181484eab576e2d5b36c520808eeb21110b1b1cffeb22bcbb317fd54535331"
    )
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 11520  # 8 days
    ALGORITHM: str = "HS256"
    
    # Reset token settings
    RESET_TOKEN_EXPIRE_MINUTES: int = 15
    
    # Frontend URL for reset links
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")

    # Database settings
    # Default to SQLite for development
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./shiroe.db")
    SQLALCHEMY_DATABASE_URI: str = DATABASE_URL

    TIMEZONE: str = "UTC"
    
    # Email settings with updated field names
    MAIL_USERNAME: str = os.getenv("MAIL_USERNAME", "")
    MAIL_PASSWORD: str = os.getenv("MAIL_PASSWORD", "")
    MAIL_FROM: str = os.getenv("MAIL_FROM", "noreply@example.com")
    MAIL_PORT: int = int(os.getenv("MAIL_PORT", "587"))
    MAIL_SERVER: str = os.getenv("MAIL_SERVER", "smtp.gmail.com")
    # Updated field names for fastapi-mail
    MAIL_STARTTLS: bool = os.getenv("MAIL_STARTTLS", "True").lower() == "true"
    MAIL_SSL_TLS: bool = os.getenv("MAIL_SSL_TLS", "False").lower() == "true"
    MAIL_USE_CREDENTIALS: bool = os.getenv("MAIL_USE_CREDENTIALS", "True").lower() == "true"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()