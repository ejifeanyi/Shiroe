# app/api/v1/endpoints/dashboard.py
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Union
from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.api.deps import get_current_user
from app.core.database import get_db
from app.crud import task as task_crud
from app.crud import project as project_crud
from app.models.task import Task, TaskStatus, TaskPriority
from app.models.project import Project
from app.models.user import User

router = APIRouter()


# Pydantic models for response serialization
class TaskResponse(BaseModel):
    id: Union[str, UUID]
    title: str
    description: Optional[str] = None
    status: TaskStatus
    priority: TaskPriority
    due_date: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        arbitrary_types_allowed = True


class ProjectWithTaskCounts(BaseModel):
    id: Union[str, UUID]
    name: str
    task_count: int

    class Config:
        from_attributes = True
        arbitrary_types_allowed = True


class DashboardResponse(BaseModel):
    recent_projects: List[ProjectWithTaskCounts]
    today_tasks: List[TaskResponse]
    overdue_tasks: List[TaskResponse]
    upcoming_tasks: List[TaskResponse]
    stats: Dict[str, Any]


def convert_sqlalchemy_model(obj):
    """Convert a SQLAlchemy model to a dict, handling special types like UUID."""
    result = {}
    for key, value in obj.__dict__.items():
        if key.startswith('_'):
            continue  # Skip SQLAlchemy internal attributes
        if isinstance(value, UUID):
            result[key] = str(value)  # Convert UUID to string
        else:
            result[key] = value
    return result


@router.get("/", response_model=DashboardResponse)
async def get_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get dashboard overview data.
    """
    # Get projects with task counts
    projects = await project_crud.project.get_projects_with_task_counts(
        db=db, owner_id=current_user.id, limit=5
    )
    
    # Get today's tasks
    today = datetime.utcnow().date()
    tomorrow = today + timedelta(days=1)
    
    today_query = (
        select(Task)
        .join(Task.project)
        .where(
            Project.owner_id == current_user.id,
            Task.status != TaskStatus.DONE,
            Task.due_date >= today,
            Task.due_date < tomorrow,
        )
    )
    result = await db.execute(today_query)
    today_tasks = result.scalars().all()

    # Get overdue tasks
    overdue_query = (
        select(Task)
        .join(Task.project)
        .where(
            Project.owner_id == current_user.id,
            Task.status != TaskStatus.DONE,
            Task.due_date < today,
        )
    )
    result = await db.execute(overdue_query)
    overdue_tasks = result.scalars().all()

    # Get upcoming tasks (next 7 days)
    next_week = today + timedelta(days=7)
    upcoming_query = (
        select(Task)
        .join(Task.project)
        .where(
            Project.owner_id == current_user.id,
            Task.status != TaskStatus.DONE,
            Task.due_date >= tomorrow,
            Task.due_date <= next_week,
        )
        .order_by(Task.due_date)
    )
    result = await db.execute(upcoming_query)
    upcoming_tasks = result.scalars().all()

    # Get total stats
    total_projects_query = (
        select(func.count())
        .select_from(Project)
        .where(Project.owner_id == current_user.id)
    )
    result = await db.execute(total_projects_query)
    total_projects = result.scalar()

    total_tasks_query = (
        select(func.count())
        .select_from(Task)
        .join(Task.project)
        .where(Project.owner_id == current_user.id)
    )
    result = await db.execute(total_tasks_query)
    total_tasks = result.scalar()

    completed_tasks_query = (
        select(func.count())
        .select_from(Task)
        .join(Task.project)
        .where(
            Project.owner_id == current_user.id,
            Task.status == TaskStatus.DONE,
        )
    )
    result = await db.execute(completed_tasks_query)
    completed_tasks = result.scalar()

    # Convert SQLAlchemy models to Pydantic-compatible dicts
    today_tasks_dicts = [convert_sqlalchemy_model(task) for task in today_tasks]
    overdue_tasks_dicts = [convert_sqlalchemy_model(task) for task in overdue_tasks]
    upcoming_tasks_dicts = [convert_sqlalchemy_model(task) for task in upcoming_tasks]
    
    # Create Pydantic models from dicts
    today_tasks_response = [TaskResponse(**task_dict) for task_dict in today_tasks_dicts]
    overdue_tasks_response = [TaskResponse(**task_dict) for task_dict in overdue_tasks_dicts]
    upcoming_tasks_response = [TaskResponse(**task_dict) for task_dict in upcoming_tasks_dicts]

    # Prepare the response
    return DashboardResponse(
        recent_projects=[
            ProjectWithTaskCounts(
                id=project["id"],
                name=project["name"],
                task_count=project["total_tasks"]  # Use total_tasks as the task_count
            )
            for project in projects
        ],
        today_tasks=today_tasks_response,
        overdue_tasks=overdue_tasks_response,
        upcoming_tasks=upcoming_tasks_response,
        stats={
            "total_projects": total_projects,
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "completion_rate": round(completed_tasks / total_tasks * 100, 1)
            if total_tasks > 0
            else 0,
        },
    )