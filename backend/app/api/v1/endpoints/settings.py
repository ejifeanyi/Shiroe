from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.crud import user as user_crud
from app.models.user import User
from app.schemas.user import UserOut, UserUpdate  # Changed from User to UserOut

router = APIRouter()

@router.put("/account", response_model=UserOut)  # Changed response_model
def update_account_settings(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update account settings (email, password)"""
    update_data = user_update.dict(exclude_unset=True)
    
    # Password change requires current password
    if update_data.get("password"):
        if not user_update.current_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is required to change password"
            )
        
        if not user_crud.user.authenticate(
            db, email=current_user.email, password=user_update.current_password
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect"
            )
    
    db_user = user_crud.user.update(db, db_obj=current_user, obj_in=update_data)
    return db_user

@router.put("/notifications", response_model=dict)
def update_notification_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update notification settings"""
    # Implement notification preferences here
    return {"message": "Notification settings updated"}