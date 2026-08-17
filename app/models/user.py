'''from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import declarative_base
from datetime import datetime, timezone

AuthBase = declarative_base()

class User(AuthBase):
    __tablename__ = "users"

    id              = Column(Integer, primary_key=True, index=True)
    username        = Column(String(100), unique=True, nullable=False)
    email           = Column(String(150), unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role            = Column(String(50), nullable=False)
    is_active       = Column(Boolean, default=True)
    created_at      = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))'''
    
"""
SQLAlchemy ORM models for authentication — maps to PostgreSQL erp_auth database.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import declarative_base, relationship

AuthBase = declarative_base()


class User(AuthBase):
    __tablename__ = "users"

    id              = Column(Integer, primary_key=True, index=True)
    username        = Column(String(100), unique=True, nullable=False)
    email           = Column(String(150), unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active       = Column(Boolean, default=True)
    created_at      = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    groups = relationship("UserGroup", back_populates="user")


class Group(AuthBase):
    __tablename__ = "groups"

    id          = Column(Integer, primary_key=True, index=True)
    name        = Column(String(100), unique=True, nullable=False)
    description = Column(String(500), nullable=True)
    created_at  = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    members     = relationship("UserGroup", back_populates="group")
    permissions = relationship("Permission", back_populates="group")


class UserGroup(AuthBase):
    __tablename__ = "user_groups"

    user_id  = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    group_id = Column(Integer, ForeignKey("groups.id", ondelete="CASCADE"), primary_key=True)

    user  = relationship("User", back_populates="groups")
    group = relationship("Group", back_populates="members")


class Permission(AuthBase):
    __tablename__ = "permissions"

    id       = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("groups.id", ondelete="CASCADE"), nullable=False)
    endpoint = Column(String(200), nullable=False)
    method   = Column(String(10), nullable=False, default="GET")

    group = relationship("Group", back_populates="permissions")


class AuditLog(AuthBase):
    __tablename__ = "audit_logs"

    id         = Column(Integer, primary_key=True, index=True)
    username   = Column(String(100), nullable=False)
    endpoint   = Column(String(200), nullable=False)
    method     = Column(String(10), nullable=False)
    ip_address = Column(String(50), nullable=False)
    timestamp  = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))    