# Frontend

The TravelLoop frontend is a React-based single-page application built with Vite and styled with Tailwind CSS. It provides a complete user interface for all backend features including user authentication, trip management, itinerary planning, budget tracking, packing lists, and travel journaling.

## Technology Stack

- React 19
- Vite (Build tool)
- Tailwind CSS v4 (Styling)
- React Router v7 (Routing)
- Native Fetch API (HTTP client)

  ## Project Structure

```
frontend/
├── src/
│   ├── lib/
│   │   └── api.js              # API client with JWT authentication
│   ├── hooks/
│   │   └── useAuth.js          # Authentication state management
│   ├── components/
│   │   ├── Navbar.jsx         # Navigation component
│   │   ├── Loading.jsx         # Loading spinners and skeleton loaders
│   │   └── Toast.jsx           # Toast notification system
│   ├── pages/
│   │   ├── Home.jsx            # Landing page
│   │   ├── Login.jsx           # User login
│   │   ├── Signup.jsx         # User registration
│   │   ├── Dashboard.jsx       # User dashboard with trip overview
│   │   ├── CreateTrip.jsx    # Trip creation form
│   │   ├── MyTrips.jsx        # List of user's trips
│   │   ├── TripDetail.jsx     # Trip details with tabs
│   │   ├── ItineraryBuilder.jsx  # Add and manage city stops
│   │   ├── CitySearch.jsx     # Browse and search cities
│   │   ├── BudgetBreakdown.jsx   # Detailed budget view
│   │   ├── PackingChecklist.jsx   # Packing list management
│   │   ├── Notes.jsx          # Travel journal
│   │   ├── SharedTrip.jsx     # Public trip view
│   │   └── Profile.jsx         # User profile settings
│   ├── App.jsx                # Main application with routing
│   ├── main.jsx               # Application entry point
│   └── index.css              # Global styles and Tailwind
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── index.html
```

## Installation

Navigate to the frontend directory and install dependencies:

```bash
cd frontend
npm install
```

## Configuration

Create a .env file in the frontend directory to configure the API base URL:

```
VITE_API_URL=http://localhost:8000
```

The default URL points to the local development server. Update this value when deploying to production.

## Running the Development Server

```bash
cd frontend
npm run dev
```

The development server starts at http://localhost:5173 by default.

## Building for Production

```bash
cd frontend
npm run build
```

The production build is generated in the dist directory. This folder can be deployed to any static hosting service.

## Preview Production Build

To preview the production build locally:

```bash
npm run preview
```

## Features

The frontend provides a complete user interface for all TravelLoop features:

- User authentication with JWT tokens
- Trip creation and management
- Itinerary builder with city stops
- Budget tracking and cost breakdown
- Packing checklist with categories
- Travel journal with notes
- Public trip sharing
- User profile management

## API Integration

The frontend communicates with the backend API at endpoints prefixed with /api/. All authenticated requests include the JWT token in the Authorization header. The frontend automatically handles token expiration and redirects users to the login page when authentication is required.

## Browser Support

The application supports modern browsers including Chrome, Firefox, Safari, and Edge.

# Traveloop — Backend API

Traveloop is a personalized travel planning platform. This repository contains the backend REST API built with FastAPI and SQLite. It provides all the data and business logic required for a frontend to implement the full Traveloop feature set described in the product specification.

---

## Table of Contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Running the Server](#running-the-server)
- [Project Structure](#project-structure)
- [Database](#database)
- [Authentication](#authentication)
- [API Reference](#api-reference)
  - [Auth](#auth)
  - [Users](#users)
  - [Trips](#trips)
  - [Stops and Itinerary Builder](#stops-and-itinerary-builder)
  - [Cities](#cities)
  - [Activities](#activities)
  - [Budget and Cost Breakdown](#budget-and-cost-breakdown)
  - [Packing Checklist](#packing-checklist)
  - [Notes and Journal](#notes-and-journal)
  - [Admin](#admin)
- [Environment Variables](#environment-variables)
- [Default Accounts](#default-accounts)
- [Example Workflow](#example-workflow)

---

## Requirements

- Python 3.10 or higher
- pip

No external database server, message broker, or third-party API credentials are required. Everything runs on-device using SQLite.

---

## Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd traveloop

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

---

## Running the Server

```bash
# Step 1: Seed the database with cities, activities, and default accounts
python seed.py

# Step 2: Start the development server
uvicorn app.main:app --reload
```

The server starts at `http://localhost:8000`.

Interactive API documentation is available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

To run on a specific host or port:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload
```

---

## Project Structure

```
traveloop/
├── app/
│   ├── main.py                  # Application entry point, CORS, router registration
│   ├── auth.py                  # JWT token creation and validation, password hashing
│   ├── database/
│   │   └── db.py                # SQLite engine, session factory, get_db dependency
│   ├── models/
│   │   └── models.py            # SQLAlchemy ORM models for all tables
│   ├── schemas/
│   │   └── schemas.py           # Pydantic schemas for request validation and responses
│   └── routers/
│       ├── auth.py              # Signup and login endpoints
│       ├── users.py             # User profile management
│       ├── trips.py             # Trip CRUD, sharing, and copying
│       ├── stops.py             # Itinerary stops and stop-level activities
│       ├── cities.py            # City search and management
│       ├── activities.py        # Activity search and management
│       ├── budget.py            # Trip cost breakdown
│       ├── checklist.py         # Packing checklist per trip
│       ├── notes.py             # Trip notes and journal entries
│       └── admin.py             # Admin-only analytics and user management
├── seed.py                      # Populates the database with sample data
├── requirements.txt
├── .env.example
├── .gitignore
└── README.md
```

---

## Database

The application uses SQLite, stored as a single file (`traveloop.db`) in the project root directory. The file is created automatically when the application starts for the first time. No configuration is needed.

### Schema Overview

| Table             | Description                                      |
|-------------------|--------------------------------------------------|
| `users`           | Registered user accounts                         |
| `cities`          | City catalog with cost index and coordinates     |
| `activities`      | Activities available in each city                |
| `trips`           | User-created trips with dates and budget         |
| `stops`           | Individual city stops within a trip              |
| `stop_activities` | Activities assigned to a specific stop           |
| `checklist_items` | Packing checklist items linked to a trip         |
| `notes`           | Text notes linked to a trip or a specific stop   |

### Switching to PostgreSQL

To use PostgreSQL instead of SQLite, update `DATABASE_URL` in your `.env` file:

```
DATABASE_URL=postgresql://user:password@localhost/traveloop
```

No code changes are required.

---

## Authentication

All protected endpoints require a Bearer token passed in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

Tokens are obtained from the login endpoint and are valid for 7 days. Admin-only endpoints additionally require the authenticated user to have `is_admin: true`.

---

## API Reference

### Auth

| Method | Endpoint           | Description                        | Protected |
|--------|--------------------|------------------------------------|-----------|
| POST   | `/api/auth/signup` | Register a new user account        | No        |
| POST   | `/api/auth/login`  | Authenticate and receive JWT token | No        |

**POST /api/auth/signup — Request body**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securepassword"
}
```

**POST /api/auth/login — Request body**
```json
{
  "email": "jane@example.com",
  "password": "securepassword"
}
```

**Response (both endpoints)**
```json
{
  "access_token": "<jwt>",
  "token_type": "bearer",
  "user_id": 1,
  "name": "Jane Doe",
  "email": "jane@example.com",
  "is_admin": false
}
```

---

### Users

| Method | Endpoint                  | Description                          | Protected |
|--------|---------------------------|--------------------------------------|-----------|
| GET    | `/api/users/me`           | Retrieve the authenticated user      | Yes       |
| PUT    | `/api/users/me`           | Update name, photo URL, or language  | Yes       |
| PUT    | `/api/users/me/password`  | Change password                      | Yes       |
| DELETE | `/api/users/me`           | Deactivate the account               | Yes       |

**PUT /api/users/me — Request body (all fields optional)**
```json
{
  "name": "Jane Smith",
  "photo_url": "https://example.com/photo.jpg",
  "language": "en"
}
```

**PUT /api/users/me/password — Query parameters**
```
?old_password=current&new_password=newpass
```

---

### Trips

| Method | Endpoint                        | Description                                  | Protected |
|--------|---------------------------------|----------------------------------------------|-----------|
| POST   | `/api/trips/`                   | Create a new trip                            | Yes       |
| GET    | `/api/trips/`                   | List all trips owned by the current user     | Yes       |
| GET    | `/api/trips/public`             | List all publicly shared trips               | No        |
| GET    | `/api/trips/public/{slug}`      | View a specific public trip by share slug    | No        |
| GET    | `/api/trips/{id}`               | Get full trip details including stops        | Yes       |
| PUT    | `/api/trips/{id}`               | Update trip metadata                         | Yes       |
| DELETE | `/api/trips/{id}`               | Delete a trip and all its stops              | Yes       |
| POST   | `/api/trips/{id}/share`         | Make a trip public and get a shareable URL   | Yes       |
| POST   | `/api/trips/{id}/unshare`       | Make a trip private                          | Yes       |
| POST   | `/api/trips/{id}/copy`          | Copy a public trip into your own account     | Yes       |

**POST /api/trips/ — Request body**
```json
{
  "name": "Summer in Europe",
  "description": "A three-week tour across Western Europe.",
  "start_date": "2025-06-01T00:00:00",
  "end_date": "2025-06-21T00:00:00",
  "total_budget": 3500.00
}
```

**PUT /api/trips/{id} — All fields optional**
```json
{
  "name": "Updated Trip Name",
  "is_public": true,
  "total_budget": 4000.00
}
```

**POST /api/trips/{id}/share — Response**
```json
{
  "public_slug": "a1b2c3d4",
  "share_url": "/api/trips/public/a1b2c3d4"
}
```

---

### Stops and Itinerary Builder

| Method | Endpoint                                    | Description                                         | Protected |
|--------|---------------------------------------------|-----------------------------------------------------|-----------|
| POST   | `/api/stops/trips/{trip_id}/stops`          | Add a city stop to a trip                           | Yes       |
| GET    | `/api/stops/trips/{trip_id}/stops`          | List all stops in a trip, ordered by index          | Yes       |
| PUT    | `/api/stops/stops/{stop_id}`                | Update stop dates or costs                          | Yes       |
| DELETE | `/api/stops/stops/{stop_id}`                | Remove a stop from a trip                           | Yes       |
| PUT    | `/api/stops/trips/{trip_id}/stops/reorder`  | Reorder stops by submitting an ordered list of IDs  | Yes       |
| POST   | `/api/stops/stops/{stop_id}/activities`     | Add an activity to a stop                           | Yes       |
| PUT    | `/api/stops/stop-activities/{id}`           | Update a stop activity (time, cost, completion)     | Yes       |
| DELETE | `/api/stops/stop-activities/{id}`           | Remove an activity from a stop                      | Yes       |

**POST /api/stops/trips/{trip_id}/stops — Request body**
```json
{
  "city_id": 1,
  "order_index": 0,
  "arrival_date": "2025-06-01T00:00:00",
  "departure_date": "2025-06-05T00:00:00",
  "accommodation_cost": 400.00,
  "transport_cost": 150.00,
  "meal_cost": 200.00,
  "notes": "Check in at Hotel Lumiere at 14:00."
}
```

**PUT /api/stops/trips/{trip_id}/stops/reorder — Request body**
```json
[3, 1, 2]
```

Pass an array of stop IDs in the desired display order.

**POST /api/stops/stops/{stop_id}/activities — Request body**
```json
{
  "activity_id": 5,
  "scheduled_time": "10:00",
  "custom_cost": 22.50
}
```

---

### Cities

| Method | Endpoint               | Description                             | Protected   |
|--------|------------------------|-----------------------------------------|-------------|
| GET    | `/api/cities/`         | Search cities by name, country, region  | Yes         |
| GET    | `/api/cities/popular`  | Get top cities by popularity score      | No          |
| GET    | `/api/cities/{id}`     | Get a single city                       | Yes         |
| POST   | `/api/cities/`         | Create a city                           | Yes (admin) |
| PUT    | `/api/cities/{id}`     | Update a city                           | Yes (admin) |
| DELETE | `/api/cities/{id}`     | Delete a city                           | Yes (admin) |

**GET /api/cities/ — Query parameters**

| Parameter | Type   | Description                      |
|-----------|--------|----------------------------------|
| `q`       | string | Search by city name or country   |
| `country` | string | Filter by country                |
| `region`  | string | Filter by region                 |
| `skip`    | int    | Pagination offset (default: 0)   |
| `limit`   | int    | Results per page (default: 50)   |

---

### Activities

| Method | Endpoint                    | Description                                  | Protected   |
|--------|-----------------------------|----------------------------------------------|-------------|
| GET    | `/api/activities/`          | Search activities with multiple filters      | Yes         |
| GET    | `/api/activities/popular`   | Get popular activities, optionally by city   | No          |
| GET    | `/api/activities/{id}`      | Get a single activity                        | Yes         |
| POST   | `/api/activities/`          | Create an activity                           | Yes (admin) |
| PUT    | `/api/activities/{id}`      | Update an activity                           | Yes (admin) |
| DELETE | `/api/activities/{id}`      | Delete an activity                           | Yes (admin) |

**GET /api/activities/ — Query parameters**

| Parameter       | Type   | Description                                         |
|-----------------|--------|-----------------------------------------------------|
| `q`             | string | Search by activity name                             |
| `city_id`       | int    | Filter by city                                      |
| `activity_type` | string | Filter by type (sightseeing, food, adventure, etc.) |
| `max_cost`      | float  | Maximum estimated cost                              |
| `max_duration`  | float  | Maximum duration in hours                           |
| `skip`          | int    | Pagination offset                                   |
| `limit`         | int    | Results per page (default: 50)                      |

---

### Budget and Cost Breakdown

| Method | Endpoint                   | Description                                             | Protected |
|--------|----------------------------|---------------------------------------------------------|-----------|
| GET    | `/api/budget/trips/{id}`   | Full cost breakdown for a trip, by category and by stop | Yes       |

**Response structure**
```json
{
  "total_budget": 3500.00,
  "total_estimated": 2840.00,
  "remaining": 660.00,
  "transport_total": 450.00,
  "accommodation_total": 1200.00,
  "meals_total": 600.00,
  "activities_total": 590.00,
  "per_stop": [
    {
      "stop_id": 1,
      "city": "Paris",
      "transport": 150.00,
      "accommodation": 400.00,
      "meals": 200.00,
      "activities": 113.00,
      "total": 863.00
    }
  ]
}
```

---

### Packing Checklist

| Method | Endpoint                          | Description                        | Protected |
|--------|-----------------------------------|------------------------------------|-----------|
| GET    | `/api/checklist/trips/{id}`       | Get all checklist items for a trip | Yes       |
| POST   | `/api/checklist/trips/{id}`       | Add an item to the checklist       | Yes       |
| PUT    | `/api/checklist/{item_id}`        | Update item (mark packed, rename)  | Yes       |
| DELETE | `/api/checklist/{item_id}`        | Remove an item                     | Yes       |
| POST   | `/api/checklist/trips/{id}/reset` | Mark all items as unpacked         | Yes       |

**POST /api/checklist/trips/{id} — Request body**
```json
{
  "item_name": "Travel adapter",
  "category": "electronics"
}
```

Valid categories: `clothing`, `documents`, `electronics`, `toiletries`, `other`.

**PUT /api/checklist/{item_id} — Request body (all fields optional)**
```json
{
  "item_name": "Universal adapter",
  "is_packed": true
}
```

---

### Notes and Journal

| Method | Endpoint                  | Description                          | Protected |
|--------|---------------------------|--------------------------------------|-----------|
| GET    | `/api/notes/trips/{id}`   | List all notes for a trip            | Yes       |
| POST   | `/api/notes/trips/{id}`   | Create a note                        | Yes       |
| PUT    | `/api/notes/{note_id}`    | Edit a note                          | Yes       |
| DELETE | `/api/notes/{note_id}`    | Delete a note                        | Yes       |

**POST /api/notes/trips/{id} — Request body**
```json
{
  "title": "Hotel check-in details",
  "content": "Check-in is at 14:00. Confirmation code: XYZ123.",
  "stop_id": 3
}
```

The `stop_id` field is optional. Omit it to create a general trip note not tied to a specific city stop.

---

### Admin

All endpoints in this section require the authenticated user to have admin privileges.

| Method | Endpoint                               | Description                        |
|--------|----------------------------------------|------------------------------------|
| GET    | `/api/admin/stats`                     | Platform-wide analytics            |
| GET    | `/api/admin/users`                     | List all registered users          |
| PUT    | `/api/admin/users/{id}/toggle-active`  | Activate or deactivate a user      |
| PUT    | `/api/admin/users/{id}/toggle-admin`   | Grant or revoke admin privileges   |

**GET /api/admin/stats — Response structure**
```json
{
  "total_users": 42,
  "total_trips": 130,
  "total_cities": 15,
  "total_activities": 29,
  "public_trips": 18,
  "top_cities": [
    {"city": "Paris", "stop_count": 34}
  ],
  "recent_trips": [
    {"id": 5, "name": "Japan Trip", "owner_id": 2, "created_at": "2025-05-10"}
  ]
}
```

---

## Environment Variables

Copy `.env.example` to `.env` before deploying to production:

```bash
cp .env.example .env
```

| Variable       | Default                    | Description                                                              |
|----------------|----------------------------|--------------------------------------------------------------------------|
| `DATABASE_URL` | `sqlite:///./traveloop.db` | Database connection string. Supports SQLite and PostgreSQL.              |
| `SECRET_KEY`   | (development default)      | Secret used to sign JWT tokens. Must be changed in production.           |

---

## Default Accounts

After running `python seed.py`, the following accounts are available:

| Role          | Email                   | Password |
|---------------|-------------------------|----------|
| Administrator | admin@traveloop.com     | admin123 |
| Demo User     | demo@traveloop.com      | demo123  |

The seed script also inserts 15 cities (Paris, Tokyo, New York, Rome, Barcelona, Bangkok, Amsterdam, Dubai, Sydney, Bali, London, Istanbul, Prague, Lisbon, Singapore) and 29 curated activities across those cities.

---

## Example Workflow

The following demonstrates a complete trip creation flow using the API from the command line:

```bash
BASE=http://localhost:8000

# Authenticate
TOKEN=$(curl -s -X POST $BASE/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@traveloop.com","password":"demo123"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")

AUTH="Authorization: Bearer $TOKEN"

# Create a trip
TRIP=$(curl -s -X POST $BASE/api/trips/ -H "$AUTH" \
  -H "Content-Type: application/json" \
  -d '{"name":"Euro Summer 2025","start_date":"2025-06-01T00:00:00","end_date":"2025-06-21T00:00:00","total_budget":3500}')

TRIP_ID=$(echo $TRIP | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")

# Add a stop in Paris (city_id 1 after seeding)
STOP=$(curl -s -X POST $BASE/api/stops/trips/$TRIP_ID/stops -H "$AUTH" \
  -H "Content-Type: application/json" \
  -d '{"city_id":1,"arrival_date":"2025-06-01T00:00:00","departure_date":"2025-06-05T00:00:00","accommodation_cost":400,"transport_cost":150,"meal_cost":200}')

STOP_ID=$(echo $STOP | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")

# Add an activity to the stop (activity_id 1 = Eiffel Tower after seeding)
curl -s -X POST $BASE/api/stops/stops/$STOP_ID/activities -H "$AUTH" \
  -H "Content-Type: application/json" \
  -d '{"activity_id":1,"scheduled_time":"10:00"}'

# Add a packing item
curl -s -X POST $BASE/api/checklist/trips/$TRIP_ID -H "$AUTH" \
  -H "Content-Type: application/json" \
  -d '{"item_name":"Passport","category":"documents"}'

# Get the budget breakdown
curl -s $BASE/api/budget/trips/$TRIP_ID -H "$AUTH"

# Share the trip publicly
curl -s -X POST $BASE/api/trips/$TRIP_ID/share -H "$AUTH"
```
