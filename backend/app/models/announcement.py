from sqlalchemy import Column, Integer, String, DateTime, Text, func
from app.database import Base


class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    priority = Column(String(50), nullable=False, default="normal")  # low, normal, high, urgent
    target_audience = Column(String(100), nullable=False, default="all")  # all, members, officers, admins
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

