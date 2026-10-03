from typing import List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.user import User
from app.models.fundraiser import Fundraiser, FundraiserTask
from app.models.finance import Income, Expense, Reimbursement
from app.models.member import Member
from app.models.ticket import Ticket
from app.models.order import Order
from app.models.event import Event
from app.schemas.business import (
    FundraiserCreate, FundraiserUpdate, FundraiserResponse,
    FundraiserTaskCreate, FundraiserTaskUpdate, FundraiserTaskResponse,
    IncomeCreate, IncomeResponse,
    ExpenseCreate, ExpenseResponse,
    ReimbursementCreate, ReimbursementUpdate, ReimbursementResponse,
    FinanceSummary, DashboardSummary,
)
from app.dependencies import get_current_user, require_roles

router = APIRouter(tags=["Finance & Fundraisers"])


# ─── Fundraisers ─────────────────────────────────────────────
@router.get("/fundraisers", response_model=List[FundraiserResponse])
def list_fundraisers(db: Session = Depends(get_db),
                     current_user: User = Depends(get_current_user)):
    return db.query(Fundraiser).all()


@router.post("/fundraisers", response_model=FundraiserResponse, status_code=status.HTTP_201_CREATED)
def create_fundraiser(data: FundraiserCreate, db: Session = Depends(get_db),
                      current_user: User = Depends(require_roles("admin", "organizer", "treasurer"))):
    f = Fundraiser(**data.model_dump())
    db.add(f)
    db.commit()
    db.refresh(f)
    return f


@router.get("/fundraisers/{fundraiser_id}", response_model=FundraiserResponse)
def get_fundraiser(fundraiser_id: int, db: Session = Depends(get_db),
                   current_user: User = Depends(get_current_user)):
    f = db.query(Fundraiser).filter(Fundraiser.id == fundraiser_id).first()
    if not f:
        raise HTTPException(status_code=404, detail="Fundraiser not found")
    return f


@router.post("/fundraisers/{fundraiser_id}/tasks", response_model=FundraiserTaskResponse,
             status_code=status.HTTP_201_CREATED)
def create_task(fundraiser_id: int, data: FundraiserTaskCreate, db: Session = Depends(get_db),
                current_user: User = Depends(require_roles("admin", "organizer"))):
    f = db.query(Fundraiser).filter(Fundraiser.id == fundraiser_id).first()
    if not f:
        raise HTTPException(status_code=404, detail="Fundraiser not found")
    task = FundraiserTask(fundraiser_id=fundraiser_id, **data.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.put("/fundraiser-tasks/{task_id}", response_model=FundraiserTaskResponse)
def update_task(task_id: int, data: FundraiserTaskUpdate, db: Session = Depends(get_db),
                current_user: User = Depends(get_current_user)):
    task = db.query(FundraiserTask).filter(FundraiserTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(task, k, v)
    db.commit()
    db.refresh(task)
    return task


# ─── Finance: Income ─────────────────────────────────────────
@router.get("/finance/income", response_model=List[IncomeResponse])
def list_income(db: Session = Depends(get_db),
                current_user: User = Depends(require_roles("admin", "treasurer"))):
    return db.query(Income).order_by(Income.received_date.desc()).all()


@router.post("/finance/income", response_model=IncomeResponse, status_code=status.HTTP_201_CREATED)
def create_income(data: IncomeCreate, db: Session = Depends(get_db),
                  current_user: User = Depends(require_roles("admin", "treasurer"))):
    income = Income(**data.model_dump())
    db.add(income)
    db.commit()
    db.refresh(income)
    return income


# ─── Finance: Expenses ──────────────────────────────────────
@router.get("/finance/expenses", response_model=List[ExpenseResponse])
def list_expenses(db: Session = Depends(get_db),
                  current_user: User = Depends(require_roles("admin", "treasurer"))):
    return db.query(Expense).order_by(Expense.expense_date.desc()).all()


@router.post("/finance/expenses", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
def create_expense(data: ExpenseCreate, db: Session = Depends(get_db),
                   current_user: User = Depends(require_roles("admin", "treasurer"))):
    expense = Expense(**data.model_dump())
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense


# ─── Finance: Reimbursements ─────────────────────────────────
@router.get("/finance/reimbursements", response_model=List[ReimbursementResponse])
def list_reimbursements(db: Session = Depends(get_db),
                        current_user: User = Depends(require_roles("admin", "treasurer"))):
    return db.query(Reimbursement).order_by(Reimbursement.submitted_at.desc()).all()


@router.post("/finance/reimbursements", response_model=ReimbursementResponse,
             status_code=status.HTTP_201_CREATED)
def create_reimbursement(data: ReimbursementCreate, db: Session = Depends(get_db),
                         current_user: User = Depends(get_current_user)):
    r = Reimbursement(**data.model_dump())
    db.add(r)
    db.commit()
    db.refresh(r)
    return r


@router.put("/finance/reimbursements/{reimb_id}", response_model=ReimbursementResponse)
def update_reimbursement(reimb_id: int, data: ReimbursementUpdate, db: Session = Depends(get_db),
                         current_user: User = Depends(require_roles("admin", "treasurer"))):
    r = db.query(Reimbursement).filter(Reimbursement.id == reimb_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Reimbursement not found")
    r.status = data.status
    if data.reviewed_at:
        r.reviewed_at = data.reviewed_at
    else:
        r.reviewed_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(r)
    return r


# ─── Finance Summary ─────────────────────────────────────────
@router.get("/finance/summary", response_model=FinanceSummary)
def finance_summary(db: Session = Depends(get_db),
                    current_user: User = Depends(require_roles("admin", "treasurer"))):
    total_income = db.query(func.coalesce(func.sum(Income.amount), 0)).scalar() or 0
    total_expenses = db.query(func.coalesce(func.sum(Expense.amount), 0)).scalar() or 0
    pending_reimb = db.query(func.coalesce(func.sum(Reimbursement.amount), 0)).filter(
        Reimbursement.status == "pending"
    ).scalar() or 0
    return FinanceSummary(
        total_income=float(total_income),
        total_expenses=float(total_expenses),
        pending_reimbursements=float(pending_reimb),
        balance=float(total_income) - float(total_expenses),
    )


# ─── Dashboard ───────────────────────────────────────────────
@router.get("/dashboard/summary", response_model=DashboardSummary)
def dashboard_summary(db: Session = Depends(get_db),
                      current_user: User = Depends(get_current_user)):
    now = datetime.now(timezone.utc)
    total_members = db.query(Member).count()
    active_members = db.query(Member).filter(Member.membership_status == "active").count()
    upcoming_events = db.query(Event).filter(
        Event.status == "upcoming", Event.event_date > now
    ).count()
    tickets_sold = db.query(Ticket).filter(
        Ticket.status.in_(["active", "checked_in"])
    ).count()
    total_attendance = db.query(Ticket).filter(Ticket.checked_in == True).count()
    merchandise_orders = db.query(Order).count()
    total_income = float(db.query(func.coalesce(func.sum(Income.amount), 0)).scalar() or 0)
    total_expenses = float(db.query(func.coalesce(func.sum(Expense.amount), 0)).scalar() or 0)
    return DashboardSummary(
        total_members=total_members,
        active_members=active_members,
        upcoming_events=upcoming_events,
        tickets_sold=tickets_sold,
        total_attendance=total_attendance,
        merchandise_orders=merchandise_orders,
        total_income=total_income,
        total_expenses=total_expenses,
        balance=total_income - total_expenses,
    )

