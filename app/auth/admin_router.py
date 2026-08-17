"""
Admin endpoints — user, group and permission management.
Only accessible by superadmin.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.admin_schemas import (
    UserCreate, UserUpdate, UserRead,
    GroupCreate, GroupUpdate, GroupRead,
    PermissionCreate, PermissionRead,
    AddUserToGroup,
)
from app.auth.dependencies import get_current_user
from app.auth.hashing import hash_password
from app.core.auth_database import get_auth_db
from app.core.config import settings
from app.models.user import User, Group, UserGroup, Permission

router = APIRouter(prefix="/admin", tags=["Admin"])


def require_superadmin(current_user: dict = Depends(get_current_user)):
    if current_user["username"] != settings.superadmin_username:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only superadmin can access this endpoint",
        )
    return current_user


# ─── USERS ────────────────────────────────────────────────

@router.get("/users", response_model=list[UserRead])
def list_users(
    db: Session = Depends(get_auth_db),
    _: dict = Depends(require_superadmin),
):
    users = db.query(User).all()
    result = []
    for user in users:
        group_names = [ug.group.name for ug in user.groups]
        user_data = UserRead(
            id=user.id,
            username=user.username,
            email=user.email,
            is_active=user.is_active,
            created_at=user.created_at,
            groups=group_names,
        )
        result.append(user_data)
    return result


@router.post("/users", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def create_user(
    data: UserCreate,
    db: Session = Depends(get_auth_db),
    _: dict = Depends(require_superadmin),
):
    existing = db.query(User).filter(
        (User.username == data.username) | (User.email == data.email)
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already exists",
        )

    user = User(
        username=data.username,
        email=data.email,
        hashed_password=hash_password(data.password),
        is_active=data.is_active,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return UserRead(
        id=user.id,
        username=user.username,
        email=user.email,
        is_active=user.is_active,
        created_at=user.created_at,
        groups=[],
    )


@router.patch("/users/{user_id}", response_model=UserRead)
def update_user(
    user_id: int,
    data: UserUpdate,
    db: Session = Depends(get_auth_db),
    _: dict = Depends(require_superadmin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if data.email is not None:
        user.email = data.email
    if data.password is not None:
        user.hashed_password = hash_password(data.password)
    if data.is_active is not None:
        user.is_active = data.is_active

    db.commit()
    db.refresh(user)
    group_names = [ug.group.name for ug in user.groups]
    return UserRead(
        id=user.id,
        username=user.username,
        email=user.email,
        is_active=user.is_active,
        created_at=user.created_at,
        groups=group_names,
    )


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_auth_db),
    _: dict = Depends(require_superadmin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()


# ─── GROUPS ───────────────────────────────────────────────

@router.get("/groups", response_model=list[GroupRead])
def list_groups(
    db: Session = Depends(get_auth_db),
    _: dict = Depends(require_superadmin),
):
    return db.query(Group).all()


@router.post("/groups", response_model=GroupRead, status_code=status.HTTP_201_CREATED)
def create_group(
    data: GroupCreate,
    db: Session = Depends(get_auth_db),
    _: dict = Depends(require_superadmin),
):
    existing = db.query(Group).filter(Group.name == data.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Group name already exists")

    group = Group(name=data.name, description=data.description)
    db.add(group)
    db.commit()
    db.refresh(group)
    return group


@router.patch("/groups/{group_id}", response_model=GroupRead)
def update_group(
    group_id: int,
    data: GroupUpdate,
    db: Session = Depends(get_auth_db),
    _: dict = Depends(require_superadmin),
):
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    if data.name is not None:
        group.name = data.name
    if data.description is not None:
        group.description = data.description

    db.commit()
    db.refresh(group)
    return group


@router.delete("/groups/{group_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_group(
    group_id: int,
    db: Session = Depends(get_auth_db),
    _: dict = Depends(require_superadmin),
):
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    db.delete(group)
    db.commit()


# ─── GROUP MEMBERS ─────────────────────────────────────────

@router.post("/groups/{group_id}/users", status_code=status.HTTP_201_CREATED)
def add_user_to_group(
    group_id: int,
    data: AddUserToGroup,
    db: Session = Depends(get_auth_db),
    _: dict = Depends(require_superadmin),
):
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    user = db.query(User).filter(User.id == data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    existing = db.query(UserGroup).filter(
        UserGroup.user_id == data.user_id,
        UserGroup.group_id == group_id,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already in this group")

    db.add(UserGroup(user_id=data.user_id, group_id=group_id))
    db.commit()
    return {"success": True, "message": f"User added to group"}


@router.delete("/groups/{group_id}/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_user_from_group(
    group_id: int,
    user_id: int,
    db: Session = Depends(get_auth_db),
    _: dict = Depends(require_superadmin),
):
    link = db.query(UserGroup).filter(
        UserGroup.user_id == user_id,
        UserGroup.group_id == group_id,
    ).first()
    if not link:
        raise HTTPException(status_code=404, detail="User not in this group")
    db.delete(link)
    db.commit()


# ─── PERMISSIONS ───────────────────────────────────────────

@router.get("/groups/{group_id}/permissions", response_model=list[PermissionRead])
def list_permissions(
    group_id: int,
    db: Session = Depends(get_auth_db),
    _: dict = Depends(require_superadmin),
):
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    return db.query(Permission).filter(Permission.group_id == group_id).all()


@router.post("/groups/{group_id}/permissions", response_model=PermissionRead, status_code=status.HTTP_201_CREATED)
def add_permission(
    group_id: int,
    data: PermissionCreate,
    db: Session = Depends(get_auth_db),
    _: dict = Depends(require_superadmin),
):
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    existing = db.query(Permission).filter(
        Permission.group_id == group_id,
        Permission.endpoint == data.endpoint,
        Permission.method == data.method,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Permission already exists for this group")

    permission = Permission(
        group_id=group_id,
        endpoint=data.endpoint,
        method=data.method,
    )
    db.add(permission)
    db.commit()
    db.refresh(permission)
    return permission


@router.delete("/permissions/{permission_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_permission(
    permission_id: int,
    db: Session = Depends(get_auth_db),
    _: dict = Depends(require_superadmin),
):
    permission = db.query(Permission).filter(Permission.id == permission_id).first()
    if not permission:
        raise HTTPException(status_code=404, detail="Permission not found")
    db.delete(permission)
    db.commit()


# ─── AVAILABLE ENDPOINTS ───────────────────────────────────

@router.get("/endpoints")
def list_available_endpoints(
    _: dict = Depends(require_superadmin),
):
    """
    Returns all available API endpoints that can be assigned as permissions.
    """
    return {
        "success": True,
        "data": [
            {"endpoint": "/warehouse/items", "method": "GET", "description": "Item master data"},
            {"endpoint": "/requisitions", "method": "GET", "description": "Purchase requisitions"},
            {"endpoint": "/bme/purchase-order", "method": "GET", "description": "Purchase order header"},
            {"endpoint": "/commercial/lc-items", "method": "GET", "description": "LC item register"},
            {"endpoint": "/vendor-bids", "method": "GET", "description": "Vendor bid items"},
        ]
    }