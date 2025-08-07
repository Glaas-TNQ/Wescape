from typing import List, Optional
from supabase import Client, create_client
from fastapi import HTTPException, status

from app.models import Trip, TripCreate, TripUpdate, Card, Connection
from app.config import settings

class TripService:
    def __init__(self, supabase: Client, user_id: str):
        self.supabase = supabase
        self.user_id = user_id

    async def create_trip(self, trip_data: TripCreate) -> Trip:
        """Create a new trip"""
        try:
            # Convert Pydantic model to dict and ensure user_id is set
            trip_dict = trip_data.model_dump()
            trip_dict["user_id"] = self.user_id
            
            # Create trip in Supabase using service role (bypasses RLS)
            response = self.supabase.table("trips").insert(trip_dict).execute()
            
            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Failed to create trip"
                )
            
            return Trip(**response.data[0])
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to create trip: {str(e)}"
            )

    async def get_user_trips(self, limit: int = 50, offset: int = 0) -> List[Trip]:
        """Get all trips for the current user"""
        try:
            response = (
                self.supabase.table("trips")
                .select("*")
                .eq("user_id", self.user_id)
                .order("updated_at", desc=True)
                .range(offset, offset + limit - 1)
                .execute()
            )
            
            return [Trip(**trip) for trip in response.data]
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to fetch trips: {str(e)}"
            )

    async def get_trip_by_id(self, trip_id: str) -> Trip:
        """Get a specific trip by ID"""
        try:
            response = (
                self.supabase.table("trips")
                .select("*")
                .eq("id", trip_id)
                .eq("user_id", self.user_id)
                .single()
                .execute()
            )
            
            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Trip not found"
                )
            
            return Trip(**response.data)
            
        except Exception as e:
            if "not found" in str(e).lower():
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Trip not found"
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to fetch trip: {str(e)}"
            )

    async def update_trip(self, trip_id: str, trip_data: TripUpdate) -> Trip:
        """Update a trip"""
        try:
            # Only update fields that were provided
            update_dict = {k: v for k, v in trip_data.model_dump(exclude_unset=True).items() if v is not None}
            
            if not update_dict:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No valid fields to update"
                )
            
            response = (
                self.supabase.table("trips")
                .update(update_dict)
                .eq("id", trip_id)
                .eq("user_id", self.user_id)
                .execute()
            )
            
            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Trip not found"
                )
            
            return Trip(**response.data[0])
            
        except Exception as e:
            if "not found" in str(e).lower():
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Trip not found"
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to update trip: {str(e)}"
            )

    async def delete_trip(self, trip_id: str) -> bool:
        """Delete a trip"""
        try:
            response = (
                self.supabase.table("trips")
                .delete()
                .eq("id", trip_id)
                .eq("user_id", self.user_id)
                .execute()
            )
            
            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Trip not found"
                )
            
            return True
            
        except Exception as e:
            if "not found" in str(e).lower():
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Trip not found"
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to delete trip: {str(e)}"
            )

    async def get_trip_full_data(self, trip_id: str) -> dict:
        """Get trip with all related cards and connections"""
        try:
            # Verify trip ownership
            trip = await self.get_trip_by_id(trip_id)
            
            # Get cards
            cards_response = (
                self.supabase.table("cards")
                .select("*")
                .eq("trip_id", trip_id)
                .order("created_at")
                .execute()
            )
            
            # Get connections  
            connections_response = (
                self.supabase.table("connections")
                .select("*")
                .eq("trip_id", trip_id)
                .order("created_at")
                .execute()
            )
            
            return {
                "trip": trip,
                "cards": [Card(**card) for card in cards_response.data],
                "connections": [Connection(**conn) for conn in connections_response.data]
            }
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to fetch trip data: {str(e)}"
            )

    async def duplicate_trip(self, trip_id: str, new_title: Optional[str] = None) -> Trip:
        """Duplicate a trip with all its cards and connections"""
        try:
            # Get original trip data
            original_data = await self.get_trip_full_data(trip_id)
            original_trip = original_data["trip"]
            
            # Create new trip
            new_trip_data = TripCreate(
                title=new_title or f"{original_trip.title} (Copy)",
                description=original_trip.description,
                destination=original_trip.destination,
                start_date=original_trip.start_date,
                end_date=original_trip.end_date,
                budget=original_trip.budget,
                currency=original_trip.currency,
                visibility=original_trip.visibility,
                settings=original_trip.settings,
                metadata=original_trip.metadata
            )
            
            new_trip = await self.create_trip(new_trip_data)
            
            # TODO: Copy cards and connections in a transaction
            # This would require implementing card and connection services
            
            return new_trip
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to duplicate trip: {str(e)}"
            )