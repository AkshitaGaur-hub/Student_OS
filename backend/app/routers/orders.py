from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.member import Member
from app.routers.dependencies import get_current_user
from app.schemas.order import OrderCreate, OrderResponse
from app.services import order_service

router = APIRouter(prefix="/orders", tags=["orders"])


@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    order_in: OrderCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    user_id = user.get("user_id")
    return order_service.create_order(db, user_id=user_id, order_in=order_in)


@router.get("/my", response_model=List[OrderResponse])
def get_my_orders(
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    user_id = user.get("user_id")
    return order_service.get_my_orders(db, user_id=user_id)


@router.get("/{id}", response_model=OrderResponse)
def get_order(
    id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    order = order_service.get_order_by_id(db, order_id=id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    user_id = user.get("user_id")
    user_role = str(user.get("role", "")).lower()

    member = db.query(Member).filter(Member.user_id == user_id).first()
    is_owner = member is not None and order.member_id == member.id
    is_authorized_staff = user_role in ["admin", "officer", "treasurer"]

    if not (is_owner or is_authorized_staff):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to order details",
        )

    return order
