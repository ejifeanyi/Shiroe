# app/crud/notification.py
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc
from uuid import UUID

from app.crud.base import CRUDBase
from app.models.notification import Notification, NotificationType
from app.schemas.notification import NotificationCreate, NotificationUpdate


class CRUDNotification(CRUDBase[Notification, NotificationCreate, NotificationUpdate]):
    def get_multi_by_user(
        self, db: Session, *, user_id: UUID, skip: int = 0, limit: int = 100, include_read: bool = False
    ) -> List[Notification]:
        """Get all notifications for a specific user."""
        query = db.query(self.model).filter(self.model.user_id == user_id)
        if not include_read:
            query = query.filter(self.model.is_read == False)
        return query.order_by(desc(self.model.created_at)).offset(skip).limit(limit).all()

    def mark_as_read(self, db: Session, *, id: UUID) -> Notification:
        """Mark a specific notification as read."""
        notification = db.query(self.model).filter(self.model.id == id).first()
        if notification:
            notification.is_read = True
            db.commit()
            db.refresh(notification)
        return notification

    def mark_all_as_read(self, db: Session, *, user_id: UUID) -> int:
        """Mark all notifications for a user as read. Returns the number of notifications updated."""
        result = db.query(self.model).filter(
            self.model.user_id == user_id,
            self.model.is_read == False
        ).update({"is_read": True})
        db.commit()
        return result


notification = CRUDNotification(Notification)