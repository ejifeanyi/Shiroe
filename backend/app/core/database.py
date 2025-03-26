from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.types import TypeDecorator, CHAR
from sqlalchemy.dialects.postgresql import UUID
import uuid

from app.core.config import settings

class GUID(TypeDecorator):
    """Platform-independent GUID type with robust error handling."""
    impl = CHAR
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            return dialect.type_descriptor(UUID())
        else:
            return dialect.type_descriptor(CHAR(36))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        
        try:
            if isinstance(value, uuid.UUID):
                return str(value)
            
            if isinstance(value, str):
                value = value.strip("'\"")
                
                try:
                    parsed_uuid = uuid.UUID(value)
                    return str(parsed_uuid)
                except ValueError:
                    try:
                        return str(uuid.uuid5(uuid.NAMESPACE_DNS, value))
                    except Exception:
                        raise ValueError(f"Cannot convert value to UUID: {value}")
            
            return str(uuid.uuid4())
        
        except Exception as e:
            print(f"UUID Conversion Error: {e}")
            raise

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        
        try:
            return uuid.UUID(value) if value else None
        except Exception as e:
            print(f"UUID Result Conversion Error: {e}")
            return value
    
engine = create_engine(
    settings.SQLALCHEMY_DATABASE_URI,
    connect_args={"check_same_thread": False},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
