from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.member import Member
from app.schemas.member import MemberCreate, MemberUpdate


def create_member(db: Session, member_in: MemberCreate) -> Member:
    existing_student = db.query(Member).filter(Member.student_id == member_in.student_id).first()
    if existing_student:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student ID already registered",
        )

    existing_user = db.query(Member).filter(Member.user_id == member_in.user_id).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User ID already associated with a member",
        )

    db_member = Member(**member_in.model_dump())
    db.add(db_member)
    db.commit()
    db.refresh(db_member)
    return db_member


def get_members(db: Session, skip: int = 0, limit: int = 100) -> List[Member]:
    return db.query(Member).offset(skip).limit(limit).all()


def get_member_by_id(db: Session, member_id: int) -> Optional[Member]:
    return db.query(Member).filter(Member.id == member_id).first()


def update_member(db: Session, member_id: int, member_in: MemberUpdate) -> Optional[Member]:
    db_member = get_member_by_id(db, member_id)
    if not db_member:
        return None

    update_data = member_in.model_dump(exclude_unset=True)

    if "student_id" in update_data and update_data["student_id"] != db_member.student_id:
        existing = db.query(Member).filter(Member.student_id == update_data["student_id"]).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Student ID already registered",
            )

    if "user_id" in update_data and update_data["user_id"] != db_member.user_id:
        existing = db.query(Member).filter(Member.user_id == update_data["user_id"]).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User ID already associated with a member",
            )

    for field, value in update_data.items():
        setattr(db_member, field, value)

    db.commit()
    db.refresh(db_member)
    return db_member


def delete_member(db: Session, member_id: int) -> bool:
    db_member = get_member_by_id(db, member_id)
    if not db_member:
        return False
    db.delete(db_member)
    db.commit()
    return True
