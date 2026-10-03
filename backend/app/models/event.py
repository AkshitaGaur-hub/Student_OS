from sqlalchemy import Column, Integer, String, DateTime, Text, Numeric, CheckConstraint, func
from sqlalchemy.orm import relationship
from app.database import Base


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    location = Column(String(255), nullable=True)
    event_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=True)
    max_capacity = Column(Integer, nullable=True)
    ticket_price = Column(Numeric(10, 2), nullable=False, default=0.00)
    status = Column(String(50), nullable=False, default="upcoming")  # upcoming, ongoing, completed, cancelled
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    __table_args__ = (
        CheckConstraint("ticket_price >= 0", name="ck_events_ticket_price_non_negative"),
        CheckConstraint("max_capacity > 0 OR max_capacity IS NULL", name="ck_events_max_capacity_positive"),
    )

    # Relationships
    tickets = relationship("Ticket", back_populates="event")

