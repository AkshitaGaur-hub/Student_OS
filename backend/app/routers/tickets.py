import uuid
from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.ticket import Ticket
from app.models.event import Event
from app.models.member import Member
from app.schemas.business import TicketCreate, TicketResponse
from app.dependencies import get_current_user

router = APIRouter(prefix="/tickets", tags=["Tickets"])


@router.post("/", response_model=TicketResponse, status_code=status.HTTP_201_CREATED)
def purchase_ticket(data: TicketCreate, db: Session = Depends(get_db),
                    current_user: User = Depends(get_current_user)):
    
    """Purchase a ticket for an event. Checks capacity and determines member/non-member price."""
    
    event = db.query(Event).filter(Event.id == data.event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    member = db.query(Member).filter(Member.id == data.member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    if event.status == "cancelled":
        raise HTTPException(status_code=400, detail="Cannot purchase ticket for a cancelled event")

    # Check capacity
    if event.max_capacity is not None:
        sold = db.query(Ticket).filter(
            Ticket.event_id == event.id,
            Ticket.status.in_(["active", "checked_in"])
        ).count()
        if sold >= event.max_capacity:
            raise HTTPException(status_code=400, detail="Event is at full capacity")

    # Determine price: use ticket_price (member price)
    price = float(event.ticket_price)

    ticket_code = f"TKT-{uuid.uuid4().hex[:8].upper()}"

    ticket = Ticket(
        event_id=data.event_id,
        member_id=data.member_id,
        ticket_code=ticket_code,
        price_paid=price,
        payment_status="mock_paid",
        status="active",
        checked_in=False,
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket


@router.get("/", response_model=List[TicketResponse])
def list_tickets(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """List all tickets."""
    return db.query(Ticket).all()


@router.get("/{ticket_id}", response_model=TicketResponse)
def get_ticket(ticket_id: int, db: Session = Depends(get_db),
               current_user: User = Depends(get_current_user)):
    """Get a specific ticket by ID."""
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket


@router.post("/{ticket_id}/check-in", response_model=TicketResponse)
def check_in_ticket(ticket_id: int, db: Session = Depends(get_db),
                    current_user: User = Depends(get_current_user)):
    """Check in a ticket. Rejects already checked-in tickets."""
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    if ticket.checked_in:
        raise HTTPException(status_code=400, detail="Ticket has already been checked in")
    if ticket.status == "cancelled":
        raise HTTPException(status_code=400, detail="Cannot check in a cancelled ticket")

    ticket.checked_in = True
    ticket.checked_in_at = datetime.utcnow()
    ticket.status = "checked_in"
    db.commit()
    db.refresh(ticket)
    return ticket

