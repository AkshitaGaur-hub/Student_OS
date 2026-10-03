from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Numeric, CheckConstraint, func
from sqlalchemy.orm import relationship
from app.database import Base


class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    member_id = Column(Integer, ForeignKey("members.id", ondelete="CASCADE"), nullable=False)
    ticket_code = Column(String(100), unique=True, nullable=False)
    price_paid = Column(Numeric(10, 2), nullable=False, default=0.00)
    status = Column(String(50), nullable=False, default="active")  # active, used, cancelled, refunded
    purchased_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (
        CheckConstraint("price_paid >= 0", name="ck_tickets_price_paid_non_negative"),
    )

    # Relationships
    event = relationship("Event", back_populates="tickets")
    member = relationship("Member", back_populates="tickets")

