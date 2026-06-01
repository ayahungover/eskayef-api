"""
Purchase requisition endpoints.
"""

from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.database import get_db
from app.services import requisition_service

router = APIRouter(prefix="/requisitions", tags=["requisitions"])


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
):
    """
    Fetch purchase requisition lines with optional indent number search,
    sorting, and pagination.
    """
    try:
        allowed_sort_fields = set(requisition_service.SORT_FIELDS.keys())
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
