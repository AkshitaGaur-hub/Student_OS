
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.database import engine, get_db, Base

# Import all models so Base knows about every table
from app.models import (
    User, Member, Event, Ticket, Announcement,
    Product, Order, OrderItem,
    Fundraiser, FundraiserTask,
    Income, Expense, Reimbursement,
)

# Import all API routers
from app.routers import auth, members, events, tickets, announcements, products, finance

# Ensure tables exist in Neon
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Student Organization Management System API",
    description="Full Backend API for Authentication, Members, Events, Tickets, Announcements, Merchandise, Fundraisers, and Finance.",
    version="1.0.0",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:5174", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers so they appear in Swagger /docs
app.include_router(auth.router)
app.include_router(members.router)
app.include_router(events.router)
app.include_router(tickets.router)
app.include_router(announcements.router)
app.include_router(products.router)
app.include_router(finance.router)


@app.get("/", tags=["General"])
def read_root():
    return {
        "message": "Welcome to Student Organization Management System API",
        "docs_url": "/docs",
        "health_check": "/health",
    }


@app.get("/health", tags=["General"])
def health_check(db: Session = Depends(get_db)):
    try:
        # Live query check for database connection
        db.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database connection failed: {str(e)}")


