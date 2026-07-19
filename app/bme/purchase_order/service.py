"""
Purchase order header queries from SQL Server.
"""

from datetime import datetime
from decimal import Decimal
from sqlalchemy import text
from sqlalchemy.orm import Session


def _serialize_value(value):
    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, Decimal):
        return float(value)
    return value


def get_po_header(
    db: Session,
    *,
    pono: str,
) -> dict | None:
    """
    Fetch a single purchase order header by PO number.
    Returns a dict or None if not found.
    """
    sql = text("""
        SELECT DISTINCT
            poh.pono,
            poh.orddate,
            poh.Vendkey,
            poh.Vendname,
            apv.email,
            poh.dfltpcref,
            poh.taxtotal,
            purilin.indentno,
            purilin.location
        FROM dbo.POHDR poh
        LEFT OUTER JOIN dbo.APVEND apv
            ON poh.Vendkey = apv.Vendor_Key
        LEFT OUTER JOIN dbo.PURINDENTLIN purilin
            ON poh.Pono = purilin.Pono
        WHERE poh.pono = :pono
    """)

    result = db.execute(sql, {"pono": pono})
    rows = result.mappings().all()

    if not rows:
        return None

    data = [{key: _serialize_value(val) for key, val in row.items()} for row in rows]
    return data