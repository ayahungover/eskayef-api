"""
LC item register queries from SQL Server — uses stored procedure.
"""

from datetime import date, datetime
from decimal import Decimal
from math import ceil

from sqlalchemy import text
from sqlalchemy.orm import Session


def _serialize_value(value):
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    if isinstance(value, Decimal):
        return float(value)
    return value


SORT_FIELDS: dict[str, str] = {
    "lc_open_date":  "LC_OPEN_DATE",
    "lc_no":         "LC_NO",
    "catcode":       "CATCODE",
    "unit_price":    "UNIT_PRICE",
    "tradename":     "TRADENAME",
    "supplier":      "CompanyName",
}


def get_lc_items_page(
    db: Session,
    *,
    catcode: str,
    date_from: date,
    date_to: date,
    page: int = 1,
    size: int = 20,
    sort_by: str = "lc_open_date",
    sort_order: str = "desc",
) -> tuple[list[dict], int, int]:

    if page < 1:
        page = 1
    if size < 1:
        size = 20

    sort_column = SORT_FIELDS.get(sort_by, "LC_OPEN_DATE")
    order = "ASC" if sort_order.lower() == "asc" else "DESC"

    # call the stored procedure
    proc_sql = text("""
        EXEC SLC.dbo.GetLCItemRegisterByCatAndDate :catcode, :date_from, :date_to
    """)

    result = db.execute(proc_sql, {
        "catcode": catcode,
        "date_from": str(date_from),
        "date_to": str(date_to),
    })

    rows = result.mappings().all()
    data = [{key: _serialize_value(val) for key, val in row.items()} for row in rows]

    # sort in Python since stored procedure doesn't support dynamic ORDER BY
    reverse = order == "DESC"
    data.sort(key=lambda x: (x.get(sort_column) is None, x.get(sort_column)), reverse=reverse)

    # pagination in Python
    total_records = len(data)
    total_pages = max(1, ceil(total_records / size)) if total_records else 0
    offset = (page - 1) * size
    data = data[offset:offset + size]

    return data, total_records, total_pages