from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

from app.schemas.event import EventResponse


class TicketCreate(BaseModel):
    event_id: int


class TicketResponse(BaseModel):
    id: int
    event_id: int
    member_id: int
    ticket_code: str
    price_paid: float
    status: str
    purchased_at: datetime
    event: Optional[EventResponse] = None

    model_config = ConfigDict(from_attributes=True)
