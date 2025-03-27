# app/core/config.py
import os
from typing import List, Optional

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

    REDIS_HOST: str = "redis://default:SjeFlGHPFuuAw4j5R2xwtEbPYb44eUuE@redis-19106.c246.us-east-1-4.ec2.redns.redis-cloud.com:19106" 
    REDIS_PORT: int = 6379  # Standard Redis port
    REDIS_PASSWORD: Optional[str] = None  # Password if required
    
    # Frontend URL for reset links
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")

    # Database settings
    # Default to SQLite for development
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./shiroe.db")
    SQLALCHEMY_DATABASE_URI: str = DATABASE_URL

    TIMEZONE: str = "UTC"
    
    # Email settings with updated field names
    MAIL_USERNAME: str = "test@example.com"
    MAIL_PASSWORD: str = "password"
    MAIL_FROM: str = "test@example.com"
    MAIL_PORT: int = 587
    MAIL_SERVER: str = "smtp.example.com"
    # Updated field names for fastapi-mail
    MAIL_STARTTLS: bool = "true"
    MAIL_SSL_TLS: bool = "true"
    MAIL_USE_CREDENTIALS: bool = "true"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()