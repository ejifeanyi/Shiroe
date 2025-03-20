# app/api/v1/endpoints/dashboard.py
from datetime import datetime, timedelta
from typing import Any, Dict

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.crud import task as task_crud
from app.crud import project as project_crud
from app.models.task import TaskStatus
from app.models.user import User

router = APIRouter()


@router.get("/", response_model=Dict[str, Any])
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get dashboard overview data.
    """
    # Get projects with task counts
    projects = project_crud.project.get_projects_with_task_counts(
        db=db, owner_id=current_user.id, limit=5
    )

    # Get today's tasks
    today = datetime.utcnow().date()
    tomorrow = today + timedelta(days=1)
    today_tasks = (
        db.query(task_crud.task.model)
        .join(task_crud.task.model.project)
        .filter(
            task_crud.task.model.project.has(owner_id=current_user.id),
            task_crud.task.model.status != TaskStatus.DONE,
            task_crud.task.model.due_date >= today,
            task_crud.task.model.due_date < tomorrow,
        )
        .all()
    )

    # Get overdue tasks
    overdue_tasks = (
        db.query(task_crud.task.model)
        .join(task_crud.task.model.project)
        .filter(
            task_crud.task.model.project.has(owner_id=current_user.id),
            task_crud.task.model.status != TaskStatus.DONE,
            task_crud.task.model.due_date < today,
        )
        .all()
    )

    # Get upcoming tasks (next 7 days)
    next_week = today + timedelta(days=7)
    upcoming_tasks = (
        db.query(task_crud.task.model)
        .join(task_crud.task.model.project)
        .filter(
            task_crud.task.model.project.has(owner_id=current_user.id),
            task_crud.task.model.status != TaskStatus.DONE,
            task_crud.task.model.due_date >= tomorrow,
            task_crud.task.model.due_date <= next_week,
        )
        .order_by(task_crud.task.model.due_date)
        .all()
    )

    # Get total stats
    total_projects = (
        db.query(project_crud.project.model)
        .filter(project_crud.project.model.owner_id == current_user.id)
        .count()
    )

    total_tasks = (
        db.query(task_crud.task.model)
        .join(task_crud.task.model.project)
        .filter(task_crud.task.model.project.has(owner_id=current_user.id))
        .count()
    )

    completed_tasks = (
        db.query(task_crud.task.model)
        .join(task_crud.task.model.project)
        .filter(
            task_crud.task.model.project.has(owner_id=current_user.id),
            task_crud.task.model.status == TaskStatus.DONE,
        )
        .count()
    )

    # Prepare the response
    return {
        "recent_projects": projects,
        "today_tasks": today_tasks,
        "overdue_tasks": overdue_tasks,
        "upcoming_tasks": upcoming_tasks,
        "stats": {
            "total_projects": total_projects,
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "completion_rate": round(completed_tasks / total_tasks * 100, 1)
            if total_tasks > 0
            else 0,
        },
    }


@router.get("/analytics", response_model=Dict[str, Any])
def get_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    days: int = 30,
) -> Any:
    """
    Get analytics data for the last X days.
    """
    today = datetime.utcnow().date()
    start_date = today - timedelta(days=days)

    # Get tasks completed in the time period
    completed_tasks = (
        db.query(task_crud.task.model)
        .join(task_crud.task.model.project)
        .filter(
            task_crud.task.model.project.has(owner_id=current_user.id),
            task_crud.task.model.status == TaskStatus.DONE,
            task_crud.task.model.updated_at >= start_date,
        )
        .all()
    )

    # Get tasks created in the time period
    created_tasks = (
        db.query(task_crud.task.model)
        .join(task_crud.task.model.project)
        .filter(
            task_crud.task.model.project.has(owner_id=current_user.id),
            task_crud.task.model.created_at >= start_date,
        )
        .all()
    )

    # Count tasks by priority
    priority_counts = {
        "urgent": 0,
        "high": 0,
        "medium": 0,
        "low": 0,
    }

    for task in created_tasks:
        priority_counts[task.priority.value] += 1

    # Calculate completion rate
    completion_rate = (
        len(completed_tasks) / len(created_tasks) * 100 if created_tasks else 0
    )

    return {
        "period_days": days,
        "completed_tasks": len(completed_tasks),
        "created_tasks": len(created_tasks),
        "completion_rate": round(completion_rate, 1),
        "priority_distribution": priority_counts,
    }
