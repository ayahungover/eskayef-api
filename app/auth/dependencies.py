"""
FastAPI dependencies for authentication and permission-based access control.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.orm import Session

from app.auth.jwt import decode_access_token
from app.core.auth_database import get_auth_db
from app.core.config import settings
from app.models.user import User, UserGroup, Permission

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """
    Decodes the JWT token and returns the username.
    Raises 401 if the token is missing, invalid, or expired.
    """
    try:
        payload = decode_access_token(token)
        username: str = payload.get("sub")
        if not username:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload",
            )
        return {"username": username}
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token is invalid or expired",
        )


def require_permission(endpoint: str, method: str = "GET"):
    """
    Dependency that checks if the current user has permission to access
    the given endpoint. Superadmin always passes through.
    """
    def checker(
        current_user: dict = Depends(get_current_user),
        db: Session = Depends(get_auth_db),
    ) -> dict:
        username = current_user["username"]

        # superadmin bypasses all checks
        if username == settings.superadmin_username:
            return current_user

        # check user exists and is active
        user = db.query(User).filter(
            User.username == username,
            User.is_active == True,
        ).first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive",
            )

        # get all group ids this user belongs to
        group_ids = [
            ug.group_id for ug in
            db.query(UserGroup).filter(UserGroup.user_id == user.id).all()
        ]

        if not group_ids:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not belong to any group with access to this endpoint",
            )

        # check if any group has permission for this endpoint
        has_permission = db.query(Permission).filter(
            Permission.group_id.in_(group_ids),
            Permission.endpoint == endpoint,
            Permission.method == method,
        ).first()

        if not has_permission:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied to {method} {endpoint}",
            )

        return current_user

    return checker