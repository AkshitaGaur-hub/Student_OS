from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field

from app.schemas.product import ProductResponse


class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)


class OrderItemResponse(BaseModel):
    id: int
    order_id: int
    product_id: int
    quantity: int
    unit_price: float
    subtotal: float
    product: Optional[ProductResponse] = None

    model_config = ConfigDict(from_attributes=True)


class OrderCreate(BaseModel):
    items: List[OrderItemCreate]


class OrderResponse(BaseModel):
    id: int
    member_id: int
    total_amount: float
    status: str
    order_date: datetime
    updated_at: datetime
    items: List[OrderItemResponse] = []

    model_config = ConfigDict(from_attributes=True)
