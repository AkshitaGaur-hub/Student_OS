from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.routers.dependencies import require_roles
from app.schemas.event import EventCreate, EventResponse, EventUpdate
from app.services import event_service

router = APIRouter(prefix="/events", tags=["events"])


@router.post("/", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
def create_event(
    event_in: EventCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(require_roles("ADMIN")),
):
    return event_service.create_event(db, event_in)


@router.get("/", response_model=List[EventResponse])
def get_events(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    user: dict = Depends(require_roles("ADMIN", "TREASURER", "VOLUNTEER", "MEMBER")),
):
    return event_service.get_events(db, skip=skip, limit=limit)


@router.get("/{id}", response_model=EventResponse)
def get_event(
    id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(require_roles("ADMIN", "TREASURER", "VOLUNTEER", "MEMBER")),
):
    db_event = event_service.get_event_by_id(db, event_id=id)
    if not db_event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )
    return db_event


@router.put("/{id}", response_model=EventResponse)
def update_event(
    id: int,
    event_in: EventUpdate,
    db: Session = Depends(get_db),
    user: dict = Depends(require_roles("ADMIN")),
):
    db_event = event_service.update_event(db, event_id=id, event_in=event_in)
    if not db_event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )
    return db_event


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(
    id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(require_roles("ADMIN")),
):
    success = event_service.delete_event(db, event_id=id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )
    return None
