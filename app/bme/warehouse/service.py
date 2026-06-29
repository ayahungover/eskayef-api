"""
ORM query helpers for the INMAST item master table.
"""

from math import ceil

from sqlalchemy.orm import Session

from app.models.item import Inmast   # new

# Allowed sort keys (API names) mapped to ORM columns.
SORT_FIELDS: dict[str, object] = {
    "itemkey": Inmast.itemkey,
    "desc1": Inmast.desc1,
    "purchase_uom_code": Inmast.purchase_uom_code,
}


def _parse_itemkeys(itemkey: str | None) -> list[str]:
    """
    Split comma-separated item keys, trim spaces, ignore empty values.

    Example: "ITEM1, ITEM2 ,ITEM3" -> ["ITEM1", "ITEM2", "ITEM3"]
    """
    if not itemkey:
        return []
    return [part.strip() for part in itemkey.split(",") if part.strip()]


def _apply_itemkey_filter(query, itemkey: str | None):
    itemkeys = _parse_itemkeys(itemkey)
    if not itemkeys:
        return query

    if len(itemkeys) == 1:
        return query.filter(Inmast.itemkey.like(f"%{itemkeys[0]}%"))

    return query.filter(Inmast.itemkey.in_(itemkeys))


def get_items_page(
    db: Session,
    *,
    page: int = 1,
    size: int = 20,
    itemkey: str | None = None,
    desc1: str | None = None,
    sort_by: str = "itemkey",
    sort_order: str = "asc",
) -> tuple[list[Inmast], int, int]:
    """
    Return a page of INMAST rows with optional search filters and sorting.

    Returns:
        (rows, total_records, total_pages)
    """
    if page < 1:
        page = 1
    if size < 1:
        size = 20

    query = db.query(Inmast)

    if itemkey:
        query = _apply_itemkey_filter(query, itemkey)

    if desc1:
        query = query.filter(Inmast.desc1.like(f"%{desc1}%"))

    total_records = query.count()
    total_pages = max(1, ceil(total_records / size)) if total_records else 0

    sort_column = SORT_FIELDS.get(sort_by, Inmast.itemkey)
    if sort_order.lower() == "desc":
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())

    offset = (page - 1) * size
    rows = query.offset(offset).limit(size).all()

    return rows, total_records, total_pages
