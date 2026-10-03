from sqlalchemy import Column, Integer, String, DateTime, Text, Numeric, ForeignKey, CheckConstraint, func
from sqlalchemy.orm import relationship
from app.database import Base


class Fundraiser(Base):
    __tablename__ = "fundraisers"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    goal_amount = Column(Numeric(10, 2), nullable=False)
    raised_amount = Column(Numeric(10, 2), nullable=False, default=0.00)
    status = Column(String(50), nullable=False, default="active")  # active, completed, cancelled
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    __table_args__ = (
        CheckConstraint("goal_amount > 0", name="ck_fundraisers_goal_amount_positive"),
        CheckConstraint("raised_amount >= 0", name="ck_fundraisers_raised_amount_non_negative"),
    )

    # Relationships
    tasks = relationship("FundraiserTask", back_populates="fundraiser", cascade="all, delete-orphan")


class FundraiserTask(Base):
    __tablename__ = "fundraiser_tasks"

    id = Column(Integer, primary_key=True, index=True)
    fundraiser_id = Column(Integer, ForeignKey("fundraisers.id", ondelete="CASCADE"), nullable=False)
    assigned_to = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="pending")  # pending, in_progress, completed
    due_date = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    fundraiser = relationship("Fundraiser", back_populates="tasks")
    assigned_user = relationship("User", back_populates="assigned_tasks")

