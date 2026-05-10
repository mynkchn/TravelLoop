"""
Run this once to seed the database with sample cities, activities, and an admin user.
    python seed.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app.database.db import SessionLocal, engine, Base
from app.models.models import User, City, Activity
from app.auth import hash_password

Base.metadata.create_all(bind=engine)

CITIES = [
    {"name": "Paris", "country": "France", "region": "Europe", "cost_index": 2.2, "popularity_score": 98, "description": "City of lights, art, and cuisine.", "latitude": 48.8566, "longitude": 2.3522},
    {"name": "Tokyo", "country": "Japan", "region": "Asia", "cost_index": 2.0, "popularity_score": 97, "description": "Ultra-modern city meets ancient tradition.", "latitude": 35.6762, "longitude": 139.6503},
    {"name": "New York", "country": "USA", "region": "North America", "cost_index": 2.5, "popularity_score": 96, "description": "The city that never sleeps.", "latitude": 40.7128, "longitude": -74.0060},
    {"name": "Rome", "country": "Italy", "region": "Europe", "cost_index": 1.8, "popularity_score": 95, "description": "Eternal city full of history.", "latitude": 41.9028, "longitude": 12.4964},
    {"name": "Barcelona", "country": "Spain", "region": "Europe", "cost_index": 1.7, "popularity_score": 93, "description": "Vibrant culture, architecture and beaches.", "latitude": 41.3851, "longitude": 2.1734},
    {"name": "Bangkok", "country": "Thailand", "region": "Asia", "cost_index": 0.9, "popularity_score": 92, "description": "Street food paradise and golden temples.", "latitude": 13.7563, "longitude": 100.5018},
    {"name": "Amsterdam", "country": "Netherlands", "region": "Europe", "cost_index": 2.0, "popularity_score": 90, "description": "Canals, museums, and cycling culture.", "latitude": 52.3676, "longitude": 4.9041},
    {"name": "Dubai", "country": "UAE", "region": "Middle East", "cost_index": 2.3, "popularity_score": 91, "description": "Ultramodern architecture and luxury.", "latitude": 25.2048, "longitude": 55.2708},
    {"name": "Sydney", "country": "Australia", "region": "Oceania", "cost_index": 2.1, "popularity_score": 89, "description": "Harbour city with stunning beaches.", "latitude": -33.8688, "longitude": 151.2093},
    {"name": "Bali", "country": "Indonesia", "region": "Asia", "cost_index": 0.7, "popularity_score": 94, "description": "Island of gods – temples, rice fields and surf.", "latitude": -8.3405, "longitude": 115.0920},
    {"name": "London", "country": "UK", "region": "Europe", "cost_index": 2.4, "popularity_score": 96, "description": "Historic capital with world-class culture.", "latitude": 51.5074, "longitude": -0.1278},
    {"name": "Istanbul", "country": "Turkey", "region": "Europe/Asia", "cost_index": 1.1, "popularity_score": 88, "description": "Where East meets West.", "latitude": 41.0082, "longitude": 28.9784},
    {"name": "Prague", "country": "Czech Republic", "region": "Europe", "cost_index": 1.2, "popularity_score": 87, "description": "Fairy-tale architecture in the heart of Europe.", "latitude": 50.0755, "longitude": 14.4378},
    {"name": "Lisbon", "country": "Portugal", "region": "Europe", "cost_index": 1.4, "popularity_score": 86, "description": "Hilly coastal city with tram rides and fado.", "latitude": 38.7169, "longitude": -9.1395},
    {"name": "Singapore", "country": "Singapore", "region": "Asia", "cost_index": 2.2, "popularity_score": 91, "description": "Garden city – clean, modern, and diverse.", "latitude": 1.3521, "longitude": 103.8198},
]

ACTIVITIES = [
    # Paris
    {"name": "Eiffel Tower Visit", "city_name": "Paris", "activity_type": "sightseeing", "estimated_cost": 26, "duration_hours": 2, "is_popular": True},
    {"name": "Louvre Museum", "city_name": "Paris", "activity_type": "culture", "estimated_cost": 17, "duration_hours": 3, "is_popular": True},
    {"name": "Seine River Cruise", "city_name": "Paris", "activity_type": "adventure", "estimated_cost": 15, "duration_hours": 1},
    {"name": "Montmartre Walking Tour", "city_name": "Paris", "activity_type": "sightseeing", "estimated_cost": 0, "duration_hours": 2},
    # Tokyo
    {"name": "Shibuya Crossing", "city_name": "Tokyo", "activity_type": "sightseeing", "estimated_cost": 0, "duration_hours": 1, "is_popular": True},
    {"name": "TeamLab Borderless", "city_name": "Tokyo", "activity_type": "culture", "estimated_cost": 32, "duration_hours": 3, "is_popular": True},
    {"name": "Sushi Making Class", "city_name": "Tokyo", "activity_type": "food", "estimated_cost": 60, "duration_hours": 2},
    {"name": "Senso-ji Temple", "city_name": "Tokyo", "activity_type": "sightseeing", "estimated_cost": 0, "duration_hours": 1.5, "is_popular": True},
    # New York
    {"name": "Statue of Liberty", "city_name": "New York", "activity_type": "sightseeing", "estimated_cost": 24, "duration_hours": 3, "is_popular": True},
    {"name": "Central Park Cycling", "city_name": "New York", "activity_type": "adventure", "estimated_cost": 15, "duration_hours": 2},
    {"name": "Broadway Show", "city_name": "New York", "activity_type": "entertainment", "estimated_cost": 120, "duration_hours": 3, "is_popular": True},
    # Rome
    {"name": "Colosseum Tour", "city_name": "Rome", "activity_type": "sightseeing", "estimated_cost": 18, "duration_hours": 2, "is_popular": True},
    {"name": "Vatican Museums", "city_name": "Rome", "activity_type": "culture", "estimated_cost": 20, "duration_hours": 3, "is_popular": True},
    {"name": "Pasta Making Class", "city_name": "Rome", "activity_type": "food", "estimated_cost": 45, "duration_hours": 2},
    # Barcelona
    {"name": "Sagrada Familia", "city_name": "Barcelona", "activity_type": "sightseeing", "estimated_cost": 26, "duration_hours": 2, "is_popular": True},
    {"name": "Park Güell", "city_name": "Barcelona", "activity_type": "sightseeing", "estimated_cost": 10, "duration_hours": 1.5, "is_popular": True},
    {"name": "Tapas Food Tour", "city_name": "Barcelona", "activity_type": "food", "estimated_cost": 55, "duration_hours": 3},
    # Bangkok
    {"name": "Grand Palace", "city_name": "Bangkok", "activity_type": "sightseeing", "estimated_cost": 15, "duration_hours": 2, "is_popular": True},
    {"name": "Street Food Tour", "city_name": "Bangkok", "activity_type": "food", "estimated_cost": 20, "duration_hours": 3, "is_popular": True},
    {"name": "Chao Phraya River Cruise", "city_name": "Bangkok", "activity_type": "adventure", "estimated_cost": 12, "duration_hours": 1.5},
    # Bali
    {"name": "Ubud Rice Terraces", "city_name": "Bali", "activity_type": "sightseeing", "estimated_cost": 5, "duration_hours": 2, "is_popular": True},
    {"name": "Surf Lesson", "city_name": "Bali", "activity_type": "adventure", "estimated_cost": 35, "duration_hours": 2, "is_popular": True},
    {"name": "Temple Tanah Lot", "city_name": "Bali", "activity_type": "sightseeing", "estimated_cost": 3, "duration_hours": 1.5},
    # London
    {"name": "British Museum", "city_name": "London", "activity_type": "culture", "estimated_cost": 0, "duration_hours": 3, "is_popular": True},
    {"name": "Tower of London", "city_name": "London", "activity_type": "sightseeing", "estimated_cost": 30, "duration_hours": 2, "is_popular": True},
    {"name": "Thames River Cruise", "city_name": "London", "activity_type": "adventure", "estimated_cost": 20, "duration_hours": 1},
    # Singapore
    {"name": "Gardens by the Bay", "city_name": "Singapore", "activity_type": "sightseeing", "estimated_cost": 20, "duration_hours": 2, "is_popular": True},
    {"name": "Marina Bay Sands Skypark", "city_name": "Singapore", "activity_type": "sightseeing", "estimated_cost": 26, "duration_hours": 1, "is_popular": True},
    {"name": "Hawker Centre Food Tour", "city_name": "Singapore", "activity_type": "food", "estimated_cost": 15, "duration_hours": 2},
]


def seed():
    db = SessionLocal()
    try:
        # Admin user
        existing_admin = db.query(User).filter(User.email == "admin@traveloop.com").first()
        if not existing_admin:
            admin = User(
                name="Admin",
                email="admin@traveloop.com",
                hashed_password=hash_password("admin123"),
                is_admin=True,
            )
            db.add(admin)
            db.commit()
            print("✅ Admin user created: admin@traveloop.com / admin123")
        else:
            print("ℹ️  Admin already exists")

        # Demo user
        existing_demo = db.query(User).filter(User.email == "demo@traveloop.com").first()
        if not existing_demo:
            demo = User(
                name="Demo Traveler",
                email="demo@traveloop.com",
                hashed_password=hash_password("demo123"),
            )
            db.add(demo)
            db.commit()
            print("✅ Demo user created: demo@traveloop.com / demo123")

        # Cities
        city_map = {}
        for c in CITIES:
            existing = db.query(City).filter(City.name == c["name"], City.country == c["country"]).first()
            if not existing:
                city = City(**c)
                db.add(city)
                db.commit()
                db.refresh(city)
                city_map[c["name"]] = city.id
                print(f"✅ City: {c['name']}")
            else:
                city_map[c["name"]] = existing.id

        # Activities
        for a in ACTIVITIES:
            city_name = a.pop("city_name")
            city_id = city_map.get(city_name)
            if not city_id:
                print(f"⚠️  City not found for activity: {city_name}")
                continue
            existing = db.query(Activity).filter(Activity.name == a["name"], Activity.city_id == city_id).first()
            if not existing:
                activity = Activity(**a, city_id=city_id)
                db.add(activity)
                print(f"  ✅ Activity: {a['name']} ({city_name})")
            else:
                a["city_name"] = city_name  # restore for next iteration (not needed but safe)
        db.commit()
        print("\n🎉 Seeding complete!")
    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
