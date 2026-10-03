from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class TicketCreate(BaseModel):
    event_id: int
    member_id: int


class TicketResponse(BaseModel):
    id: int
    event_id: int
    member_id: int
    ticket_code: str
    price_paid: float
    payment_status: str
    status: str
    checked_in: bool
    checked_in_at: Optional[datetime]
    purchased_at: datetime

    class Config:
        from_attributes = True


class AnnouncementCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    content: str = Field(..., min_length=1)
    priority: str = Field(default="normal")
    target_audience: str = Field(default="all")


class AnnouncementUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    content: Optional[str] = None
    priority: Optional[str] = None
    target_audience: Optional[str] = None


class AnnouncementResponse(BaseModel):
    id: int
    title: str
    content: str
    priority: str
    target_audience: str
    creator_id: Optional[int]
    published_at: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProductCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    price: float = Field(..., ge=0)
    stock: int = Field(..., ge=0)
    size: Optional[str] = None
    category: Optional[str] = None
    is_available: bool = True


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = None
    price: Optional[float] = Field(default=None, ge=0)
    stock: Optional[int] = Field(default=None, ge=0)
    size: Optional[str] = None
    category: Optional[str] = None
    is_available: Optional[bool] = None


class ProductResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    price: float
    stock: int
    size: Optional[str]
    category: Optional[str]
    is_available: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)


class OrderCreate(BaseModel):
    member_id: int
    items: List[OrderItemCreate]


class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: float
    subtotal: float

    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    id: int
    member_id: int
    total_amount: float
    status: str
    order_date: datetime
    updated_at: datetime
    items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True


class FundraiserCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    goal_amount: float = Field(..., gt=0)
    start_date: datetime
    end_date: Optional[datetime] = None
    status: str = Field(default="active")


class FundraiserUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = None
    goal_amount: Optional[float] = Field(default=None, gt=0)
    raised_amount: Optional[float] = Field(default=None, ge=0)
    status: Optional[str] = None
    end_date: Optional[datetime] = None


class FundraiserTaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    assigned_to: Optional[int] = None
    due_date: Optional[datetime] = None
    status: str = Field(default="pending")


class FundraiserTaskUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = None
    assigned_to: Optional[int] = None
    due_date: Optional[datetime] = None
    status: Optional[str] = None


class FundraiserTaskResponse(BaseModel):
    id: int
    fundraiser_id: int
    assigned_to: Optional[int]
    title: str
    description: Optional[str]
    status: str
    due_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class FundraiserResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    goal_amount: float
    raised_amount: float
    status: str
    start_date: datetime
    end_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    tasks: List[FundraiserTaskResponse] = []

    class Config:
        from_attributes = True


class IncomeCreate(BaseModel):
    source: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    amount: float = Field(..., gt=0)
    category: Optional[str] = None
    received_date: datetime


class IncomeResponse(BaseModel):
    id: int
    source: str
    description: Optional[str]
    amount: float
    category: Optional[str]
    received_date: datetime
    created_at: datetime

    class Config:
        from_attributes = True


class ExpenseCreate(BaseModel):
    description: str = Field(..., min_length=1)
    amount: float = Field(..., gt=0)
    category: Optional[str] = None
    vendor: Optional[str] = None
    expense_date: datetime
    status: str = Field(default="approved")


class ExpenseResponse(BaseModel):
    id: int
    description: str
    amount: float
    category: Optional[str]
    vendor: Optional[str]
    expense_date: datetime
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class ReimbursementCreate(BaseModel):
    requested_by: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=1)
    amount: float = Field(..., gt=0)
    receipt_url: Optional[str] = None


class ReimbursementUpdate(BaseModel):
    status: str  # pending, approved, rejected, paid
    reviewed_at: Optional[datetime] = None


class ReimbursementResponse(BaseModel):
    id: int
    requested_by: str
    description: str
    amount: float
    receipt_url: Optional[str]
    status: str
    submitted_at: datetime
    reviewed_at: Optional[datetime]

    class Config:
        from_attributes = True


class FinanceSummary(BaseModel):
    total_income: float
    total_expenses: float
    pending_reimbursements: float
    balance: float


class DashboardSummary(BaseModel):
    total_members: int
    active_members: int
    upcoming_events: int
    tickets_sold: int
    total_attendance: int
    merchandise_orders: int
    total_income: float
    total_expenses: float
    balance: float

