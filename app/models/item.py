from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base

class Inmast(Base):
    __tablename__ = "INMAST"

    itemkey: Mapped[str] = mapped_column("Itemkey", String(50), primary_key=True)
    desc1: Mapped[str | None] = mapped_column("Desc1", String(500), nullable=True)
    purchase_uom_code: Mapped[str | None] = mapped_column("Purchaseuomcode", String(20), nullable=True)