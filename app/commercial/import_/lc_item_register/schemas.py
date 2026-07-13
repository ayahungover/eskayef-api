"""
Pydantic schemas for LC item register responses.
"""

from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel


class LCItemRead(BaseModel):
    catcode:              str | None
    unit:                 str | None
    lc_no:                str | None
    lc_open_date:         datetime | None
    bank:                 str | None
    prop_date:            datetime | None
    lca_no:               str | None
    lca_date:             datetime | None
    item_seq:             str | None
    itemid:               str | None
    shipment_by:          str | None
    tradename:            str | None
    uom:                  str | None
    qty:                  Decimal | None
    unit_price:           Decimal | None
    currency:             str | None
    item_tot_qty_price:   Decimal | None
    item_shp_n_handling:  Decimal | None
    item_total_with_shp:  Decimal | None
    bdt_conv_rate:        Decimal | None
    bdt_item_amnt:        Decimal | None
    lc_shipment_expiry:   datetime | None
    lc_last_negotiation:  datetime | None
    supplier:             str | None
    supplier_country:     str | None
    country_origin:       str | None
    eta_port:             str | None
    hs_code1:             str | None
    indentor_id:          str | None
    indentor:             str | None
    indent_pi_no:         str | None
    indent_pi_date:       datetime | None
    user_id:              str | None

    class Config:
        from_attributes = True