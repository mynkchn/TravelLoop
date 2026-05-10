from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from app.database.db import get_db
from app.models.models import Trip, Stop, User
from app.schemas.schemas import TripCreate, TripUpdate, TripResponse, TripSummaryResponse
from app.auth import get_current_user
import uuid

router = APIRouter()


def _get_trip_or_404(trip_id: int, db: Session) -> Trip:
    trip = db.query(Trip).options(
        joinedload(Trip.stops).joinedload(Stop.city),
        joinedload(Trip.stops).joinedload(Stop.stop_activities),
    ).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip


@router.post("/", response_model=TripResponse, status_code=201)
def create_trip(body: TripCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    trip = Trip(**body.model_dump(), owner_id=current_user.id)
    db.add(trip)
    db.commit()
    db.refresh(trip)
    return _get_trip_or_404(trip.id, db)


@router.get("/", response_model=List[TripSummaryResponse])
def list_my_trips(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    trips = db.query(Trip).filter(Trip.owner_id == current_user.id).order_by(Trip.created_at.desc()).all()
    result = []
    for t in trips:
        stops = db.query(Stop).filter(Stop.trip_id == t.id).all()
        result.append(TripSummaryResponse(
            id=t.id, name=t.name, description=t.description,
            cover_photo_url=t.cover_photo_url, start_date=t.start_date,
            end_date=t.end_date, is_public=t.is_public,
            public_slug=t.public_slug, total_budget=t.total_budget,
            created_at=t.created_at, destination_count=len(stops),
        ))
    return result


@router.get("/public", response_model=List[TripSummaryResponse])
def list_public_trips(db: Session = Depends(get_db)):
    trips = db.query(Trip).filter(Trip.is_public == True).order_by(Trip.created_at.desc()).limit(50).all()
    result = []
    for t in trips:
        stops = db.query(Stop).filter(Stop.trip_id == t.id).all()
        result.append(TripSummaryResponse(
            id=t.id, name=t.name, description=t.description,
            cover_photo_url=t.cover_photo_url, start_date=t.start_date,
            end_date=t.end_date, is_public=t.is_public,
            public_slug=t.public_slug, total_budget=t.total_budget,
            created_at=t.created_at, destination_count=len(stops),
        ))
    return result


@router.get("/public/{slug}", response_model=TripResponse)
def get_public_trip(slug: str, db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.public_slug == slug, Trip.is_public == True).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Public trip not found")
    return _get_trip_or_404(trip.id, db)


@router.get("/{trip_id}", response_model=TripResponse)
def get_trip(trip_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    trip = _get_trip_or_404(trip_id, db)
    if trip.owner_id != current_user.id and not trip.is_public and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Access denied")
    return trip


@router.put("/{trip_id}", response_model=TripResponse)
def update_trip(trip_id: int, body: TripUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.owner_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(trip, field, value)
    # Auto-generate public slug when making public
    if body.is_public and not trip.public_slug:
        trip.public_slug = str(uuid.uuid4())[:8]
    db.commit()
    return _get_trip_or_404(trip_id, db)


@router.post("/{trip_id}/share")
def share_trip(trip_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.owner_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    if not trip.public_slug:
        trip.public_slug = str(uuid.uuid4())[:8]
    trip.is_public = True
    db.commit()
    return {"public_slug": trip.public_slug, "share_url": f"/api/trips/public/{trip.public_slug}"}


@router.post("/{trip_id}/unshare")
def unshare_trip(trip_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.owner_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    trip.is_public = False
    db.commit()
    return {"message": "Trip is now private"}


@router.post("/{trip_id}/copy", response_model=TripResponse, status_code=201)
def copy_trip(trip_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    original = _get_trip_or_404(trip_id, db)
    if not original.is_public and original.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Cannot copy private trip")
    new_trip = Trip(
        name=f"Copy of {original.name}",
        description=original.description,
        cover_photo_url=original.cover_photo_url,
        start_date=original.start_date,
        end_date=original.end_date,
        total_budget=original.total_budget,
        owner_id=current_user.id,
    )
    db.add(new_trip)
    db.commit()
    db.refresh(new_trip)
    for stop in original.stops:
        new_stop = Stop(
            trip_id=new_trip.id,
            city_id=stop.city_id,
            order_index=stop.order_index,
            arrival_date=stop.arrival_date,
            departure_date=stop.departure_date,
            accommodation_cost=stop.accommodation_cost,
            transport_cost=stop.transport_cost,
            meal_cost=stop.meal_cost,
            notes=stop.notes,
        )
        db.add(new_stop)
    db.commit()
    return _get_trip_or_404(new_trip.id, db)


@router.delete("/{trip_id}", status_code=204)
def delete_trip(trip_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.owner_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    db.delete(trip)
    db.commit()
