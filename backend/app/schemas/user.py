# app/schemas/user.py
from typing import Optional
from pydantic import BaseModel, EmailStr, UUID4


class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    is_active: Optional[bool] = True


class UserCreate(UserBase):
    email: EmailStr
    password: str


class UserUpdate(UserBase):
    password: Optional[str] = None


class UserInDBBase(UserBase):
    id: UUID4

    class Config:
        orm_mode = True


class User(UserInDBBase):
    pass


class UserInDB(UserInDBBase):
    password_hash: str
