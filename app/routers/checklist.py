from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database.db import get_db
from app.models.models import ChecklistItem, Trip, User
from app.schemas.schemas import ChecklistItemCreate, ChecklistItemUpdate, ChecklistItemResponse
from app.auth import get_current_user

router = APIRouter()


def _trip_access(trip_id: int, current_user: User, db: Session):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.owner_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found or access denied")
    return trip


@router.get("/trips/{trip_id}", response_model=List[ChecklistItemResponse])
def get_checklist(trip_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    _trip_access(trip_id, current_user, db)
    return db.query(ChecklistItem).filter(
        ChecklistItem.trip_id == trip_id, ChecklistItem.user_id == current_user.id
    ).order_by(ChecklistItem.category, ChecklistItem.created_at).all()


@router.post("/trips/{trip_id}", response_model=ChecklistItemResponse, status_code=201)
def add_checklist_item(trip_id: int, body: ChecklistItemCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    _trip_access(trip_id, current_user, db)
    item = ChecklistItem(**body.model_dump(), trip_id=trip_id, user_id=current_user.id)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/{item_id}", response_model=ChecklistItemResponse)
def update_checklist_item(item_id: int, body: ChecklistItemUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = db.query(ChecklistItem).filter(ChecklistItem.id == item_id, ChecklistItem.user_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{item_id}", status_code=204)
def delete_checklist_item(item_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = db.query(ChecklistItem).filter(ChecklistItem.id == item_id, ChecklistItem.user_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(item)
    db.commit()


@router.post("/trips/{trip_id}/reset", status_code=200)
def reset_checklist(trip_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    _trip_access(trip_id, current_user, db)
    db.query(ChecklistItem).filter(
        ChecklistItem.trip_id == trip_id, ChecklistItem.user_id == current_user.id
    ).update({"is_packed": False})
    db.commit()
    return {"message": "Checklist reset"}
