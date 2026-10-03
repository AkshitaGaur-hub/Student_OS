from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.routers.dependencies import require_roles
from app.schemas.member import MemberCreate, MemberResponse, MemberUpdate
from app.services import member_service

router = APIRouter(prefix="/members", tags=["members"])


@router.post("/", response_model=MemberResponse, status_code=status.HTTP_201_CREATED)
def create_member(
    member_in: MemberCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(require_roles("ADMIN")),
):
    return member_service.create_member(db, member_in)


@router.get("/", response_model=List[MemberResponse])
def get_members(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    user: dict = Depends(require_roles("ADMIN", "TREASURER", "VOLUNTEER", "MEMBER")),
):
    return member_service.get_members(db, skip=skip, limit=limit)


@router.get("/{id}", response_model=MemberResponse)
def get_member(
    id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(require_roles("ADMIN", "TREASURER", "VOLUNTEER", "MEMBER")),
):
    db_member = member_service.get_member_by_id(db, member_id=id)
    if not db_member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found",
        )
    return db_member


@router.put("/{id}", response_model=MemberResponse)
def update_member(
    id: int,
    member_in: MemberUpdate,
    db: Session = Depends(get_db),
    user: dict = Depends(require_roles("ADMIN")),
):
    db_member = member_service.update_member(db, member_id=id, member_in=member_in)
    if not db_member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found",
        )
    return db_member


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_member(
    id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(require_roles("ADMIN")),
):
    success = member_service.delete_member(db, member_id=id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found",
        )
    return None
