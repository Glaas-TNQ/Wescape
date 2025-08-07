from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client

from app.database import get_supabase, get_supabase_admin
from app.auth import get_current_user
from app.services.connection_service import ConnectionService
from app.models import Connection, ConnectionCreate, ConnectionUpdate, ResponseModel

router = APIRouter(prefix="/trips", tags=["Connections"])

@router.post("/{trip_id}/connections", response_model=ResponseModel)
async def create_connection(
    trip_id: str,
    connection_data: ConnectionCreate,
    current_user: str = Depends(get_current_user),
    supabase_admin: Client = Depends(get_supabase_admin)
):
    """Create a new connection in a trip"""
    # Ensure trip_id in URL matches connection_data
    connection_data.trip_id = trip_id
    
    service = ConnectionService(supabase_admin, current_user)
    connection = await service.create_connection(connection_data)
    
    return ResponseModel(
        success=True,
        message="Connection created successfully",
        data=connection
    )

@router.get("/{trip_id}/connections", response_model=ResponseModel)
async def get_trip_connections(
    trip_id: str,
    current_user: str = Depends(get_current_user),
    supabase_admin: Client = Depends(get_supabase_admin)
):
    """Get all connections for a trip"""
    service = ConnectionService(supabase_admin, current_user)
    connections = await service.get_trip_connections(trip_id)
    
    return ResponseModel(
        success=True,
        message="Connections retrieved successfully",
        data=connections
    )

@router.get("/connections/{connection_id}", response_model=ResponseModel)
async def get_connection(
    connection_id: str,
    current_user: str = Depends(get_current_user),
    supabase_admin: Client = Depends(get_supabase_admin)
):
    """Get a specific connection"""
    service = ConnectionService(supabase_admin, current_user)
    connection = await service.get_connection_by_id(connection_id)
    
    return ResponseModel(
        success=True,
        message="Connection retrieved successfully",
        data=connection
    )

@router.put("/connections/{connection_id}", response_model=ResponseModel)
async def update_connection(
    connection_id: str,
    connection_data: ConnectionUpdate,
    current_user: str = Depends(get_current_user),
    supabase_admin: Client = Depends(get_supabase_admin)
):
    """Update a connection"""
    service = ConnectionService(supabase_admin, current_user)
    connection = await service.update_connection(connection_id, connection_data)
    
    return ResponseModel(
        success=True,
        message="Connection updated successfully",
        data=connection
    )

@router.delete("/connections/{connection_id}", response_model=ResponseModel)
async def delete_connection(
    connection_id: str,
    current_user: str = Depends(get_current_user),
    supabase_admin: Client = Depends(get_supabase_admin)
):
    """Delete a connection"""
    service = ConnectionService(supabase_admin, current_user)
    await service.delete_connection(connection_id)
    
    return ResponseModel(
        success=True,
        message="Connection deleted successfully"
    )