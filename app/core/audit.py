from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime
from app.models.user import AuthBase

from sqlalchemy.orm import Session

class AuditLog(AuthBase):
    __tablename__ = "audit_logs"

    id         = Column(Integer, primary_key=True)
    username   = Column(String(100), nullable=False)
    role       = Column(String(50), nullable=False)
    endpoint   = Column(String(200), nullable=False)
    method     = Column(String(10), nullable=False)
    ip_address = Column(String(50), nullable=False)
    timestamp  = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    

def log_access(
    db: Session,
    username: str,
    role: str,
    endpoint: str,
    method: str,
    ip_address: str,
):
    entry = AuditLog(
        username=username,
        role=role,
        endpoint=endpoint,
        method=method,
        ip_address=ip_address,
    )
    db.add(entry)
    db.commit()