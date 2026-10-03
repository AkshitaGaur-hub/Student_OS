from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class MemberBase(BaseModel):
    user_id: int
    student_id: str
    department: Optional[str] = None
    year_of_study: Optional[int] = None
    phone: Optional[str] = None
    membership_status: Optional[str] = "active"


class MemberCreate(MemberBase):
    pass


class MemberUpdate(BaseModel):
    user_id: Optional[int] = None
    student_id: Optional[str] = None
    department: Optional[str] = None
    year_of_study: Optional[int] = None
    phone: Optional[str] = None
    membership_status: Optional[str] = None


class MemberResponse(MemberBase):
    id: int
    joined_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
