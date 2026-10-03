import uuid
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
                Ticket.status.in_(["active", "used"]),
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


def check_in_ticket(db: Session, ticket_id: int) -> Ticket:
    ticket = get_ticket_by_id(db, ticket_id)
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found",
        )

    if str(ticket.status).lower() != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ticket cannot be checked in. Current status is '{ticket.status}'",
        )

    ticket.status = "used"
    db.commit()
    db.refresh(ticket)
    return ticket
