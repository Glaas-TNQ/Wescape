from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os

from app.config import settings
from app.routers import auth, trips, cards, connections

# Initialize FastAPI app
app = FastAPI(
    title=settings.project_name,
    version="1.0.0",
    description="WeScape Backend API for trip planning and management",
    debug=settings.debug
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.backend_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix=settings.api_v1_str)
app.include_router(trips.router, prefix=settings.api_v1_str)
app.include_router(cards.router, prefix=settings.api_v1_str)
app.include_router(connections.router, prefix=settings.api_v1_str)

# Health check endpoint
@app.get("/")
async def root():
    return {"message": "WeScape Backend API", "version": "1.0.0", "status": "healthy"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "wescape-backend"}

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"success": False, "message": "Internal server error", "error": str(exc) if settings.debug else "Something went wrong"}
    )