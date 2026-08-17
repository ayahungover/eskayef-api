from sqlalchemy.orm import Session
from app.models.user import AuditLog
    
    

def log_access(
    db: Session,
    username: str,
    endpoint: str,
    method: str,
    ip_address: str,
):
    entry = AuditLog(
        username=username,
        endpoint=endpoint,
        method=method,
        ip_address=ip_address,
    )
    db.add(entry)
    db.commit()