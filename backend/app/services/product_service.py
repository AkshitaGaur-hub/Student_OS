from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate


def create_product(db: Session, product_in: ProductCreate) -> Product:
    if product_in.price < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Product price cannot be negative",
        )
    if product_in.stock < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Product stock cannot be negative",
        )

    db_product = Product(**product_in.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product


def get_products(
    db: Session,
    category: Optional[str] = None,
    is_available: Optional[bool] = None,
    skip: int = 0,
    limit: int = 100,
) -> List[Product]:
    query = db.query(Product)
    if category is not None:
        query = query.filter(Product.category == category)
    if is_available is not None:
        query = query.filter(Product.is_available == is_available)
    return query.offset(skip).limit(limit).all()


def get_product_by_id(db: Session, product_id: int) -> Optional[Product]:
    return db.query(Product).filter(Product.id == product_id).first()


def update_product(db: Session, product_id: int, product_in: ProductUpdate) -> Optional[Product]:
    db_product = get_product_by_id(db, product_id)
    if not db_product:
        return None

    update_data = product_in.model_dump(exclude_unset=True)

    if "price" in update_data and update_data["price"] is not None and update_data["price"] < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Product price cannot be negative",
        )

    if "stock" in update_data and update_data["stock"] is not None and update_data["stock"] < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Product stock cannot be negative",
        )

    for field, value in update_data.items():
        setattr(db_product, field, value)

    db.commit()
    db.refresh(db_product)
    return db_product


def delete_product(db: Session, product_id: int) -> bool:
    db_product = get_product_by_id(db, product_id)
    if not db_product:
        return False
    db.delete(db_product)
    db.commit()
    return True
