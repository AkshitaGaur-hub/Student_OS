from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class EventCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    location: Optional[str] = None
    venue: Optional[str] = None
    event_date: datetime
    end_date: Optional[datetime] = None
    max_capacity: Optional[int] = Field(default=None, gt=0)
    ticket_price: float = Field(default=0.00, ge=0)
    non_member_price: Optional[float] = Field(default=None, ge=0)
    status: str = Field(default="upcoming")


class EventUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = None
    location: Optional[str] = None
    venue: Optional[str] = None
    event_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    max_capacity: Optional[int] = Field(default=None, gt=0)
    ticket_price: Optional[float] = Field(default=None, ge=0)
    non_member_price: Optional[float] = Field(default=None, ge=0)
    status: Optional[str] = None


class EventResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    location: Optional[str]
    venue: Optional[str]
    event_date: datetime
    end_date: Optional[datetime]
    max_capacity: Optional[int]
    ticket_price: float
    non_member_price: Optional[float]
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

