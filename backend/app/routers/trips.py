from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from supabase import Client

from app.database import get_supabase, get_supabase_admin
from app.auth import get_current_user
from app.services.trip_service import TripService
from app.models import Trip, TripCreate, TripUpdate, ResponseModel

router = APIRouter(prefix="/trips", tags=["Trips"])

@router.post("/", response_model=ResponseModel)
async def create_trip(
    trip_data: TripCreate,
    current_user: str = Depends(get_current_user),
    supabase_admin: Client = Depends(get_supabase_admin)
):
    """Create a new trip"""
    service = TripService(supabase_admin, current_user)
    trip = await service.create_trip(trip_data)
    
    return ResponseModel(
        success=True,
        message="Trip created successfully",
        data=trip
    )

@router.get("/", response_model=ResponseModel)
async def get_user_trips(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: str = Depends(get_current_user),
    supabase_admin: Client = Depends(get_supabase_admin)
):
    """Get all trips for the current user"""
    service = TripService(supabase_admin, current_user)
    trips = await service.get_user_trips(limit, offset)
    
    return ResponseModel(
        success=True,
        message="Trips retrieved successfully",
        data=trips
    )

@router.get("/{trip_id}", response_model=ResponseModel)
async def get_trip(
    trip_id: str,
    current_user: str = Depends(get_current_user),
    supabase_admin: Client = Depends(get_supabase_admin)
):
    """Get a specific trip"""
    service = TripService(supabase_admin, current_user)
    trip = await service.get_trip_by_id(trip_id)
    
    return ResponseModel(
        success=True,
        message="Trip retrieved successfully",
        data=trip
    )

@router.get("/{trip_id}/full", response_model=ResponseModel)
async def get_trip_full_data(
    trip_id: str,
    current_user: str = Depends(get_current_user),
    supabase_admin: Client = Depends(get_supabase_admin)
):
    """Get trip with all cards and connections"""
    service = TripService(supabase_admin, current_user)
    data = await service.get_trip_full_data(trip_id)
    
    return ResponseModel(
        success=True,
        message="Trip data retrieved successfully",
        data=data
    )

@router.put("/{trip_id}", response_model=ResponseModel)
async def update_trip(
    trip_id: str,
    trip_data: TripUpdate,
    current_user: str = Depends(get_current_user),
    supabase_admin: Client = Depends(get_supabase_admin)
):
    """Update a trip"""
    service = TripService(supabase_admin, current_user)
    trip = await service.update_trip(trip_id, trip_data)
    
    return ResponseModel(
        success=True,
        message="Trip updated successfully",
        data=trip
    )

@router.delete("/{trip_id}", response_model=ResponseModel)
async def delete_trip(
    trip_id: str,
    current_user: str = Depends(get_current_user),
    supabase_admin: Client = Depends(get_supabase_admin)
):
    """Delete a trip"""
    service = TripService(supabase_admin, current_user)
    await service.delete_trip(trip_id)
    
    return ResponseModel(
        success=True,
        message="Trip deleted successfully"
    )

@router.post("/{trip_id}/duplicate", response_model=ResponseModel)
async def duplicate_trip(
    trip_id: str,
    new_title: str = None,
    current_user: str = Depends(get_current_user),
    supabase_admin: Client = Depends(get_supabase_admin)
):
    """Duplicate a trip"""
    service = TripService(supabase_admin, current_user)
    trip = await service.duplicate_trip(trip_id, new_title)
    
    return ResponseModel(
        success=True,
        message="Trip duplicated successfully",
        data=trip
    )