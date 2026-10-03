import uuid
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.event import Event
from app.models.member import Member
from app.models.ticket import Ticket


def generate_ticket_code() -> str:
    return f"TCK-{uuid.uuid4().hex[:12].upper()}"


def purchase_ticket(db: Session, user_id: int, event_id: int) -> Ticket:
    member = db.query(Member).filter(Member.user_id == user_id).first()
    if not member:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Authenticated user does not have an associated Member record",
        )

    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )

    if str(event.status).lower() == "cancelled":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot purchase ticket for a cancelled event",
        )

    if event.max_capacity is not None:
        issued_count = (
            db.query(Ticket)
            .filter(
                Ticket.event_id == event_id,
                Ticket.status.in_(["active", "checked_in"]),
            )
            .count()
        )
        if issued_count >= event.max_capacity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Event capacity reached",
            )

    ticket_code = generate_ticket_code()
    while db.query(Ticket).filter(Ticket.ticket_code == ticket_code).first():
        ticket_code = generate_ticket_code()

    db_ticket = Ticket(
        event_id=event.id,
        member_id=member.id,
        ticket_code=ticket_code,
        price_paid=event.ticket_price,
        status="active",
    )
    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)
    return db_ticket


def get_my_tickets(db: Session, user_id: int) -> List[Ticket]:
    member = db.query(Member).filter(Member.user_id == user_id).first()
    if not member:
        return []
    return db.query(Ticket).filter(Ticket.member_id == member.id).all()


def get_ticket_by_id(db: Session, ticket_id: int) -> Optional[Ticket]:
    return db.query(Ticket).filter(Ticket.id == ticket_id).first()


def get_ticket_by_code(db: Session, ticket_code: str) -> Optional[Ticket]:
    return db.query(Ticket).filter(Ticket.ticket_code == ticket_code).first()


def _apply_checkin(db: Session, ticket: Ticket) -> Ticket:
    """Shared check-in logic. Validates state then stamps checked_in."""
    ticket_status = str(ticket.status).lower()

    if ticket_status == "checked_in" or ticket.checked_in:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ticket has already been checked in.",
        )
    if ticket_status == "cancelled":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ticket has been cancelled and cannot be used for check-in.",
        )
    if ticket_status == "refunded":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ticket has been refunded and cannot be used for check-in.",
        )
    if ticket_status != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ticket cannot be checked in. Current status: '{ticket.status}'.",
        )

    ticket.status = "checked_in"
    ticket.checked_in = True
    ticket.checked_in_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(ticket)
    return ticket


def check_in_ticket(db: Session, ticket_id: int) -> Ticket:
    """Check in a ticket by its database ID."""
    ticket = get_ticket_by_id(db, ticket_id)
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found",
        )
    return _apply_checkin(db, ticket)


def verify_and_checkin_by_code(db: Session, ticket_code: str) -> Ticket:
    """
    Verify a ticket by its QR code and mark it as checked-in.

    Validation order:
      1. Ticket with this code must exist.
      2. The associated event must exist and must not be cancelled.
      3. Ticket must not already be checked-in.
      4. Ticket must not be cancelled or refunded.
      5. Ticket must be in active status.
    """
    ticket = get_ticket_by_code(db, ticket_code)
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No ticket found with code '{ticket_code}'.",
        )

    event = db.query(Event).filter(Event.id == ticket.event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="The event associated with this ticket no longer exists.",
        )
    if str(event.status).lower() == "cancelled":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The event for this ticket has been cancelled.",
        )

    return _apply_checkin(db, ticket)
