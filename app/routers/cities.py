from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.db import get_db
from app.models.models import City, User
from app.schemas.schemas import CityCreate, CityResponse
from app.auth import get_current_user, get_admin_user

router = APIRouter()


@router.get("/", response_model=List[CityResponse])
def search_cities(
    q: Optional[str] = Query(None, description="Search by city name or country"),
    country: Optional[str] = Query(None),
    region: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(City)
    if q:
        query = query.filter(
            City.name.ilike(f"%{q}%") | City.country.ilike(f"%{q}%")
        )
    if country:
        query = query.filter(City.country.ilike(f"%{country}%"))
    if region:
        query = query.filter(City.region.ilike(f"%{region}%"))
    return query.order_by(City.popularity_score.desc()).offset(skip).limit(limit).all()


@router.get("/popular", response_model=List[CityResponse])
def popular_cities(limit: int = 10, db: Session = Depends(get_db)):
    return db.query(City).order_by(City.popularity_score.desc()).limit(limit).all()


@router.get("/{city_id}", response_model=CityResponse)
def get_city(city_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    city = db.query(City).filter(City.id == city_id).first()
    if not city:
        raise HTTPException(status_code=404, detail="City not found")
    return city


@router.post("/", response_model=CityResponse, status_code=201)
def create_city(body: CityCreate, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    city = City(**body.model_dump())
    db.add(city)
    db.commit()
    db.refresh(city)
    return city


@router.put("/{city_id}", response_model=CityResponse)
def update_city(city_id: int, body: CityCreate, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    city = db.query(City).filter(City.id == city_id).first()
    if not city:
        raise HTTPException(status_code=404, detail="City not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(city, field, value)
    db.commit()
    db.refresh(city)
    return city


@router.delete("/{city_id}", status_code=204)
def delete_city(city_id: int, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    city = db.query(City).filter(City.id == city_id).first()
    if not city:
        raise HTTPException(status_code=404, detail="City not found")
    db.delete(city)
    db.commit()
