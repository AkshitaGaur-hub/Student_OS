from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.routers.dependencies import require_roles
from app.schemas.product import ProductCreate, ProductResponse, ProductUpdate
from app.services import product_service

router = APIRouter(prefix="/products", tags=["products"])


@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    product_in: ProductCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(require_roles("ADMIN", "OFFICER")),
):
    return product_service.create_product(db, product_in)


@router.get("/", response_model=List[ProductResponse])
def get_products(
    category: Optional[str] = None,
    is_available: Optional[bool] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    user: dict = Depends(require_roles("ADMIN", "OFFICER", "TREASURER", "VOLUNTEER", "MEMBER")),
):
    return product_service.get_products(
        db,
        category=category,
        is_available=is_available,
        skip=skip,
        limit=limit,
    )


@router.get("/{id}", response_model=ProductResponse)
def get_product(
    id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(require_roles("ADMIN", "OFFICER", "TREASURER", "VOLUNTEER", "MEMBER")),
):
    product = product_service.get_product_by_id(db, product_id=id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )
    return product


@router.put("/{id}", response_model=ProductResponse)
def update_product(
    id: int,
    product_in: ProductUpdate,
    db: Session = Depends(get_db),
    user: dict = Depends(require_roles("ADMIN", "OFFICER")),
):
    product = product_service.update_product(db, product_id=id, product_in=product_in)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )
    return product


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(require_roles("ADMIN", "OFFICER")),
):
    success = product_service.delete_product(db, product_id=id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )
    return None
