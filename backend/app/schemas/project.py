# app/schemas/project.py
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, UUID4


class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    deadline: Optional[datetime] = None


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(ProjectBase):
    name: Optional[str] = None


class ProjectInDBBase(ProjectBase):
    id: UUID4
    owner_id: UUID4
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True  # Updated from orm_mode = True


class Project(ProjectInDBBase):
    pass


class ProjectWithTaskCount(Project):
    total_tasks: int
    completed_tasks: int