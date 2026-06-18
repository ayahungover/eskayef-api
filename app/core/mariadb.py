"""
MariaDB connection for the vendor bids database.
"""

from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import settings

engine = create_engine(
    settings.mariadb_url,
    pool_pre_ping=True,
)

MariaSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

MariaBase = declarative_base()


def get_maria_db():
    """
    FastAPI dependency that provides a MariaDB session.
    Use with Depends(get_maria_db) in route functions.
    """
    db = MariaSessionLocal()
    try:
        yield db
    finally:
        db.close()


def test_maria_connection():
    """
    Quick connectivity check — called by the health endpoint.
    """
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))