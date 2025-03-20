# app/schemas/task.py
from typing import Optional, List
from datetime import datetime, date
from pydantic import BaseModel, UUID4, validator

from app.models.task import TaskStatus, TaskPriority


class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: Optional[TaskStatus] = TaskStatus.TODO
    priority: Optional[TaskPriority] = TaskPriority.MEDIUM
    due_date: Optional[date] = None  # Changed from datetime to date
    order: Optional[int] = 0

    # Add a validator to convert string dates to date objects
    @validator("due_date", pre=True)
    def parse_due_date(cls, value):
        if isinstance(value, str):
            # Handle ISO format with timezone
            if "T" in value:
                # Parse the datetime then extract just the date part
                if value.endswith("Z"):
                    value = value[:-1]  # Remove the 'Z'
                    value += "+00:00"  # Add UTC timezone in ISO format
                dt = datetime.fromisoformat(value)
                return dt.date()  # Extract just the date
            else:
                # It's already a date string (YYYY-MM-DD)
                return date.fromisoformat(value)
        elif isinstance(value, datetime):
            return value.date()  # Extract just the date from datetime
        return value


class TaskCreate(TaskBase):
    project_id: UUID4
    parent_task_id: Optional[UUID4] = None


class TaskUpdate(TaskBase):
    title: Optional[str] = None
    project_id: Optional[UUID4] = None
    parent_task_id: Optional[UUID4] = None


class TaskInDBBase(TaskBase):
    id: UUID4
    project_id: UUID4
    parent_task_id: Optional[UUID4] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True


class Task(TaskInDBBase):
    pass


class TaskWithSubtasks(Task):
    subtasks: List["TaskWithSubtasks"] = []


TaskWithSubtasks.update_forward_refs()
