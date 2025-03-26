from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_
import traceback
import logging

from app.api.deps import get_current_user
from app.core.database import get_db
from app.crud import project as project_crud
from app.models.user import User
from app.models.task import Task, TaskStatus, TaskPriority
from app.schemas.task import Task as TaskSchema

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

def calculate_priority_score(task: Task) -> float:
    """
    Calculate a comprehensive priority score for a task
    """
    priority_weights = {
        TaskPriority.URGENT: 10,
        TaskPriority.HIGH: 8,
        TaskPriority.MEDIUM: 5,
        TaskPriority.LOW: 2
    }
    priority_score = priority_weights.get(task.priority, 5)

    today = datetime.utcnow().date()
    if task.due_date:
        days_until_due = (task.due_date - today).days
        
        if days_until_due < 0:
            due_date_factor = 2 ** abs(days_until_due)
        else:
            due_date_factor = 1 / (1 + days_until_due)
    else:
        due_date_factor = 0.5

    age_factor = 1 + (datetime.utcnow() - task.created_at).days * 0.1

    return priority_score * due_date_factor * age_factor

@router.get("/", response_model=List[TaskSchema])
def get_prioritized_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    limit: int = 10
) -> List[TaskSchema]:
    """
    Retrieve and prioritize tasks across all projects
    """
    try:
        user_id = str(current_user.id)
        
        logger.info(f"Retrieving tasks for User ID: {user_id}")

        try:
            user_projects = project_crud.project.get_multi_by_owner(
                db=db, 
                owner_id=current_user.id
            )
            logger.info(f"User projects retrieved: {len(user_projects)}")
        except Exception as project_error:
            logger.error(f"Error retrieving user projects: {project_error}")
            logger.error(traceback.format_exc())
            raise HTTPException(status_code=500, detail="Error retrieving user projects")

        if not user_projects:
            logger.info("No projects found for the user")
            return []

        project_ids = [str(project.id) for project in user_projects]
        
        try:
            tasks = (
                db.query(Task)
                .filter(
                    and_(
                        Task.project_id.in_(project_ids),
                        Task.status != TaskStatus.DONE
                    )
                )
                .all()
            )
        except Exception as task_error:
            logger.error(f"Database query error: {task_error}")
            logger.error(traceback.format_exc())
            raise HTTPException(status_code=500, detail="Error retrieving tasks from database")

        logger.info(f"Total tasks retrieved: {len(tasks)}")

        prioritized_tasks = sorted(
            tasks, 
            key=calculate_priority_score, 
            reverse=True
        )

        for task in prioritized_tasks[:limit]:
            logger.info(f"Prioritized Task: {task.title}, Priority: {task.priority}, Due Date: {task.due_date}")

        return prioritized_tasks[:limit]

    except Exception as e:
        logger.error(f"Error in get_prioritized_tasks: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")