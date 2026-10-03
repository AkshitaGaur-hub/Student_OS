from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.member import Member
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.schemas.order import OrderCreate


def create_order(db: Session, user_id: int, order_in: OrderCreate) -> Order:
    member = db.query(Member).filter(Member.user_id == user_id).first()
    if not member:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Authenticated user does not have an associated Member record",
        )

    if not order_in.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order must contain at least one item",
        )

    # Validate all requested items before making any state changes
    validated_items = []
    for item in order_in.items:
        if item.quantity <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Item quantity must be greater than 0 for product ID {item.product_id}",
            )

        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with ID {item.product_id} not found",
            )

        if not product.is_available:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product '{product.name}' is currently unavailable",
            )

        if product.stock < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for '{product.name}'. Available: {product.stock}, requested: {item.quantity}",
            )

        validated_items.append((product, item.quantity))

    # Create Order
    db_order = Order(
        member_id=member.id,
        total_amount=0.00,
        status="pending",
    )
    db.add(db_order)
    db.flush()

    total_amount = 0.0
    for product, quantity in validated_items:
        unit_price = float(product.price)
        subtotal = round(unit_price * quantity, 2)
        total_amount += subtotal

        order_item = OrderItem(
            order_id=db_order.id,
            product_id=product.id,
            quantity=quantity,
            unit_price=product.price,
            subtotal=subtotal,
        )
        db.add(order_item)

        # Decrease product stock after validation passes
        product.stock -= quantity

    db_order.total_amount = round(total_amount, 2)
    db.commit()
    db.refresh(db_order)
    return db_order


def get_my_orders(db: Session, user_id: int) -> List[Order]:
    member = db.query(Member).filter(Member.user_id == user_id).first()
    if not member:
        return []
    return db.query(Order).filter(Order.member_id == member.id).all()


def get_order_by_id(db: Session, order_id: int) -> Optional[Order]:
    return db.query(Order).filter(Order.id == order_id).first()
