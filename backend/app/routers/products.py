from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.product import Product
from app.models.order import Order, OrderItem
from app.models.member import Member
from app.schemas.business import (
    ProductCreate, ProductUpdate, ProductResponse,
    OrderCreate, OrderResponse,
)
from app.dependencies import get_current_user, require_roles

router = APIRouter(tags=["Merchandise"])


# ─── Products ───────────────────────────────────────────────
@router.get("/products", response_model=List[ProductResponse])
def list_products(db: Session = Depends(get_db),
                  current_user: User = Depends(get_current_user)):
    return db.query(Product).all()


@router.post("/products", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(data: ProductCreate, db: Session = Depends(get_db),
                   current_user: User = Depends(require_roles("admin", "organizer"))):
    product = Product(**data.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.put("/products/{product_id}", response_model=ProductResponse)
def update_product(product_id: int, data: ProductUpdate, db: Session = Depends(get_db),
                   current_user: User = Depends(require_roles("admin", "organizer"))):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(product, k, v)
    db.commit()
    db.refresh(product)
    return product


# ─── Orders ─────────────────────────────────────────────────
@router.post("/orders", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(data: OrderCreate, db: Session = Depends(get_db),
                 current_user: User = Depends(get_current_user)):
    """Create a merchandise order. Validates stock, deducts inventory, rejects negative stock."""
    member = db.query(Member).filter(Member.id == data.member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    if not data.items:
        raise HTTPException(status_code=400, detail="Order must have at least one item")

    total = 0.0
    line_items = []
    for item in data.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        if not product.is_available:
            raise HTTPException(status_code=400, detail=f"Product '{product.name}' is not available")
        if product.stock < item.quantity:
            raise HTTPException(status_code=400,
                                detail=f"Insufficient stock for '{product.name}': "
                                       f"requested {item.quantity}, available {product.stock}")
        subtotal = float(product.price) * item.quantity
        total += subtotal
        line_items.append((product, item.quantity, float(product.price), subtotal))

    # Create order
    order = Order(member_id=data.member_id, total_amount=total, status="confirmed")
    db.add(order)
    db.flush()

    # Create order items and deduct stock
    for product, qty, unit_price, subtotal in line_items:
        oi = OrderItem(order_id=order.id, product_id=product.id,
                       quantity=qty, unit_price=unit_price, subtotal=subtotal)
        db.add(oi)
        product.stock -= qty   # deduct stock

    db.commit()
    db.refresh(order)
    return order


@router.get("/orders", response_model=List[OrderResponse])
def list_orders(db: Session = Depends(get_db),
                current_user: User = Depends(get_current_user)):
    return db.query(Order).all()


@router.get("/orders/{order_id}", response_model=OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db),
              current_user: User = Depends(get_current_user)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

