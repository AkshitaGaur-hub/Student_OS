from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.announcement import Announcement
from app.schemas.business import AnnouncementCreate, AnnouncementUpdate, AnnouncementResponse
from app.dependencies import get_current_user, require_roles

router = APIRouter(prefix="/announcements", tags=["Announcements"])


@router.get("/", response_model=List[AnnouncementResponse])
def list_announcements(db: Session = Depends(get_db),
                       current_user: User = Depends(get_current_user)):
    return db.query(Announcement).order_by(Announcement.created_at.desc()).all()


@router.post("/", response_model=AnnouncementResponse, status_code=status.HTTP_201_CREATED)
def create_announcement(data: AnnouncementCreate, db: Session = Depends(get_db),
                        current_user: User = Depends(require_roles("admin", "organizer"))):
    ann = Announcement(**data.model_dump(), creator_id=current_user.id)
    db.add(ann)
    db.commit()
    db.refresh(ann)
    return ann


@router.put("/{ann_id}", response_model=AnnouncementResponse)
def update_announcement(ann_id: int, data: AnnouncementUpdate, db: Session = Depends(get_db),
                        current_user: User = Depends(require_roles("admin", "organizer"))):
    ann = db.query(Announcement).filter(Announcement.id == ann_id).first()
    if not ann:
        raise HTTPException(status_code=404, detail="Announcement not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(ann, k, v)
    db.commit()
    db.refresh(ann)
    return ann


@router.delete("/{ann_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_announcement(ann_id: int, db: Session = Depends(get_db),
                        current_user: User = Depends(require_roles("admin", "organizer"))):
    ann = db.query(Announcement).filter(Announcement.id == ann_id).first()
    if not ann:
        raise HTTPException(status_code=404, detail="Announcement not found")
    db.delete(ann)
    db.commit()

