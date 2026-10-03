from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.routers.dependencies import require_roles
from app.schemas.finance import (
    ExpenseCreate, ExpenseResponse,
    FinanceSummary,
    IncomeCreate, IncomeResponse,
    ReimbursementCreate, ReimbursementResponse, ReimbursementStatusUpdate,
)
from app.services import finance_service

router = APIRouter(prefix="/finance", tags=["finance"])

# Admin + Treasurer can manage finance; everyone authenticated can submit reimbursements
_FINANCE_MANAGERS = ("ADMIN", "TREASURER")
_ALL_ROLES = ("ADMIN", "OFFICER", "TREASURER", "VOLUNTEER", "MEMBER")


# ── Income ────────────────────────────────────────────────────────────────────

@router.post("/income", response_model=IncomeResponse, status_code=status.HTTP_201_CREATED)
def create_income(
    income_in: IncomeCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(require_roles(*_FINANCE_MANAGERS)),
):
    return finance_service.create_income(db, income_in)


@router.get("/income", response_model=List[IncomeResponse])
def get_income(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    user: dict = Depends(require_roles(*_FINANCE_MANAGERS)),
):
    return finance_service.get_incomes(db, skip=skip, limit=limit)


# ── Expense ───────────────────────────────────────────────────────────────────

@router.post("/expenses", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
def create_expense(
    expense_in: ExpenseCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(require_roles(*_FINANCE_MANAGERS)),
):
    return finance_service.create_expense(db, expense_in)


@router.get("/expenses", response_model=List[ExpenseResponse])
def get_expenses(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    user: dict = Depends(require_roles(*_FINANCE_MANAGERS)),
):
    return finance_service.get_expenses(db, skip=skip, limit=limit)


# ── Reimbursements ────────────────────────────────────────────────────────────

@router.post("/reimbursements", response_model=ReimbursementResponse, status_code=status.HTTP_201_CREATED)
def create_reimbursement(
    reimb_in: ReimbursementCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(require_roles(*_ALL_ROLES)),
):
    return finance_service.create_reimbursement(db, reimb_in)


@router.get("/reimbursements", response_model=List[ReimbursementResponse])
def get_reimbursements(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    user: dict = Depends(require_roles(*_FINANCE_MANAGERS)),
):
    return finance_service.get_reimbursements(db, skip=skip, limit=limit)


@router.put("/reimbursements/{id}", response_model=ReimbursementResponse)
def update_reimbursement_status(
    id: int,
    update_in: ReimbursementStatusUpdate,
    db: Session = Depends(get_db),
    user: dict = Depends(require_roles(*_FINANCE_MANAGERS)),
):
    db_reimb = finance_service.update_reimbursement_status(db, reimb_id=id, update_in=update_in)
    if not db_reimb:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reimbursement not found",
        )
    return db_reimb


# ── Summary ───────────────────────────────────────────────────────────────────

@router.get("/summary", response_model=FinanceSummary)
def get_finance_summary(
    db: Session = Depends(get_db),
    user: dict = Depends(require_roles(*_FINANCE_MANAGERS)),
):
    return finance_service.get_finance_summary(db)
