from typing import List, Optional
from sqlalchemy.orm import Session

from app.models.event import Event
from app.schemas.event import EventCreate, EventUpdate


def create_event(db: Session, event_in: EventCreate) -> Event:
    db_event = Event(**event_in.model_dump())
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event


def get_events(db: Session, skip: int = 0, limit: int = 100) -> List[Event]:
    return db.query(Event).offset(skip).limit(limit).all()


def get_event_by_id(db: Session, event_id: int) -> Optional[Event]:
    return db.query(Event).filter(Event.id == event_id).first()


def update_event(db: Session, event_id: int, event_in: EventUpdate) -> Optional[Event]:
    db_event = get_event_by_id(db, event_id)
    if not db_event:
        return None

    update_data = event_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_event, field, value)

    db.commit()
    db.refresh(db_event)
    return db_event


def delete_event(db: Session, event_id: int) -> bool:
    db_event = get_event_by_id(db, event_id)
    if not db_event:
        return False
    db.delete(db_event)
    db.commit()
    return True
