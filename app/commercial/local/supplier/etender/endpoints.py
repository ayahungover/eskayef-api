"""
Vendor bid endpoints — MariaDB.
"""

from os import stat

from fastapi import APIRouter, Depends, Query, Request
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.mariadb import get_maria_db
from app.core.auth_database import get_auth_db
from app.core.audit import log_access
from app.commercial.local.supplier.etender.schemas import VendorBidItemRead
from app.commercial.local.supplier.etender import service as vendor_bid_service
from app.auth.dependencies import require_role

router = APIRouter(prefix="/vendor-bids", tags=["Vendor Bids"])

@router.get("")
def list_vendor_bids(
    page: int = Query(1, ge=1, description="Page number (starts at 1)"),
    size: int = Query(20, ge=1, le=200, description="Rows per page"),
    tender_no: str = Query(..., description="Search tender number (required)"),
    price_filter: str = Query(
    "all",
    description="Filter by unit price: 'with' (has price), 'without' (no price), 'all' (both)",
    ),
    sort_by: str = Query(
        "login",
        description="Sort field (email, tender_no, opening_date, closing_date, login, item_name, unit_price, qty)",
    ),
    sort_order: str = Query("asc", description="asc or desc"),
    db: Session = Depends(get_maria_db),
    current_user: dict = Depends(require_role("admin")),
    auth_db: Session = Depends(get_auth_db),
    request: Request = None,
):
    """
    Fetch vendor bid items from MariaDB with optional tender number search,
    sorting, and pagination.
    """
    log_access(
        db=auth_db,
        username=current_user["username"],
        role=current_user["role"],
        endpoint="/vendor-bids",
        method="GET",
        ip_address=request.client.host if request else "unknown",
    )

    try:
        allowed_sort_fields = set(vendor_bid_service.SORT_FIELDS.keys())
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
        if price_filter not in {"with", "without", "all"}:
            return JSONResponse(
                status_code=422,
                content={
                    "success": False,
                    "message": "price_filter must be 'with', 'without', or 'all'",
                },
            )
        if tender_no and (not tender_no.isdigit() or len(tender_no) != 5):
            return JSONResponse(
                status_code=422,
                content={
                    "success": False,
                    "message": "tender_no must be exactly 5 digits (e.g. 12003)",
                },
            )
        

        rows, total_records, total_pages = vendor_bid_service.get_vendor_bids_page(
            db,
            page=page,
            size=size,
            tender_no=tender_no,
            sort_by=sort_by,
            sort_order=sort_order,
            price_filter=price_filter,
            
        )

        data = [VendorBidItemRead.model_validate(row).model_dump() for row in rows]

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
                "message": f"Could not load vendor bids: {exc}",
                "page": page,
                "size": size,
                "total_records": 0,
                "total_pages": 0,
                "data": [],
            },
        )