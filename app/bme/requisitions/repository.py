"""
Purchase requisition data from the ERP database (raw SQL, no ORM).
"""

from datetime import date, datetime
from math import ceil
from decimal import Decimal

from sqlalchemy import text
from sqlalchemy.orm import Session

BASE_FROM_SQL = """
FROM PURINDENTLIN PURINDENTLIN
LEFT OUTER JOIN (
    PURINDENTHDR PURINDENTHDR
    LEFT OUTER JOIN Cust_IndentcustomAddInfo Cust_IndentcustomAddInfo
        ON PURINDENTHDR.IndentNo = Cust_IndentcustomAddInfo.IndentNo
)
    ON PURINDENTLIN.IndentNo = PURINDENTHDR.IndentNo
LEFT OUTER JOIN INMAST INMAST
    ON PURINDENTLIN.Itemkey = INMAST.Itemkey
"""

SELECT_COLUMNS_SQL = """
SELECT
    PURINDENTHDR.IndentNo AS IndentNo1,
    PURINDENTHDR.IndentDate,
    PURINDENTLIN.IndentNo,
    PURINDENTLIN.RowNum,
    PURINDENTLIN.Itemkey,
    INMAST.Desc1,
    REPLACE(PURINDENTLIN.Reason, '$', CHAR(10)) AS Specification,
    PURINDENTLIN.Qtyord,
    PURINDENTLIN.UOM,
    PURINDENTLIN.Price,
    Cust_IndentcustomAddInfo.RequiredDate,
    Cust_IndentcustomAddInfo.RequestedBy
"""

# Only these fields can be used for ORDER BY (prevents SQL injection).
SORT_FIELDS: dict[str, str] = {
    "IndentDate": "IndentDate",
    "RequestedBy": "RequestedBy",
    "Price": "Price",
    "Qtyord": "Qtyord",
}


def _serialize_value(value):
    """Convert SQL Server types to JSON-friendly Python values."""
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    if isinstance(value, Decimal):
        return float(value)
    return value


def _parse_indent_numbers(indent_no: str | None) -> list[str]:
    """
    Split comma-separated indent numbers, trim spaces, ignore empty values.

    Example: "88371, 88370 ,88369" -> ["88371", "88370", "88369"]
    """
    if not indent_no:
        return []
    return [part.strip() for part in indent_no.split(",") if part.strip()]


def _build_filters(*, indent_no: str | None) -> tuple[str, dict]:
    """
    Build WHERE clause for one or more indent numbers (SQL IN, parameterized).
    """
    indent_numbers = _parse_indent_numbers(indent_no)
    if not indent_numbers:
        return "", {}

    placeholders: list[str] = []
    params: dict = {}
    for index, number in enumerate(indent_numbers):
        param_name = f"indent_{index}"
        placeholders.append(f":{param_name}")
        params[param_name] = number

    where_sql = f"WHERE PURINDENTLIN.IndentNo IN ({', '.join(placeholders)})"
    return where_sql, params


def get_requisitions_page(
    db: Session,
    *,
    page: int = 1,
    size: int = 20,
    indent_no: str | None = None,
    sort_by: str = "IndentDate",
    sort_order: str = "desc",
) -> tuple[list[dict], int, int]:
    """
    Returns:
        (rows, total_records, total_pages)
    """
    if page < 1:
        page = 1
    if size < 1:
        size = 20

    sort_column = SORT_FIELDS.get(sort_by, SORT_FIELDS["IndentDate"])
    order = "ASC" if sort_order.lower() == "asc" else "DESC"

    where_sql, params = _build_filters(indent_no=indent_no)

    count_sql = text(
        f"""
        WITH filtered AS (
            SELECT 1 AS _row_marker
            {BASE_FROM_SQL}
            {where_sql}
        )
        SELECT COUNT(1) AS total_records
        FROM filtered
        """
    )
    total_records = int(db.execute(count_sql, params).scalar_one())
    total_pages = max(1, ceil(total_records / size)) if total_records else 0

    offset = (page - 1) * size
    params = {**params, "offset": offset, "size": size}

    data_sql = text(
        f"""
        WITH filtered AS (
            {SELECT_COLUMNS_SQL}
            {BASE_FROM_SQL}
            {where_sql}
        )
        SELECT *
        FROM filtered
        ORDER BY {sort_column} {order}, IndentNo DESC, RowNum
        OFFSET :offset ROWS FETCH NEXT :size ROWS ONLY
        """
    )

    result = db.execute(data_sql, params)
    rows = result.mappings().all()
    data = [{key: _serialize_value(val) for key, val in row.items()} for row in rows]
    return data, total_records, total_pages
