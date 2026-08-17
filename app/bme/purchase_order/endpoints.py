"""
Purchase order header endpoints.
"""

from fastapi import APIRouter, Depends, Query, Request
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.auth_database import get_auth_db
from app.core.audit import log_access
from app.bme.purchase_order import service
from app.auth.dependencies import require_permission

router = APIRouter(prefix="/bme/purchase-order", tags=["purchase order"])


@router.get("")
def get_po_header(
    pono: str = Query(..., description="Purchase order number (required)"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_permission("/bme/purchase-order", "GET")),
    auth_db: Session = Depends(get_auth_db),
    request: Request = None,
):
    """
    Fetch purchase order header by PO number.
    """
    log_access(
        db=auth_db,
        username=current_user["username"],
        endpoint="/bme/purchase-order",
        method="GET",
        ip_address=request.client.host if request else "unknown",
    )

    try:
        data = service.get_po_header(db, pono=pono)

        if data is None:
            return JSONResponse(
                status_code=404,
                content={
                    "success": False,
                    "message": f"No purchase order found for pono '{pono}'",
                },
            )

        return {
            "success": True,
            "data": data,
        }

    except SQLAlchemyError as exc:
        return JSONResponse(
            status_code=503,
            content={
                "success": False,
                "message": f"Could not load purchase order: {exc}",
            },
        )