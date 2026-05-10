from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.db import engine, Base
from app.routers import auth, users, trips, stops, activities, cities, budget, checklist, notes, admin

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Traveloop API",
    description="Personalized Travel Planning Made Easy",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(trips.router, prefix="/api/trips", tags=["Trips"])
app.include_router(stops.router, prefix="/api/stops", tags=["Stops"])
app.include_router(activities.router, prefix="/api/activities", tags=["Activities"])
app.include_router(cities.router, prefix="/api/cities", tags=["Cities"])
app.include_router(budget.router, prefix="/api/budget", tags=["Budget"])
app.include_router(checklist.router, prefix="/api/checklist", tags=["Checklist"])
app.include_router(notes.router, prefix="/api/notes", tags=["Notes"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])


@app.get("/", tags=["Health"])
def root():
    return {"message": "Welcome to Traveloop API", "docs": "/docs"}


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}
