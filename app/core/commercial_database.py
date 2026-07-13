"""
SQL Server connection for commercial database (master context for SLC procedures).
"""

from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

commercial_engine = create_engine(
    settings.commercial_database_url,
    pool_pre_ping=True,
)

CommercialSessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=commercial_engine
)

CommercialBase = declarative_base()


def get_commercial_db():
    db = CommercialSessionLocal()
    try:
        yield db
    finally:
        db.close()