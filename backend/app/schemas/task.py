# app/schemas/task.py
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, UUID4

from app.models.task import TaskStatus, TaskPriority


class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: Optional[TaskStatus] = TaskStatus.TODO
    priority: Optional[TaskPriority] = TaskPriority.MEDIUM
    due_date: Optional[datetime] = None
    order: Optional[int] = 0


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
