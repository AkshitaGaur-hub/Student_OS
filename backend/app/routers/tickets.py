from typing import List

from fastapi import APIRouter, Body, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.member import Member
from app.routers.dependencies import get_current_user, require_roles
from app.schemas.tickets import TicketCreate, TicketResponse
from app.services import ticket_service

router = APIRouter(prefix="/tickets", tags=["Tickets"])


# ---------------------------------------------------------------------------
# Schema used only by the verify endpoint (inline to keep files minimal)
# ---------------------------------------------------------------------------
class TicketVerifyRequest(BaseModel):
    ticket_code: str


class TicketVerifyResponse(BaseModel):
    success: bool
    message: str
    ticket: TicketResponse


# ---------------------------------------------------------------------------
# Purchase a ticket
# ---------------------------------------------------------------------------
@router.post(
    "/",
    response_model=TicketResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Purchase / register for an event ticket",
)
def purchase_ticket(
    ticket_in: TicketCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    user_id = user.get("user_id")
    return ticket_service.purchase_ticket(db, user_id=user_id, event_id=ticket_in.event_id)


# ---------------------------------------------------------------------------
# Get my tickets
# ---------------------------------------------------------------------------
@router.get(
    "/my",
    response_model=List[TicketResponse],
    summary="Get all tickets belonging to the currently authenticated user",
)
def get_my_tickets(
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    user_id = user.get("user_id")
    return ticket_service.get_my_tickets(db, user_id=user_id)


# ---------------------------------------------------------------------------
# QR-code / ticket-code verify and check-in  (admin / organizer only)
# ---------------------------------------------------------------------------
@router.post(
    "/verify",
    response_model=TicketVerifyResponse,
    summary="Verify a ticket by QR code and mark it as checked-in (admin/organizer only)",
    description=(
        "Accepts the unique `ticket_code` obtained from a scanned QR code. "
        "Verifies the ticket against the database and, if valid, marks it as `checked_in`. "
        "Returns an error if the ticket is already used, cancelled, refunded, or does not exist. "
        "Restricted to admin and organizer roles."
    ),
)
def verify_ticket_by_code(
    body: TicketVerifyRequest,
    db: Session = Depends(get_db),
    user: dict = Depends(require_roles("admin", "organizer", "volunteer")),
):
    ticket = ticket_service.verify_and_checkin_by_code(db, ticket_code=body.ticket_code.strip())
    return TicketVerifyResponse(
        success=True,
        message=f"Ticket {ticket.ticket_code} successfully checked in.",
        ticket=ticket,
    )


# ---------------------------------------------------------------------------
# Get a specific ticket by ID
# ---------------------------------------------------------------------------
@router.get(
    "/{id}",
    response_model=TicketResponse,
    summary="Get a specific ticket by its ID",
)
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

    member = db.query(Member).filter(Member.user_id == user_id).first()
    is_owner = member is not None and ticket.member_id == member.id
    is_authorized_staff = user_role in ("admin", "organizer", "officer", "treasurer", "volunteer")

    if not (is_owner or is_authorized_staff):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to ticket details",
        )

    return ticket


# ---------------------------------------------------------------------------
# Check in a ticket by ID (existing endpoint, unchanged)
# ---------------------------------------------------------------------------
@router.post(
    "/{id}/check-in",
    response_model=TicketResponse,
    summary="Check in a ticket by its database ID",
)
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
    is_authorized_staff = user_role in ("admin", "organizer", "officer", "volunteer", "treasurer")

    if not (is_owner or is_authorized_staff):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to perform check-in on this ticket",
        )

    return ticket_service.check_in_ticket(db, ticket_id=id)
