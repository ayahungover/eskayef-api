"""
Item master (INMAST) endpoints — SQLAlchemy ORM.
"""

from fastapi import APIRouter, Depends, Query, Request
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.auth_database import get_auth_db
from app.core.audit import log_access
from app.bme.warehouse.schemas import ItemRead
from app.bme.warehouse import service as item_service
from app.auth.dependencies import require_permission

router = APIRouter(prefix="/items", tags=["Items"])


@router.get("")
def list_items(
    page: int = Query(1, ge=1, description="Page number (starts at 1)"),
    size: int = Query(20, ge=1, le=10000, description="Rows per page"),
    itemkey: str | None = Query(
        None,
        description="Search item code (partial match) or one or more exact codes separated by commas",
    ),
    desc1: str | None = Query(None, description="Search description (partial match)"),
    sort_by: str = Query(
        "itemkey",
        description="Sort field (itemkey, desc1, purchase_uom_code)",
    ),
    sort_order: str = Query("asc", description="asc or desc"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_permission("/warehouse/items", "GET")),
    auth_db: Session = Depends(get_auth_db),
    request: Request = None,
):
    """
    Fetch item master rows from INMAST with pagination, search, and sorting.
    """
    log_access(
        db=auth_db,
        username=current_user["username"],
        endpoint="/bme/items",
        method="GET",
        ip_address=request.client.host if request else "unknown",
    )

    try:
        allowed_sort_fields = set(item_service.SORT_FIELDS.keys())
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

        rows, total_records, total_pages = item_service.get_items_page(
            db,
            page=page,
            size=size,
            itemkey=itemkey,
            desc1=desc1,
            sort_by=sort_by,
            sort_order=sort_order,
        )

        data = [ItemRead.model_validate(row).model_dump() for row in rows]

        return {
            "success": True,
            "page": page,
            "size": size,
            "total_records": total_records,
            "total_pages": total_pages,
            "data": data,
        }
    except SQLAlchemyError as exc:
        return JSONResponse(
            status_code=503,
            content={
                "success": False,
                "message": f"Could not load items: {exc}",
                "page": page,
                "size": size,
                "total_records": 0,
                "total_pages": 0,
                "data": [],
            },
        )