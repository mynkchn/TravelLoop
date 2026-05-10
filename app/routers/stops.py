from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from app.database.db import get_db
from app.models.models import Stop, Trip, StopActivity, User
from app.schemas.schemas import StopCreate, StopUpdate, StopResponse, StopActivityCreate, StopActivityResponse, StopActivityUpdate
from app.auth import get_current_user

router = APIRouter()


def _owner_check(trip_id: int, current_user: User, db: Session) -> Trip:
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.owner_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found or access denied")
    return trip


def _load_stop(stop_id: int, db: Session) -> Stop:
    stop = db.query(Stop).options(
        joinedload(Stop.city),
        joinedload(Stop.stop_activities).joinedload(StopActivity.activity),
    ).filter(Stop.id == stop_id).first()
    if not stop:
        raise HTTPException(status_code=404, detail="Stop not found")
    return stop


@router.post("/trips/{trip_id}/stops", response_model=StopResponse, status_code=201)
def add_stop(trip_id: int, body: StopCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    _owner_check(trip_id, current_user, db)
    stop = Stop(**body.model_dump(), trip_id=trip_id)
    db.add(stop)
    db.commit()
    db.refresh(stop)
    return _load_stop(stop.id, db)


@router.get("/trips/{trip_id}/stops", response_model=List[StopResponse])
def list_stops(trip_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    if trip.owner_id != current_user.id and not trip.is_public and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Access denied")
    stops = db.query(Stop).options(
        joinedload(Stop.city),
        joinedload(Stop.stop_activities).joinedload(StopActivity.activity),
    ).filter(Stop.trip_id == trip_id).order_by(Stop.order_index).all()
    return stops


@router.put("/stops/{stop_id}", response_model=StopResponse)
def update_stop(stop_id: int, body: StopUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    stop = db.query(Stop).filter(Stop.id == stop_id).first()
    if not stop:
        raise HTTPException(status_code=404, detail="Stop not found")
    _owner_check(stop.trip_id, current_user, db)
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(stop, field, value)
    db.commit()
    return _load_stop(stop_id, db)


@router.delete("/stops/{stop_id}", status_code=204)
def delete_stop(stop_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    stop = db.query(Stop).filter(Stop.id == stop_id).first()
    if not stop:
        raise HTTPException(status_code=404, detail="Stop not found")
    _owner_check(stop.trip_id, current_user, db)
    db.delete(stop)
    db.commit()


@router.put("/trips/{trip_id}/stops/reorder")
def reorder_stops(trip_id: int, stop_ids: List[int], db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    _owner_check(trip_id, current_user, db)
    for idx, stop_id in enumerate(stop_ids):
        db.query(Stop).filter(Stop.id == stop_id, Stop.trip_id == trip_id).update({"order_index": idx})
    db.commit()
    return {"message": "Stops reordered"}


# ─── Stop Activities ──────────────────────────────────────────────────────────

@router.post("/stops/{stop_id}/activities", response_model=StopActivityResponse, status_code=201)
def add_activity_to_stop(stop_id: int, body: StopActivityCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    stop = db.query(Stop).filter(Stop.id == stop_id).first()
    if not stop:
        raise HTTPException(status_code=404, detail="Stop not found")
    _owner_check(stop.trip_id, current_user, db)
    sa = StopActivity(**body.model_dump(), stop_id=stop_id)
    db.add(sa)
    db.commit()
    db.refresh(sa)
    return db.query(StopActivity).options(
        joinedload(StopActivity.activity)
    ).filter(StopActivity.id == sa.id).first()


@router.put("/stop-activities/{sa_id}", response_model=StopActivityResponse)
def update_stop_activity(sa_id: int, body: StopActivityUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    sa = db.query(StopActivity).filter(StopActivity.id == sa_id).first()
    if not sa:
        raise HTTPException(status_code=404, detail="Stop activity not found")
    stop = db.query(Stop).filter(Stop.id == sa.stop_id).first()
    _owner_check(stop.trip_id, current_user, db)
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(sa, field, value)
    db.commit()
    return db.query(StopActivity).options(joinedload(StopActivity.activity)).filter(StopActivity.id == sa_id).first()


@router.delete("/stop-activities/{sa_id}", status_code=204)
def remove_activity_from_stop(sa_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    sa = db.query(StopActivity).filter(StopActivity.id == sa_id).first()
    if not sa:
        raise HTTPException(status_code=404, detail="Stop activity not found")
    stop = db.query(Stop).filter(Stop.id == sa.stop_id).first()
    _owner_check(stop.trip_id, current_user, db)
    db.delete(sa)
    db.commit()
