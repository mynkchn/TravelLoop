from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Enum
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.db import Base
import enum


class PackingCategory(str, enum.Enum):
    clothing = "clothing"
    documents = "documents"
    electronics = "electronics"
    toiletries = "toiletries"
    other = "other"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    photo_url = Column(String(500), nullable=True)
    language = Column(String(10), default="en")
    is_admin = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    trips = relationship("Trip", back_populates="owner", cascade="all, delete-orphan")
    notes = relationship("Note", back_populates="user", cascade="all, delete-orphan")
    checklist_items = relationship("ChecklistItem", back_populates="user", cascade="all, delete-orphan")


class City(Base):
    __tablename__ = "cities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    country = Column(String(100), nullable=False)
    region = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    cost_index = Column(Float, default=1.0)
    popularity_score = Column(Integer, default=0)
    image_url = Column(String(500), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    stops = relationship("Stop", back_populates="city")
    activities = relationship("Activity", back_populates="city")


class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    city_id = Column(Integer, ForeignKey("cities.id"), nullable=False)
    activity_type = Column(String(50), nullable=True)
    estimated_cost = Column(Float, default=0.0)
    duration_hours = Column(Float, default=1.0)
    image_url = Column(String(500), nullable=True)
    is_popular = Column(Boolean, default=False)

    city = relationship("City", back_populates="activities")
    stop_activities = relationship("StopActivity", back_populates="activity", cascade="all, delete-orphan")


class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    cover_photo_url = Column(String(500), nullable=True)
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    is_public = Column(Boolean, default=False)
    public_slug = Column(String(100), unique=True, nullable=True)
    total_budget = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    owner = relationship("User", back_populates="trips")
    stops = relationship("Stop", back_populates="trip", cascade="all, delete-orphan", order_by="Stop.order_index")
    notes = relationship("Note", back_populates="trip", cascade="all, delete-orphan")
    checklist_items = relationship("ChecklistItem", back_populates="trip", cascade="all, delete-orphan")


class Stop(Base):
    __tablename__ = "stops"

    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=False)
    city_id = Column(Integer, ForeignKey("cities.id"), nullable=False)
    order_index = Column(Integer, default=0)
    arrival_date = Column(DateTime, nullable=True)
    departure_date = Column(DateTime, nullable=True)
    accommodation_cost = Column(Float, default=0.0)
    transport_cost = Column(Float, default=0.0)
    meal_cost = Column(Float, default=0.0)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    trip = relationship("Trip", back_populates="stops")
    city = relationship("City", back_populates="stops")
    stop_activities = relationship("StopActivity", back_populates="stop", cascade="all, delete-orphan")


class StopActivity(Base):
    __tablename__ = "stop_activities"

    id = Column(Integer, primary_key=True, index=True)
    stop_id = Column(Integer, ForeignKey("stops.id"), nullable=False)
    activity_id = Column(Integer, ForeignKey("activities.id"), nullable=False)
    scheduled_time = Column(String(10), nullable=True)
    custom_cost = Column(Float, nullable=True)
    is_done = Column(Boolean, default=False)

    stop = relationship("Stop", back_populates="stop_activities")
    activity = relationship("Activity", back_populates="stop_activities")


class ChecklistItem(Base):
    __tablename__ = "checklist_items"

    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    item_name = Column(String(200), nullable=False)
    category = Column(String(50), default="other")
    is_packed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    trip = relationship("Trip", back_populates="checklist_items")
    user = relationship("User", back_populates="checklist_items")


class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    stop_id = Column(Integer, ForeignKey("stops.id"), nullable=True)
    title = Column(String(200), nullable=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    trip = relationship("Trip", back_populates="notes")
    user = relationship("User", back_populates="notes")
