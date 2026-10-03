from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class MemberBase(BaseModel):
    user_id: int
    student_id: str = Field(..., min_length=1, max_length=50)
    department: Optional[str] = None
    year_of_study: Optional[int] = None
    phone: Optional[str] = None
    membership_status: str = Field(default="active")
    expiry_date: Optional[datetime] = None


class MemberCreate(MemberBase):
    pass
class MemberUpdate(BaseModel):
    user_id: Optional[int] = None
    student_id: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=50,
    )
    department: Optional[str] = None
    year_of_study: Optional[int] = None
    phone: Optional[str] = None
    membership_status: Optional[str] = None
    expiry_date: Optional[datetime] = None

class MemberResponse(MemberBase):
    id: int
    joined_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)