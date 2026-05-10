from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app.database.db import get_db
from app.models.models import Trip, Stop, StopActivity, User
from app.schemas.schemas import BudgetBreakdown
from app.auth import get_current_user

router = APIRouter()


@router.get("/trips/{trip_id}", response_model=BudgetBreakdown)
def get_budget_breakdown(trip_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    if trip.owner_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Access denied")

    stops = db.query(Stop).options(
        joinedload(Stop.city),
        joinedload(Stop.stop_activities).joinedload(StopActivity.activity),
    ).filter(Stop.trip_id == trip_id).order_by(Stop.order_index).all()

    transport_total = 0.0
    accommodation_total = 0.0
    meals_total = 0.0
    activities_total = 0.0
    per_stop = []

    for stop in stops:
        stop_activity_cost = sum(
            (sa.custom_cost if sa.custom_cost is not None else sa.activity.estimated_cost)
            for sa in stop.stop_activities
            if sa.activity
        )
        stop_total = stop.transport_cost + stop.accommodation_cost + stop.meal_cost + stop_activity_cost

        transport_total += stop.transport_cost
        accommodation_total += stop.accommodation_cost
        meals_total += stop.meal_cost
        activities_total += stop_activity_cost

        per_stop.append({
            "stop_id": stop.id,
            "city": stop.city.name if stop.city else "Unknown",
            "transport": stop.transport_cost,
            "accommodation": stop.accommodation_cost,
            "meals": stop.meal_cost,
            "activities": stop_activity_cost,
            "total": stop_total,
        })

    total_estimated = transport_total + accommodation_total + meals_total + activities_total

    return BudgetBreakdown(
        total_budget=trip.total_budget,
        total_estimated=total_estimated,
        remaining=trip.total_budget - total_estimated,
        transport_total=transport_total,
        accommodation_total=accommodation_total,
        meals_total=meals_total,
        activities_total=activities_total,
        per_stop=per_stop,
    )
