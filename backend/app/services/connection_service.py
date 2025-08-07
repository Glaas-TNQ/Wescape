from typing import List
from supabase import Client
from fastapi import HTTPException, status

from app.models import Connection, ConnectionCreate, ConnectionUpdate

class ConnectionService:
    def __init__(self, supabase: Client, user_id: str):
        self.supabase = supabase
        self.user_id = user_id

    async def _verify_trip_ownership(self, trip_id: str) -> bool:
        """Verify that the trip belongs to the current user"""
        try:
            response = (
                self.supabase.table("trips")
                .select("id")
                .eq("id", trip_id)
                .eq("user_id", self.user_id)
                .single()
                .execute()
            )
            return response.data is not None
        except:
            return False

    async def create_connection(self, connection_data: ConnectionCreate) -> Connection:
        """Create a new connection"""
        try:
            # Verify trip ownership
            if not await self._verify_trip_ownership(connection_data.trip_id):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied: Trip not found or not owned by user"
                )
            
            # Convert Pydantic model to dict
            connection_dict = connection_data.model_dump()
            
            # Create connection in Supabase (trigger will validate card ownership)
            response = self.supabase.table("connections").insert(connection_dict).execute()
            
            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Failed to create connection"
                )
            
            return Connection(**response.data[0])
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to create connection: {str(e)}"
            )

    async def get_trip_connections(self, trip_id: str) -> List[Connection]:
        """Get all connections for a specific trip"""
        try:
            # Verify trip ownership
            if not await self._verify_trip_ownership(trip_id):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied: Trip not found or not owned by user"
                )
            
            response = (
                self.supabase.table("connections")
                .select("*")
                .eq("trip_id", trip_id)
                .order("created_at")
                .execute()
            )
            
            return [Connection(**conn) for conn in response.data]
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to fetch connections: {str(e)}"
            )

    async def get_connection_by_id(self, connection_id: str) -> Connection:
        """Get a specific connection by ID"""
        try:
            # Get connection with trip info to verify ownership
            response = (
                self.supabase.table("connections")
                .select("*, trips!inner(user_id)")
                .eq("id", connection_id)
                .eq("trips.user_id", self.user_id)
                .single()
                .execute()
            )
            
            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Connection not found"
                )
            
            # Clean the data (remove the trips join data)
            conn_data = {k: v for k, v in response.data.items() if k != 'trips'}
            return Connection(**conn_data)
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to fetch connection: {str(e)}"
            )

    async def update_connection(self, connection_id: str, connection_data: ConnectionUpdate) -> Connection:
        """Update a connection"""
        try:
            # Only update fields that were provided
            update_dict = {k: v for k, v in connection_data.model_dump(exclude_unset=True).items() if v is not None}
            
            if not update_dict:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No valid fields to update"
                )
            
            # Update with ownership verification via RLS
            response = (
                self.supabase.table("connections")
                .update(update_dict)
                .eq("id", connection_id)
                .execute()
            )
            
            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Connection not found or access denied"
                )
            
            return Connection(**response.data[0])
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to update connection: {str(e)}"
            )

    async def delete_connection(self, connection_id: str) -> bool:
        """Delete a connection"""
        try:
            # Delete with ownership verification via RLS
            response = (
                self.supabase.table("connections")
                .delete()
                .eq("id", connection_id)
                .execute()
            )
            
            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Connection not found or access denied"
                )
            
            return True
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to delete connection: {str(e)}"
            )