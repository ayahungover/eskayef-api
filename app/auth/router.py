"""
Authentication routes — login and token issuance.
Supports both JSON body and OAuth2 form data (for Swagger UI).
"""

from fastapi import APIRouter, Depends, Form, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.auth.hashing import verify_password
from app.auth.jwt import create_access_token
from app.auth.schemas import TokenResponse
from app.core.auth_database import get_auth_db
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_auth_db),
):
    """
    Accepts username + password as form data.
    Returns a JWT token if credentials are valid.
    """
    # Step 1 — find the user in PostgreSQL
    user = db.query(User).filter(User.username == form_data.username).first()

    # Step 2 — does the user exist and is the password correct?
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    # Step 3 — is the account active?
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled",
        )

    # Step 4 — issue the token
    token = create_access_token(username=user.username, role=user.role)
    return TokenResponse(access_token=token)