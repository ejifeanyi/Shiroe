from typing import Optional
from pydantic import BaseModel, EmailStr, UUID4, Field
from datetime import datetime

class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    bio: Optional[str] = Field(None, max_length=500)
    is_active: Optional[bool] = True

class UserCreate(UserBase):
    email: EmailStr
    password: str

class UserUpdate(UserBase):
    password: Optional[str] = None
    current_password: Optional[str] = None

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = Field(None, max_length=500)
    profile_picture: Optional[str] = None
    remove_picture: Optional[bool] = False

class UserInDBBase(UserBase):
    id: UUID4
    created_at: datetime
    updated_at: datetime
    profile_picture_url: Optional[str] = None

    class Config:
        from_attributes = True

class UserOut(UserInDBBase):
    pass

class UserInDB(UserInDBBase):
    password_hash: str