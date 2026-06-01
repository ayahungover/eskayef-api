"""
Database health endpoints.
"""

from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.database import test_db_connection

router = APIRouter(tags=["database"])


@router.get("/test-db")
def test_db():
    """
    Check that the API can connect to SQL Server.
    """
    try:
        test_db_connection()
        return {
            "success": True,
            "message": "Database connection successful",
        }
    except Exception as exc:
        return JSONResponse(
            status_code=503,
            content={
                "success": False,
                "message": f"Database connection failed: {exc}",
            },
        )
