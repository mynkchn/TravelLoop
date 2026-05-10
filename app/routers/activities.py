from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.db import get_db
from app.models.models import Activity, User
from app.schemas.schemas import ActivityCreate, ActivityResponse
from app.auth import get_current_user, get_admin_user

router = APIRouter()


@router.get("/", response_model=List[ActivityResponse])
def search_activities(
    q: Optional[str] = Query(None),
    city_id: Optional[int] = Query(None),
    activity_type: Optional[str] = Query(None),
    max_cost: Optional[float] = Query(None),
    max_duration: Optional[float] = Query(None),
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Activity)
    if q:
        query = query.filter(Activity.name.ilike(f"%{q}%"))
    if city_id:
        query = query.filter(Activity.city_id == city_id)
    if activity_type:
        query = query.filter(Activity.activity_type.ilike(f"%{activity_type}%"))
    if max_cost is not None:
        query = query.filter(Activity.estimated_cost <= max_cost)
    if max_duration is not None:
        query = query.filter(Activity.duration_hours <= max_duration)
    return query.offset(skip).limit(limit).all()


@router.get("/popular", response_model=List[ActivityResponse])
def popular_activities(city_id: Optional[int] = None, limit: int = 10, db: Session = Depends(get_db)):
    query = db.query(Activity).filter(Activity.is_popular == True)
    if city_id:
        query = query.filter(Activity.city_id == city_id)
    return query.limit(limit).all()


@router.get("/{activity_id}", response_model=ActivityResponse)
def get_activity(activity_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    return activity


@router.post("/", response_model=ActivityResponse, status_code=201)
def create_activity(body: ActivityCreate, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    activity = Activity(**body.model_dump())
    db.add(activity)
    db.commit()
    db.refresh(activity)
    return activity


@router.put("/{activity_id}", response_model=ActivityResponse)
def update_activity(activity_id: int, body: ActivityCreate, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(activity, field, value)
    db.commit()
    db.refresh(activity)
    return activity


@router.delete("/{activity_id}", status_code=204)
def delete_activity(activity_id: int, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    db.delete(activity)
    db.commit()
