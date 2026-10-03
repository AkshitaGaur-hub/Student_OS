from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.member import Member
from app.routers.dependencies import get_current_user, require_roles
from app.schemas.tickets import TicketCreate, TicketResponse
from app.services import ticket_service

router = APIRouter(prefix="/tickets", tags=["tickets"])


@router.post("/", response_model=TicketResponse, status_code=status.HTTP_201_CREATED)
def purchase_ticket(
    ticket_in: TicketCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    user_id = user.get("user_id")
    return ticket_service.purchase_ticket(db, user_id=user_id, event_id=ticket_in.event_id)


@router.get("/my", response_model=List[TicketResponse])
def get_my_tickets(
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    user_id = user.get("user_id")
    return ticket_service.get_my_tickets(db, user_id=user_id)


@router.get("/{id}", response_model=TicketResponse)
def get_ticket(
    id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    ticket = ticket_service.get_ticket_by_id(db, ticket_id=id)
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found",
        )

    user_id = user.get("user_id")
    user_role = str(user.get("role", "")).lower()

    # Check ownership or admin/officer role
    member = db.query(Member).filter(Member.user_id == user_id).first()
    is_owner = member is not None and ticket.member_id == member.id
    is_authorized_staff = user_role in ["admin", "officer", "treasurer", "volunteer"]

    if not (is_owner or is_authorized_staff):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to ticket details",
        )

    return ticket


@router.post("/{id}/check-in", response_model=TicketResponse)
def check_in_ticket(
    id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    ticket = ticket_service.get_ticket_by_id(db, ticket_id=id)
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found",
        )

    user_id = user.get("user_id")
    user_role = str(user.get("role", "")).lower()

    member = db.query(Member).filter(Member.user_id == user_id).first()
    is_owner = member is not None and ticket.member_id == member.id
    is_authorized_staff = user_role in ["admin", "officer", "volunteer", "treasurer"]

    if not (is_owner or is_authorized_staff):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to perform check-in on this ticket",
        )

    return ticket_service.check_in_ticket(db, ticket_id=id)
