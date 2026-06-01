"""
SQLAlchemy ORM models — map Python classes to SQL Server tables.
"""

from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Product(Base):
    """
    Example ERP table. Adjust column names to match your real schema.
    """

    __tablename__ = "Products"

    id: Mapped[int] = mapped_column("ProductID", primary_key=True)
    sku: Mapped[str] = mapped_column("SKU", String(50))
    name: Mapped[str] = mapped_column("ProductName", String(200))
    unit_price: Mapped[Decimal] = mapped_column("UnitPrice", Numeric(18, 2))
    created_at: Mapped[datetime | None] = mapped_column(
        "CreatedAt", DateTime, nullable=True
    )


class Inmast(Base):
    """
    INMAST — item / inventory master (OR example only).

    Maps to your ERP table INMAST with columns Itemkey, Desc1, Purchaseuomcode.
    Adjust String lengths if your database uses different sizes.
    """

    __tablename__ = "INMAST"

    itemkey: Mapped[str] = mapped_column("Itemkey", String(50), primary_key=True)
    desc1: Mapped[str | None] = mapped_column("Desc1", String(500), nullable=True)
    purchase_uom_code: Mapped[str | None] = mapped_column(
        "Purchaseuomcode", String(20), nullable=True
    )
