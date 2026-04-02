from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, users, tickets, admin, health
from .database import engine, Base
from . import models

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Ticket Management System")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:3000",
    "https://ticket-system-frontend-wejp.onrender.com"
],  # Adjust for frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(tickets.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")
app.include_router(health.router, prefix="/api/v1")

@app.get("/")
def root():
    return {"message": "Ticket Management API"}