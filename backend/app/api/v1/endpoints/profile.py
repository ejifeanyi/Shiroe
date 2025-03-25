from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.crud import user as user_crud
from app.models.user import User
from app.schemas.user import UserOut, UserProfileUpdate

router = APIRouter()

@router.get("", response_model=UserOut)
def get_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get current user profile"""
    db_user = user_crud.user.get(db, id=current_user.id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Generate profile picture URL if exists
    profile_data = db_user.__dict__
    if db_user.profile_picture:
        profile_data["profile_picture_url"] = f"/api/v1/profile/picture/{db_user.id}"
    return profile_data

@router.put("", response_model=UserOut)
def update_user_profile(
    profile_update: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update user profile information"""
    update_data = profile_update.dict(exclude_unset=True)
    
    if update_data.get("remove_picture"):
        update_data["profile_picture"] = None
        update_data["profile_picture_type"] = None
    
    db_user = user_crud.user.update(db, db_obj=current_user, obj_in=update_data)
    return db_user

@router.post("/picture", response_model=UserOut)
async def upload_profile_picture(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Upload profile picture"""
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    contents = await file.read()
    update_data = {
        "profile_picture": contents,
        "profile_picture_type": file.content_type
    }
    
    db_user = user_crud.user.update(db, db_obj=current_user, obj_in=update_data)
    return db_user

@router.get("/picture/{user_id}")
def get_profile_picture(
    user_id: str,
    db: Session = Depends(get_db),
):
    """Get user profile picture"""
    user = user_crud.user.get(db, id=user_id)
    if not user or not user.profile_picture:
        raise HTTPException(status_code=404, detail="Profile picture not found")
    
    return Response(
        content=user.profile_picture,
        media_type=user.profile_picture_type or "image/jpeg"
    )