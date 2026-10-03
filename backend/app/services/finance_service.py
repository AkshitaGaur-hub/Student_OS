from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.finance import Income, Expense, Reimbursement
from app.schemas.finance import (
    IncomeCreate,
    ExpenseCreate,
    ReimbursementCreate,
    ReimbursementStatusUpdate,
    FinanceSummary,
)

VALID_REIMBURSEMENT_STATUSES = {"pending", "approved", "rejected", "paid"}


# ── Income ────────────────────────────────────────────────────────────────────

def create_income(db: Session, income_in: IncomeCreate) -> Income:
    db_income = Income(**income_in.model_dump())
    db.add(db_income)
    db.commit()
    db.refresh(db_income)
    return db_income


def get_incomes(db: Session, skip: int = 0, limit: int = 100) -> List[Income]:
    return db.query(Income).offset(skip).limit(limit).all()


# ── Expense ───────────────────────────────────────────────────────────────────

def create_expense(db: Session, expense_in: ExpenseCreate) -> Expense:
    db_expense = Expense(**expense_in.model_dump())
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense


def get_expenses(db: Session, skip: int = 0, limit: int = 100) -> List[Expense]:
    return db.query(Expense).offset(skip).limit(limit).all()


# ── Reimbursement ─────────────────────────────────────────────────────────────

def create_reimbursement(db: Session, reimb_in: ReimbursementCreate) -> Reimbursement:
    data = reimb_in.model_dump()
    data["status"] = "pending"
    db_reimb = Reimbursement(**data)
    db.add(db_reimb)
    db.commit()
    db.refresh(db_reimb)
    return db_reimb


def get_reimbursements(db: Session, skip: int = 0, limit: int = 100) -> List[Reimbursement]:
    return db.query(Reimbursement).offset(skip).limit(limit).all()


def update_reimbursement_status(
    db: Session, reimb_id: int, update_in: ReimbursementStatusUpdate
) -> Optional[Reimbursement]:
    new_status = update_in.status.lower()
    if new_status not in VALID_REIMBURSEMENT_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status '{update_in.status}'. Valid statuses: {', '.join(sorted(VALID_REIMBURSEMENT_STATUSES))}",
        )

    db_reimb = db.query(Reimbursement).filter(Reimbursement.id == reimb_id).first()
    if not db_reimb:
        return None

    from datetime import datetime, timezone
    db_reimb.status = new_status
    db_reimb.reviewed_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(db_reimb)
    return db_reimb


# ── Summary ───────────────────────────────────────────────────────────────────

def get_finance_summary(db: Session) -> FinanceSummary:
    total_income = db.query(func.coalesce(func.sum(Income.amount), 0)).scalar()
    total_expenses = db.query(func.coalesce(func.sum(Expense.amount), 0)).scalar()

    total_income = float(total_income)
    total_expenses = float(total_expenses)
    balance = round(total_income - total_expenses, 2)

    return FinanceSummary(
        total_income=round(total_income, 2),
        total_expenses=round(total_expenses, 2),
        balance=balance,
    )
