from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class MemberCreate(BaseModel):
    user_id: int
    student_id: str = Field(..., min_length=1, max_length=50)
    department: Optional[str] = None
    year_of_study: Optional[int] = None
    phone: Optional[str] = None
    membership_status: str = Field(default="active")
    expiry_date: Optional[datetime] = None


class MemberUpdate(BaseModel):
    department: Optional[str] = None
    year_of_study: Optional[int] = None
    phone: Optional[str] = None
    membership_status: Optional[str] = None
    expiry_date: Optional[datetime] = None


class MemberResponse(BaseModel):
    id: int
    user_id: int
    student_id: str
    department: Optional[str]
    year_of_study: Optional[int]
    phone: Optional[str]
    membership_status: str
    joined_at: datetime
    expiry_date: Optional[datetime]
    updated_at: datetime

    class Config:
        from_attributes = True

