"""
Synchronous PostgreSQL access via SQLAlchemy + psycopg2.

Mirrors the structure of database.py but connects to PostgreSQL
for authentication data only.
"""

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings


auth_engine = create_engine(
    settings.auth_database_url,
    echo=settings.debug,
    pool_pre_ping=True,
)

AuthSessionLocal = sessionmaker(bind=auth_engine, autocommit=False, autoflush=False)


def get_auth_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency: one auth database session per HTTP request.
    """
    db = AuthSessionLocal()
    try:
        yield db
    finally:
        db.close()