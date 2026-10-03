from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.member import Member
from app.models.user import User
from app.dependencies import get_current_user, require_roles
from app.schemas.order import OrderCreate, OrderResponse
from app.services import order_service

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.get("/", response_model=List[OrderResponse])
def get_all_orders(
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("admin", "organizer", "treasurer")),
):
    return order_service.get_all_orders(db)


@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    order_in: OrderCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return order_service.create_order(db, user_id=user.id, order_in=order_in)


@router.get("/my", response_model=List[OrderResponse])
def get_my_orders(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return order_service.get_my_orders(db, user_id=user.id)


@router.get("/{id}", response_model=OrderResponse)
def get_order(
    id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    order = order_service.get_order_by_id(db, order_id=id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    user_role = str(user.role).lower()
    member = db.query(Member).filter(Member.user_id == user.id).first()
    is_owner = member is not None and order.member_id == member.id
    is_authorized_staff = user_role in ["admin", "officer", "organizer", "treasurer"]

    if not (is_owner or is_authorized_staff):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to order details",
        )

    return order

