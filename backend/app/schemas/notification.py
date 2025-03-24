# app/schemas/notification.py
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, UUID4

from app.models.notification import NotificationType


class NotificationBase(BaseModel):
    title: str
    message: str
    type: NotificationType
    is_read: bool = False


class NotificationCreate(NotificationBase):
    user_id: UUID4
    task_id: Optional[UUID4] = None
    project_id: Optional[UUID4] = None


class NotificationUpdate(BaseModel):
    is_read: Optional[bool] = None


class NotificationInDBBase(NotificationBase):
    id: UUID4
    user_id: UUID4
    task_id: Optional[UUID4] = None
    project_id: Optional[UUID4] = None
    created_at: datetime

    class Config:
        orm_mode = True


class Notification(NotificationInDBBase):
    pass


class NotificationWithDetails(Notification):
    task_title: Optional[str] = None
    project_name: Optional[str] = None
    task_priority: Optional[str] = None
    task_status: Optional[str] = None
    task_due_date: Optional[datetime] = None