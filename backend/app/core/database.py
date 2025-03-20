# app/core/database.py
from supabase import create_client, Client
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

# Create Supabase client for API access
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

# Create SQLAlchemy engine for direct database access
# SSL required for Supabase PostgreSQL
engine = create_engine(
    str(settings.SQLALCHEMY_DATABASE_URI),
    pool_pre_ping=True,  # Added for connection health checks
    connect_args={"sslmode": "require"},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
