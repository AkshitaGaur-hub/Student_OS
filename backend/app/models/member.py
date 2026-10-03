from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database import Base


class Member(Base):
    __tablename__ = "members"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    student_id = Column(String(50), unique=True, nullable=False)
    department = Column(String(100), nullable=True)
    year_of_study = Column(Integer, nullable=True)
    phone = Column(String(20), nullable=True)
    membership_status = Column(String(50), nullable=False, default="active")  # active, inactive, alumni
    joined_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    expiry_date = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="member")
    tickets = relationship("Ticket", back_populates="member")
    orders = relationship("Order", back_populates="member")

