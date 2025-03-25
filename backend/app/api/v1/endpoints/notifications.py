# app/api/v1/endpoints/notifications.py
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.crud import notification as notification_crud
from app.models.user import User
from app.services.notification_service import check_for_approaching_deadlines
from app.schemas.notification import Notification

router = APIRouter()

@router.get("", response_model=List[Notification])
def read_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=1000),
    include_read: bool = False,
) -> Any:
    """
    Retrieve notifications for the current user.
    
    Parameters:
    - skip: Number of notifications to skip (for pagination)
    - limit: Maximum number of notifications to return
    - include_read: Whether to include read notifications
    """
    notifications = notification_crud.notification.get_multi_by_user(
        db=db, 
        user_id=current_user.id, 
        skip=skip, 
        limit=limit, 
        include_read=include_read
    )
    return notifications

@router.patch("/{notification_id}/read", response_model=Notification)
def mark_notification_as_read(
    notification_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Mark a specific notification as read.
    
    Returns:
    - The updated notification object
    """
    notification = notification_crud.notification.get(db=db, id=notification_id)
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Notification not found"
        )
    if notification.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Not enough permissions"
        )
    
    return notification_crud.notification.mark_as_read(db=db, id=notification_id)

@router.patch("/read-all", response_model=dict)
def mark_all_notifications_as_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Mark all unread notifications for the current user as read.
    
    Returns:
    - Object with count of marked notifications
    """
    count = notification_crud.notification.mark_all_as_read(
        db=db, 
        user_id=current_user.id
    )
    return {"message": f"Marked {count} notifications as read"}

@router.post("/check-deadlines", response_model=dict)
def manual_check_deadlines(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Manually trigger a check for approaching deadlines (Admin only).
    
    Note: This is typically handled by the scheduler.
    """
    # Add permission check if this should be admin-only
    background_tasks.add_task(check_for_approaching_deadlines, db)
    return {"message": "Deadline check scheduled"}