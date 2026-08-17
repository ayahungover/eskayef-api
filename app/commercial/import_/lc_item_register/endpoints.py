"""
LC item register endpoints.
"""

from datetime import date, datetime, timezone

from fastapi import APIRouter, Depends, Query, Request
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.commercial_database import get_commercial_db
from app.core.auth_database import get_auth_db
from app.core.audit import log_access
from app.commercial.import_.lc_item_register import service
from app.auth.dependencies import require_permission

router = APIRouter(prefix="/commercial/lc-items", tags=["LC Item Register"])


@router.get("")
def list_lc_items(
    catcode: str = Query(
        ...,
        description="Category code(s) comma-separated e.g. PRM,PPM,PCM",
    ),
    date_from: date = Query(
        ...,
        description="Start date (YYYY-MM-DD)",
    ),
    date_to: date = Query(
        default=None,
        description="End date (YYYY-MM-DD) — defaults to today",
    ),
    page: int = Query(1, ge=1, description="Page number (starts at 1)"),
    size: int = Query(20, ge=1, le=200, description="Rows per page"),
    sort_by: str = Query(
        "lc_open_date",
        description="Sort field (lc_open_date, lc_no, catcode, unit_price, tradename, supplier)",
    ),
    sort_order: str = Query("desc", description="asc or desc"),
    db: Session = Depends(get_commercial_db),
    current_user: dict = Depends(require_permission("/commercial/lc-items", "GET")),
    auth_db: Session = Depends(get_auth_db),
    request: Request = None,
):
    """
    Fetch LC item register rows with catcode filter and date range.
    """
    if date_to is None:
        date_to = datetime.now(timezone.utc).date()

    log_access(
        db=auth_db,
        username=current_user["username"],
        endpoint="/commercial/lc-items",
        method="GET",
        ip_address=request.client.host if request else "unknown",
    )

    try:
        allowed_sort_fields = set(service.SORT_FIELDS.keys())
        if sort_by not in allowed_sort_fields:
            return JSONResponse(
                status_code=422,
                content={
                    "success": False,
                    "message": f"Invalid sort_by '{sort_by}'. Allowed: {sorted(allowed_sort_fields)}",
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

        # allow ALL as a special catcode
        if catcode.upper() != "ALL":
            # validate comma separated catcodes
            valid_catcodes = {"PRM", "PPM", "PCM", "LGS", "LPS"}
            codes = [c.strip().upper() for c in catcode.split(",")]
            invalid = [c for c in codes if c not in valid_catcodes]
            if invalid:
                return JSONResponse(
                    status_code=422,
                    content={
                        "success": False,
                        "message": f"Invalid catcode(s): {invalid}. Allowed: {sorted(valid_catcodes)} or 'ALL'",
                    },
                )    

        if date_from > date_to:
            return JSONResponse(
                status_code=422,
                content={
                    "success": False,
                    "message": "date_from cannot be later than date_to",
                },
            )

        rows, total_records, total_pages = service.get_lc_items_page(
            db,
            catcode=catcode,
            date_from=date_from,
            date_to=date_to,
            page=page,
            size=size,
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
                "message": f"Could not load LC items: {exc}",
                "page": page,
                "size": size,
                "total_records": 0,
                "total_pages": 0,
                "data": [],
            },
        )