"""
Pydantic schema for vendor bid items response.
"""

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel


class VendorBidItemRead(BaseModel):
    email:         str
    tender_no:     str
    opening_date:  datetime | None
    closing_date:  datetime | None
    vat_incl:      str | None
    status:        int
    item_seq:      str
    login:         str
    item_id:       str | None
    item_name:     str | None
    specification: str | None
    qty:           Decimal | None
    uom:           str | None
    unit_price:    Decimal | None
    lead_time:     int | None
    est_price:     Decimal | None
    remarks:       str | None
    file_link:     str | None

    class Config:
        from_attributes = True