from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.dependencies import get_current_user, require_roles
from app.schemas.product import ProductCreate, ProductResponse, ProductUpdate
from app.services import product_service


router = APIRouter(tags=["Products & Merchandise"])


# ─── GET /products and /merchandise (Open to all authenticated users) ───
@router.get("/products", response_model=List[ProductResponse])
@router.get("/products/", response_model=List[ProductResponse], include_in_schema=False)
@router.get("/merchandise", response_model=List[ProductResponse])
@router.get("/merchandise/", response_model=List[ProductResponse], include_in_schema=False)
def get_products(
    category: Optional[str] = None,
    is_available: Optional[bool] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """
    Get all merchandise items. Accessible to all authenticated roles (student, volunteer, organizer, treasurer, admin).
    """
    return product_service.get_products(
        db,
        category=category,
        is_available=is_available,
        skip=skip,
        limit=limit,
    )


# ─── GET /products/{id} and /merchandise/{id} ───
@router.get("/products/{id}", response_model=ProductResponse)
@router.get("/merchandise/{id}", response_model=ProductResponse, include_in_schema=False)
def get_product(
    id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    product = product_service.get_product_by_id(db, product_id=id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Merchandise product not found",
        )
    return product


# ─── POST /products and /merchandise (Admin, Organizer, Officer, Treasurer) ───
@router.post("/products", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
@router.post("/products/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED, include_in_schema=False)
@router.post("/merchandise", response_model=ProductResponse, status_code=status.HTTP_201_CREATED, include_in_schema=False)
def create_product(
    product_in: ProductCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("admin", "organizer", "officer", "treasurer")),
):
    return product_service.create_product(db, product_in)


# ─── PUT /products/{id} and /merchandise/{id} ───
@router.put("/products/{id}", response_model=ProductResponse)
@router.put("/merchandise/{id}", response_model=ProductResponse, include_in_schema=False)
def update_product(
    id: int,
    product_in: ProductUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("admin", "organizer", "officer", "treasurer")),
):
    product = product_service.update_product(
        db,
        product_id=id,
        product_in=product_in,
    )
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Merchandise product not found",
        )
    return product


# ─── DELETE /products/{id} and /merchandise/{id} ───
@router.delete("/products/{id}", status_code=status.HTTP_204_NO_CONTENT)
@router.delete("/merchandise/{id}", status_code=status.HTTP_204_NO_CONTENT, include_in_schema=False)
def delete_product(
    id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("admin", "organizer", "officer")),
):
    success = product_service.delete_product(db, product_id=id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Merchandise product not found",
        )
    return None