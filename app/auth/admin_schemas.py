"""
Pydantic schemas for admin user, group and permission management.
"""

from datetime import datetime
from pydantic import BaseModel


# --- User schemas ---

class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    is_active: bool = True


class UserUpdate(BaseModel):
    email: str | None = None
    password: str | None = None
    is_active: bool | None = None


class UserRead(BaseModel):
    id: int
    username: str
    email: str
    is_active: bool
    created_at: datetime
    groups: list[str] = []

    class Config:
        from_attributes = True


# --- Group schemas ---

class GroupCreate(BaseModel):
    name: str
    description: str | None = None


class GroupUpdate(BaseModel):
    name: str | None = None
    description: str | None = None


class GroupRead(BaseModel):
    id: int
    name: str
    description: str | None
    created_at: datetime

    class Config:
        from_attributes = True


# --- Permission schemas ---

class PermissionCreate(BaseModel):
    endpoint: str
    method: str = "GET"


class PermissionRead(BaseModel):
    id: int
    group_id: int
    endpoint: str
    method: str

    class Config:
        from_attributes = True


# --- User group schemas ---

class AddUserToGroup(BaseModel):
    user_id: int