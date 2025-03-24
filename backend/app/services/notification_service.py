# app/services/notification_service.py
from datetime import datetime, timedelta
from typing import List, Optional
from sqlalchemy.orm import Session

from app.models.notification import NotificationType
from app.models.task import Task, TaskPriority, TaskStatus
from app.schemas.notification import NotificationCreate
from app.crud import notification as notification_crud, task as task_crud


def create_task_deadline_notification(
    db: Session, task: Task, user_id, days_before: int = 1
) -> Optional[NotificationCreate]:
    """Create a notification for a task with an approaching deadline."""
    if not task.due_date:
        return None

    task_due_date = task.due_date
    if isinstance(task_due_date, datetime):
        task_due_date = task_due_date.date()
    
    # Calculate days until the deadline
    days_until_due = (task_due_date - datetime.now().date()).days
    
    # Only create notification if deadline is approaching based on the days_before parameter
    if days_until_due == days_before:
        priority_text = task.priority.value.capitalize()
        status_text = task.status.value.replace("_", " ").capitalize()
        
        title = f"Task Deadline Approaching: {task.title}"
        message = (
            f"Your task is due in {days_before} day(s). "
            f"Priority: {priority_text}, Status: {status_text}, "
            f"Project: {task.project.name}"
        )
        
        notification_data = {
            "title": title,
            "message": message,
            "type": NotificationType.DEADLINE_APPROACHING,
            "user_id": user_id,
            "task_id": task.id,
            "project_id": task.project_id,
        }
        
        return NotificationCreate(**notification_data)
    
    return None


def check_for_approaching_deadlines(db: Session, days_before: List[int] = [1, 3, 7]) -> int:
    """
    Check all active tasks for approaching deadlines and create notifications.
    Returns the number of notifications created.
    """
    notifications_created = 0
    
    # Get all active tasks with due dates
    tasks = db.query(Task).filter(
        Task.due_date.isnot(None),
        Task.status != TaskStatus.DONE
    ).all()
    
    for task in tasks:
        # Get the project owner
        user_id = task.project.owner_id
        
        # Check for each notification threshold (e.g., 1 day, 3 days, 7 days)
        for days in days_before:
            notification_data = create_task_deadline_notification(
                db=db, task=task, user_id=user_id, days_before=days
            )
            
            if notification_data:
                # Check if a similar notification already exists to avoid duplicates
                existing = db.query(notification_crud.notification.model).filter(
                    notification_crud.notification.model.task_id == task.id,
                    notification_crud.notification.model.type == NotificationType.DEADLINE_APPROACHING,
                    notification_crud.notification.model.created_at >= datetime.now() - timedelta(hours=24)
                ).first()
                
                if not existing:
                    notification_crud.notification.create(db=db, obj_in=notification_data)
                    notifications_created += 1
    
    return notifications_created