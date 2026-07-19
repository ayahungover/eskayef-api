"""
Pydantic schemas for purchase order header responses.
"""

from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel


class POHeaderRead(BaseModel):
    pono:       str | None
    orddate:    datetime | None
    vendkey:    str | None
    vendname:   str | None
    email:      str | None
    dfltpcref:  str | None
    taxtotal:   Decimal | None
    indentno:   str | None
    location:   str | None

    class Config:
        from_attributes = True