import uuid
from enum import Enum as PyEnum
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Enum, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class TaskStatus(str, PyEnum):
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    DONE = "done"


class TaskPriority(str, PyEnum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class Task(Base):
    __tablename__ = "tasks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    description = Column(Text)
    status = Column(Enum(TaskStatus), default=TaskStatus.TODO)
    priority = Column(Enum(TaskPriority), default=TaskPriority.MEDIUM)
    due_date = Column(DateTime(timezone=True))
    order = Column(Integer, default=0)  # For manual ordering of tasks
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Foreign keys
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"))
    parent_task_id = Column(UUID(as_uuid=True), ForeignKey("tasks.id"), nullable=True)

    # Relationships
    project = relationship("Project", back_populates="tasks")
    parent_task = relationship("Task", remote_side=[id], backref="subtasks")
