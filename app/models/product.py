from datetime import datetime
from decimal import Decimal
from sqlalchemy import DateTime, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base

class Product(Base):
    __tablename__ = "Products"

    id: Mapped[int] = mapped_column("ProductID", primary_key=True)
    sku: Mapped[str] = mapped_column("SKU", String(50))
    name: Mapped[str] = mapped_column("ProductName", String(200))
    unit_price: Mapped[Decimal] = mapped_column("UnitPrice", Numeric(18, 2))
    created_at: Mapped[datetime | None] = mapped_column("CreatedAt", DateTime, nullable=True)