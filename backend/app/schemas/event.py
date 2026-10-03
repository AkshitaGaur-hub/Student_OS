from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class EventBase(BaseModel):
    title: str
    description: Optional[str] = None
    location: Optional[str] = None
    event_date: datetime
    end_date: Optional[datetime] = None
    max_capacity: Optional[int] = None
    ticket_price: Optional[float] = 0.00
    status: Optional[str] = "upcoming"


class EventCreate(EventBase):
    pass


class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    event_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    max_capacity: Optional[int] = None
    ticket_price: Optional[float] = None
    status: Optional[str] = None


class EventResponse(EventBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
