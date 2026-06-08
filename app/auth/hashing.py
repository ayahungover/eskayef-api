"""
Password hashing and verification using bcrypt via passlib.
"""

from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain_password: str) -> str:
    """
    Takes a plain text password, returns a bcrypt hash.
    Call this before saving a new user to the database.
    """
    return pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Compares a plain text password against a stored bcrypt hash.
    Returns True if they match, False otherwise.
    Call this during login.
    """
    return pwd_context.verify(plain_password, hashed_password)