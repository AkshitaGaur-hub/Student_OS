from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


# ── Income ──────────────────────────────────────────────────────────────────

class IncomeCreate(BaseModel):
    source: str
    description: Optional[str] = None
    amount: float = Field(..., gt=0)
    category: Optional[str] = None
    received_date: datetime


class IncomeResponse(BaseModel):
    id: int
    source: str
    description: Optional[str] = None
    amount: float
    category: Optional[str] = None
    received_date: datetime
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ── Expense ──────────────────────────────────────────────────────────────────

class ExpenseCreate(BaseModel):
    description: str
    amount: float = Field(..., gt=0)
    category: Optional[str] = None
    vendor: Optional[str] = None
    expense_date: datetime
    status: Optional[str] = "approved"


class ExpenseResponse(BaseModel):
    id: int
    description: str
    amount: float
    category: Optional[str] = None
    vendor: Optional[str] = None
    expense_date: datetime
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ── Reimbursement ────────────────────────────────────────────────────────────

class ReimbursementCreate(BaseModel):
    requested_by: str
    description: str
    amount: float = Field(..., gt=0)
    receipt_url: Optional[str] = None


class ReimbursementStatusUpdate(BaseModel):
    status: str  # pending, approved, rejected, paid


class ReimbursementResponse(BaseModel):
    id: int
    requested_by: str
    description: str
    amount: float
    receipt_url: Optional[str] = None
    status: str
    submitted_at: datetime
    reviewed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ── Summary ──────────────────────────────────────────────────────────────────

class FinanceSummary(BaseModel):
    total_income: float
    total_expenses: float
    balance: float
