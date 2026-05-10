from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.database.db import get_db
from app.models.models import User, Trip, City, Activity, Stop
from app.schemas.schemas import AdminStats, UserResponse
from app.auth import get_admin_user

router = APIRouter()


@router.get("/stats", response_model=AdminStats)
def get_stats(db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    total_users = db.query(User).count()
    total_trips = db.query(Trip).count()
    total_cities = db.query(City).count()
    total_activities = db.query(Activity).count()
    public_trips = db.query(Trip).filter(Trip.is_public == True).count()

    # Top cities by number of stops
    top_cities_raw = (
        db.query(City.name, func.count(Stop.id).label("stop_count"))
        .join(Stop, Stop.city_id == City.id)
        .group_by(City.id)
        .order_by(func.count(Stop.id).desc())
        .limit(10)
        .all()
    )
    top_cities = [{"city": row[0], "stop_count": row[1]} for row in top_cities_raw]

    # Recent trips
    recent_trips_raw = db.query(Trip).order_by(Trip.created_at.desc()).limit(10).all()
    recent_trips = [
        {"id": t.id, "name": t.name, "owner_id": t.owner_id, "created_at": str(t.created_at)}
        for t in recent_trips_raw
    ]

    return AdminStats(
        total_users=total_users,
        total_trips=total_trips,
        total_cities=total_cities,
        total_activities=total_activities,
        public_trips=public_trips,
        top_cities=top_cities,
        recent_trips=recent_trips,
    )


@router.get("/users", response_model=List[UserResponse])
def list_users(skip: int = 0, limit: int = 50, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    return db.query(User).offset(skip).limit(limit).all()


@router.put("/users/{user_id}/toggle-active")
def toggle_user_active(user_id: int, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = not user.is_active
    db.commit()
    return {"user_id": user_id, "is_active": user.is_active}


@router.put("/users/{user_id}/toggle-admin")
def toggle_admin(user_id: int, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="User not found")
    user.is_admin = not user.is_admin
    db.commit()
    return {"user_id": user_id, "is_admin": user.is_admin}
