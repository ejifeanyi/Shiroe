# app/models/notification.py
import uuid
from enum import Enum as PyEnum
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Enum, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base, GUID


class NotificationType(str, PyEnum):
    DEADLINE_APPROACHING = "deadline_approaching"
    TASK_ASSIGNED = "task_assigned"
    STATUS_CHANGE = "status_change"
    PRIORITY_CHANGE = "priority_change"


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    type = Column(Enum(NotificationType), nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Foreign keys
    user_id = Column(GUID(), ForeignKey("users.id"))
    task_id = Column(GUID(), ForeignKey("tasks.id"), nullable=True)
    project_id = Column(GUID(), ForeignKey("projects.id"), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="notifications")
    task = relationship("Task")
    project = relationship("Project")