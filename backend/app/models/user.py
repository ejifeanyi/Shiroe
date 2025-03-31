import uuid
from sqlalchemy import Column, String, DateTime, Boolean, LargeBinary
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base, GUID

class User(Base):
    __tablename__ = "users"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    name = Column(String)
    bio = Column(String, nullable=True)
    profile_picture = Column(LargeBinary, nullable=True)
    profile_picture_type = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    projects = relationship("Project", back_populates="owner", cascade="all, delete-orphan")
