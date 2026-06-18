"""
SQLAlchemy ORM model for the vendor_bids_items table in MariaDB.
"""

from sqlalchemy import Column, String, DateTime, Integer, Numeric, SmallInteger, CHAR, Text
from app.core.mariadb import MariaBase


class VendorBidItem(MariaBase):
    """
    Maps to the vendor_bids_items table in the eskabidc_api MariaDB database.
    Composite primary key: email + tender_no + item_seq
    """

    __tablename__ = "vendor_bids_items"

    email         = Column(String(255), primary_key=True)
    tender_no     = Column(String(12),  primary_key=True)
    item_seq      = Column(String(3),   primary_key=True)
    opening_date  = Column(DateTime,    nullable=True)
    closing_date  = Column(DateTime,    nullable=True)
    vat_incl      = Column(CHAR(3),     nullable=True)
    status        = Column(SmallInteger,nullable=False)
    login         = Column(String(255), nullable=False)
    item_id       = Column(String(12),  nullable=True)
    item_name     = Column(String(250), nullable=True)
    specification = Column(Text,        nullable=True)
    qty           = Column(Numeric(10,2),nullable=True)
    uom           = Column(String(50),  nullable=True)
    unit_price    = Column(Numeric(10,2),nullable=True)
    lead_time     = Column(SmallInteger, nullable=True)
    est_price     = Column(Numeric(10,2),nullable=True)
    remarks       = Column(String(250), nullable=True)
    file_link     = Column(String(250), nullable=True)