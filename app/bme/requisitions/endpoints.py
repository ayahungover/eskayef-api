"""
Purchase requisition endpoints.
"""

from fastapi import APIRouter, Depends, Query, Request
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.auth_database import get_auth_db
from app.core.audit import log_access
from app.bme.requisitions import service as requisition_service
from app.bme.requisitions.repository import SORT_FIELDS
from app.auth.dependencies import require_role

router = APIRouter(prefix="/requisitions", tags=["Indents"])


@router.get("")
def list_requisitions(
    page: int = Query(1, ge=1, description="Page number (starts at 1)"),
    size: int = Query(20, ge=1, le=200, description="Rows per page"),
    indent_no: str | None = Query(
        None,
        description="One or more indent numbers, comma-separated (e.g. 88371,88370)",
    ),
    sort_by: str = Query(
        "IndentDate",
        description="Sort field (IndentDate, RequestedBy, Price, Qtyord)",
    ),
    sort_order: str = Query("desc", description="asc or desc"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("admin", "indents")),
    auth_db: Session = Depends(get_auth_db),
    request: Request = None,
):
    """
    Fetch purchase requisition lines with optional indent number search,
    sorting, and pagination.
    """
    log_access(
        db=auth_db,
        username=current_user["username"],
        role=current_user["role"],
        endpoint="/requisitions",
        method="GET",
        ip_address=request.client.host if request else "unknown",
    )

    try:
        allowed_sort_fields = set(SORT_FIELDS.keys())
        if sort_by not in allowed_sort_fields:
            return JSONResponse(
                status_code=422,
                content={
                    "success": False,
                    "message": (
                        f"Invalid sort_by '{sort_by}'. "
                        f"Allowed: {sorted(allowed_sort_fields)}"
                    ),
                },
            )

        if sort_order.lower() not in {"asc", "desc"}:
            return JSONResponse(
                status_code=422,
                content={
                    "success": False,
                    "message": "sort_order must be 'asc' or 'desc'",
                },
            )

        rows, total_records, total_pages = requisition_service.get_requisitions_page(
            db,
            page=page,
            size=size,
            indent_no=indent_no,
            sort_by=sort_by,
            sort_order=sort_order,
        )
        return {
            "success": True,
            "page": page,
            "size": size,
            "total_records": total_records,
            "total_pages": total_pages,
            "data": rows,
        }
    except SQLAlchemyError as exc:
        return JSONResponse(
            status_code=503,
            content={
                "success": False,
                "message": f"Could not load requisitions: {exc}",
                "page": page,
                "size": size,
                "total_records": 0,
                "total_pages": 0,
                "data": [],
            },
        )