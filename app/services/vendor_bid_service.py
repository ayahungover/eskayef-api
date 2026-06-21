"""
Vendor bid query helpers for the vendor_bids_items table in MariaDB.
"""

from math import ceil

from sqlalchemy.orm import Session

from app.models.vendor_bid import VendorBidItem

SORT_FIELDS: dict[str, object] = {
    "email":        VendorBidItem.email,
    "tender_no":    VendorBidItem.tender_no,
    "opening_date": VendorBidItem.opening_date,
    "closing_date": VendorBidItem.closing_date,
    "login":        VendorBidItem.login,
    "item_name":    VendorBidItem.item_name,
    "unit_price":   VendorBidItem.unit_price,
    "qty":          VendorBidItem.qty,
}


def get_vendor_bids_page(
    db: Session,
    *,
    page: int = 1,
    size: int = 20,
    tender_no: str | None = None,
    sort_by: str = "login",
    sort_order: str = "asc",
    price_filter: str = "all",   # add this    
) -> tuple[list[VendorBidItem], int, int]:
    """
    Return a page of vendor_bids_items rows filtered by tender_no.

    Returns:
        (rows, total_records, total_pages)
    """
    if page < 1:
        page = 1
    if size < 1:
        size = 20

    query = db.query(VendorBidItem)

    if tender_no:
        query = query.filter(VendorBidItem.tender_no.like(f"%{tender_no}%"))

    if price_filter == "with":
        query = query.filter(VendorBidItem.unit_price != None)
    elif price_filter == "without":
        query = query.filter(VendorBidItem.unit_price == None)
    # "all" — no filter added

    total_records = query.count()
    total_pages = max(1, ceil(total_records / size)) if total_records else 0

    sort_column = SORT_FIELDS.get(sort_by, VendorBidItem.login)
    if sort_order.lower() == "desc":
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())

    offset = (page - 1) * size
    rows = query.offset(offset).limit(size).all()

    return rows, total_records, total_pages