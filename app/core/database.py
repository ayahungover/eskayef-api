"""
Synchronous SQL Server access via SQLAlchemy + pyodbc.

- ``engine`` — connection pool to SQL Server
- ``SessionLocal`` — factory that opens one ``Session`` per request (or script)
- ``get_db`` — FastAPI dependency that yields a session and closes it
- ``test_db_connection`` — quick check that the server is reachable
"""

from collections.abc import Generator

from sqlalchemy import create_engine, text
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import settings


class Base(DeclarativeBase):
    """Base class for ORM models (tables)."""


engine = create_engine(
    settings.database_url,
    echo=settings.debug,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency: one database session per HTTP request.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def test_db_connection() -> bool:
    """
    Run ``SELECT 1`` against SQL Server to verify credentials, network, and ODBC.

    Returns:
        True if the query succeeds.

    Raises:
        Any error from SQLAlchemy/pyodbc if the connection fails.
    """
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1"))
        value = result.scalar_one()
    return value == 1


if __name__ == "__main__":
    # Run from project root:  python -m app.database
    print("Testing database connection...")
    test_db_connection()
    print("Success: connected to SQL Server.")
