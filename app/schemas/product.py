"""
Pydantic schemas — validate request/response data (separate from DB models).
"""

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class ProductBase(BaseModel):
    sku: str = Field(..., max_length=50, examples=["SKU-001"])
    name: str = Field(..., max_length=200, examples=["Widget A"])
    unit_price: Decimal = Field(..., ge=0, decimal_places=2, examples=["19.99"])


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    sku: str | None = Field(None, max_length=50)
    name: str | None = Field(None, max_length=200)
    unit_price: Decimal | None = Field(None, ge=0, decimal_places=2)


class ProductRead(ProductBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime | None = None
