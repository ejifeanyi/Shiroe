from datetime import timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Request
from app.core.rate_limiting import ip_limiter, user_limiter
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.database import get_db
from app.core.security import create_access_token, verify_reset_token
from app.crud import user as user_crud
from app.models.user import User
from app.schemas.token import Token
from app.schemas.user import UserOut as UserSchema, UserCreate
from app.schemas.email import PasswordResetRequest
from app.utils.email import send_reset_password_email

from sqlalchemy.ext.asyncio import AsyncSession


router = APIRouter()


@router.post("/signup", response_model=Token)
@ip_limiter.limit("5/minute")
async def create_user(
    request: Request,
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db),
) -> Any:
    user = await user_crud.user.get_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(status_code=400, detail="The user with this email already exists.")
    
    user = await user_crud.user.create(db, obj_in=user_in)
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(user.id, expires_delta=access_token_expires)
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=Token)
@user_limiter.limit("2/minute")
async def login_access_token(
    request: Request, 
    db: AsyncSession = Depends(get_db), 
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    user = await user_crud.user.authenticate(db, email=form_data.username, password=form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    if not user.is_active:
        raise HTTPException(status_code=401, detail="Inactive user")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": create_access_token(user.id, expires_delta=access_token_expires),
        "token_type": "bearer"
    }


@router.get("/me", response_model=UserSchema)
def read_users_me(
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get current user.
    """
    return current_user


@router.post("/forgot-password")
def forgot_password(
    request: PasswordResetRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
) -> Any:
    """
    Send a password reset email to the user.
    """
    user = user_crud.user.get_by_email(db, email=request.email)
    if not user:
        # Return a 200 even if user doesn't exist for security reasons
        return {"message": "If the email exists in our system, a password reset link has been sent."}
    
    # Generate reset token (usually with a shorter expiry than normal tokens)
    reset_token_expires = timedelta(minutes=settings.RESET_TOKEN_EXPIRE_MINUTES)
    reset_token = create_access_token(
        user.id, expires_delta=reset_token_expires, reset_password=True
    )
    
    # Send email with reset link
    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"
    background_tasks.add_task(
        send_reset_password_email, 
        email_to=user.email,
        username=user.name,
        reset_url=reset_url
    )
    
    return {"message": "If the email exists in our system, a password reset link has been sent."}


@router.post("/reset-password")
@user_limiter.limit("1/minute")
def reset_password(
    request: Request,
    token: str,
    new_password: str,
    db: Session = Depends(get_db),
) -> Any:
    """
    Reset the user's password using the reset token.
    """
    # Verify token and get user_id
    user_id = verify_reset_token(token)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
    
    # Update user's password
    user = user_crud.user.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    user_crud.user.update_password(db, user=user, new_password=new_password)
    
    return {"message": "Password has been reset successfully"}