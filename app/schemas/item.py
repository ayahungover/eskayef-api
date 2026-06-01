"""
Pydantic schemas for inventory master (INMAST) API responses.
"""

from pydantic import BaseModel, ConfigDict, Field


class ItemRead(BaseModel):
    """One row from the INMAST table — used only for responses."""

    model_config = ConfigDict(from_attributes=True)

    itemkey: str = Field(..., description="Item / part number key from the ERP")
    desc1: str | None = Field(None, description="Primary description")
    purchase_uom_code: str | None = Field(
        None, description="Default purchase unit of measure code"
    )
