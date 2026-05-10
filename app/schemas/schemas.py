from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime


# ─── Auth ────────────────────────────────────────────────────────────────────

class SignupRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    name: str
    email: str
    is_admin: bool


# ─── User ────────────────────────────────────────────────────────────────────

class UserUpdate(BaseModel):
    name: Optional[str] = None
    photo_url: Optional[str] = None
    language: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    photo_url: Optional[str]
    language: str
    is_admin: bool
    is_active: bool
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


# ─── City ────────────────────────────────────────────────────────────────────

class CityCreate(BaseModel):
    name: str
    country: str
    region: Optional[str] = None
    description: Optional[str] = None
    cost_index: float = 1.0
    popularity_score: int = 0
    image_url: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class CityResponse(BaseModel):
    id: int
    name: str
    country: str
    region: Optional[str]
    description: Optional[str]
    cost_index: float
    popularity_score: int
    image_url: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]

    class Config:
        from_attributes = True


# ─── Activity ────────────────────────────────────────────────────────────────

class ActivityCreate(BaseModel):
    name: str
    description: Optional[str] = None
    city_id: int
    activity_type: Optional[str] = None
    estimated_cost: float = 0.0
    duration_hours: float = 1.0
    image_url: Optional[str] = None
    is_popular: bool = False


class ActivityResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    city_id: int
    activity_type: Optional[str]
    estimated_cost: float
    duration_hours: float
    image_url: Optional[str]
    is_popular: bool

    class Config:
        from_attributes = True


# ─── Stop Activity ────────────────────────────────────────────────────────────

class StopActivityCreate(BaseModel):
    activity_id: int
    scheduled_time: Optional[str] = None
    custom_cost: Optional[float] = None


class StopActivityResponse(BaseModel):
    id: int
    stop_id: int
    activity_id: int
    scheduled_time: Optional[str]
    custom_cost: Optional[float]
    is_done: bool
    activity: Optional[ActivityResponse]

    class Config:
        from_attributes = True


class StopActivityUpdate(BaseModel):
    scheduled_time: Optional[str] = None
    custom_cost: Optional[float] = None
    is_done: Optional[bool] = None


# ─── Stop ─────────────────────────────────────────────────────────────────────

class StopCreate(BaseModel):
    city_id: int
    order_index: int = 0
    arrival_date: Optional[datetime] = None
    departure_date: Optional[datetime] = None
    accommodation_cost: float = 0.0
    transport_cost: float = 0.0
    meal_cost: float = 0.0
    notes: Optional[str] = None


class StopUpdate(BaseModel):
    order_index: Optional[int] = None
    arrival_date: Optional[datetime] = None
    departure_date: Optional[datetime] = None
    accommodation_cost: Optional[float] = None
    transport_cost: Optional[float] = None
    meal_cost: Optional[float] = None
    notes: Optional[str] = None


class StopResponse(BaseModel):
    id: int
    trip_id: int
    city_id: int
    order_index: int
    arrival_date: Optional[datetime]
    departure_date: Optional[datetime]
    accommodation_cost: float
    transport_cost: float
    meal_cost: float
    notes: Optional[str]
    city: Optional[CityResponse]
    stop_activities: List[StopActivityResponse] = []

    class Config:
        from_attributes = True


# ─── Trip ─────────────────────────────────────────────────────────────────────

class TripCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    description: Optional[str] = None
    cover_photo_url: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    total_budget: float = 0.0


class TripUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    cover_photo_url: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    total_budget: Optional[float] = None
    is_public: Optional[bool] = None


class TripResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    cover_photo_url: Optional[str]
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    owner_id: int
    is_public: bool
    public_slug: Optional[str]
    total_budget: float
    created_at: Optional[datetime]
    stops: List[StopResponse] = []

    class Config:
        from_attributes = True


class TripSummaryResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    cover_photo_url: Optional[str]
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    is_public: bool
    public_slug: Optional[str]
    total_budget: float
    created_at: Optional[datetime]
    destination_count: int = 0

    class Config:
        from_attributes = True


# ─── Checklist ────────────────────────────────────────────────────────────────

class ChecklistItemCreate(BaseModel):
    item_name: str = Field(..., min_length=1)
    category: str = "other"


class ChecklistItemUpdate(BaseModel):
    item_name: Optional[str] = None
    category: Optional[str] = None
    is_packed: Optional[bool] = None


class ChecklistItemResponse(BaseModel):
    id: int
    trip_id: int
    user_id: int
    item_name: str
    category: str
    is_packed: bool
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


# ─── Note ─────────────────────────────────────────────────────────────────────

class NoteCreate(BaseModel):
    title: Optional[str] = None
    content: str = Field(..., min_length=1)
    stop_id: Optional[int] = None


class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None


class NoteResponse(BaseModel):
    id: int
    trip_id: int
    user_id: int
    stop_id: Optional[int]
    title: Optional[str]
    content: str
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# ─── Budget ───────────────────────────────────────────────────────────────────

class BudgetBreakdown(BaseModel):
    total_budget: float
    total_estimated: float
    remaining: float
    transport_total: float
    accommodation_total: float
    meals_total: float
    activities_total: float
    per_stop: List[dict]


# ─── Admin ────────────────────────────────────────────────────────────────────

class AdminStats(BaseModel):
    total_users: int
    total_trips: int
    total_cities: int
    total_activities: int
    public_trips: int
    top_cities: List[dict]
    recent_trips: List[dict]
