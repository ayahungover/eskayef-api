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

RESPONSE_FIELDS = (
    "catcode", "unit", "lc_no", "lc_open_date", "bank", "prop_date",
    "lca_no", "lca_date", "item_seq", "itemid", "shipment_by", "tradename",
    "uom", "qty", "unit_price", "currency", "item_tot_qty_price",
    "item_shp_n_handling", "item_total_with_shp", "bdt_conv_rate", "bdt_item_amnt",
    "lc_shipment_expiry", "lc_last_negotiation", "supplier", "supplier_country",
    "country_origin", "eta_port", "hs_code1", "indentor_id", "indentor",
    "indent_pi_no", "indent_pi_date", "user_id",
)


def _normalize_row(row: dict) -> dict:
    values = {str(key).upper(): value for key, value in row.items()}
    values["SUPPLIER"] = values.get("COMPANYNAME", values.get("SUPPLIER"))
    return {field: _serialize_value(values.get(field.upper())) for field in RESPONSE_FIELDS}


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
    data = [_normalize_row(dict(row)) for row in rows]

    # sort in Python since stored procedure doesn't support dynamic ORDER BY
    reverse = order == "DESC"
    data.sort(key=lambda x: (x.get(sort_column) is None, x.get(sort_column)), reverse=reverse)

    # pagination in Python
    total_records = len(data)
    total_pages = max(1, ceil(total_records / size)) if total_records else 0
    offset = (page - 1) * size
    data = data[offset:offset + size]

    return data, total_records, total_pages