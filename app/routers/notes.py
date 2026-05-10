from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database.db import get_db
from app.models.models import Note, Trip, User
from app.schemas.schemas import NoteCreate, NoteUpdate, NoteResponse
from app.auth import get_current_user

router = APIRouter()


def _trip_access(trip_id: int, current_user: User, db: Session):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.owner_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found or access denied")
    return trip


@router.get("/trips/{trip_id}", response_model=List[NoteResponse])
def get_notes(trip_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    _trip_access(trip_id, current_user, db)
    return db.query(Note).filter(
        Note.trip_id == trip_id, Note.user_id == current_user.id
    ).order_by(Note.created_at.desc()).all()


@router.post("/trips/{trip_id}", response_model=NoteResponse, status_code=201)
def create_note(trip_id: int, body: NoteCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    _trip_access(trip_id, current_user, db)
    note = Note(**body.model_dump(), trip_id=trip_id, user_id=current_user.id)
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@router.put("/{note_id}", response_model=NoteResponse)
def update_note(note_id: int, body: NoteUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    note = db.query(Note).filter(Note.id == note_id, Note.user_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(note, field, value)
    db.commit()
    db.refresh(note)
    return note


@router.delete("/{note_id}", status_code=204)
def delete_note(note_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    note = db.query(Note).filter(Note.id == note_id, Note.user_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    db.delete(note)
    db.commit()
