from sqlalchemy import Column, Integer, String, DateTime, Text, Numeric, CheckConstraint, func
from app.database import Base


class Income(Base):
    __tablename__ = "incomes"

    id = Column(Integer, primary_key=True, index=True)
    source = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    amount = Column(Numeric(10, 2), nullable=False)
    category = Column(String(100), nullable=True)  # event, fundraiser, merch, donation, other
    received_date = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (
        CheckConstraint("amount > 0", name="ck_incomes_amount_positive"),
    )


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    description = Column(Text, nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    category = Column(String(100), nullable=True)  # venue, supplies, food, marketing, other
    vendor = Column(String(255), nullable=True)
    expense_date = Column(DateTime(timezone=True), nullable=False)
    status = Column(String(50), nullable=False, default="approved")  # pending, approved, rejected
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (
        CheckConstraint("amount > 0", name="ck_expenses_amount_positive"),
    )


class Reimbursement(Base):
    __tablename__ = "reimbursements"

    id = Column(Integer, primary_key=True, index=True)
    requested_by = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    receipt_url = Column(String(500), nullable=True)
    status = Column(String(50), nullable=False, default="pending")  # pending, approved, rejected, paid
    submitted_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        CheckConstraint("amount > 0", name="ck_reimbursements_amount_positive"),
    )

