from typing import List, Optional
from supabase import Client
from fastapi import HTTPException, status

from app.models import Card, CardCreate, CardUpdate

class CardService:
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

    async def create_card(self, card_data: CardCreate) -> Card:
        """Create a new card"""
        try:
            # Verify trip ownership
            if not await self._verify_trip_ownership(card_data.trip_id):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied: Trip not found or not owned by user"
                )
            
            # Convert Pydantic model to dict
            card_dict = card_data.model_dump()
            
            # Create card in Supabase
            response = self.supabase.table("cards").insert(card_dict).execute()
            
            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Failed to create card"
                )
            
            return Card(**response.data[0])
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to create card: {str(e)}"
            )

    async def get_trip_cards(self, trip_id: str) -> List[Card]:
        """Get all cards for a specific trip"""
        try:
            # Verify trip ownership
            if not await self._verify_trip_ownership(trip_id):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied: Trip not found or not owned by user"
                )
            
            response = (
                self.supabase.table("cards")
                .select("*")
                .eq("trip_id", trip_id)
                .order("created_at")
                .execute()
            )
            
            return [Card(**card) for card in response.data]
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to fetch cards: {str(e)}"
            )

    async def get_card_by_id(self, card_id: str) -> Card:
        """Get a specific card by ID"""
        try:
            # Get card with trip info to verify ownership
            response = (
                self.supabase.table("cards")
                .select("*, trips!inner(user_id)")
                .eq("id", card_id)
                .eq("trips.user_id", self.user_id)
                .single()
                .execute()
            )
            
            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Card not found"
                )
            
            # Clean the data (remove the trips join data)
            card_data = {k: v for k, v in response.data.items() if k != 'trips'}
            return Card(**card_data)
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to fetch card: {str(e)}"
            )

    async def update_card(self, card_id: str, card_data: CardUpdate) -> Card:
        """Update a card"""
        try:
            # Only update fields that were provided
            update_dict = {k: v for k, v in card_data.model_dump(exclude_unset=True).items() if v is not None}
            
            if not update_dict:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No valid fields to update"
                )
            
            # Update with ownership verification via RLS
            response = (
                self.supabase.table("cards")
                .update(update_dict)
                .eq("id", card_id)
                .execute()
            )
            
            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Card not found or access denied"
                )
            
            return Card(**response.data[0])
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to update card: {str(e)}"
            )

    async def delete_card(self, card_id: str) -> bool:
        """Delete a card"""
        try:
            # Delete with ownership verification via RLS
            response = (
                self.supabase.table("cards")
                .delete()
                .eq("id", card_id)
                .execute()
            )
            
            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Card not found or access denied"
                )
            
            return True
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to delete card: {str(e)}"
            )

    async def bulk_update_cards(self, updates: List[dict]) -> List[Card]:
        """Bulk update multiple cards (for position updates)"""
        try:
            updated_cards = []
            
            for update in updates:
                card_id = update.get("id")
                card_data = CardUpdate(**{k: v for k, v in update.items() if k != "id"})
                
                updated_card = await self.update_card(card_id, card_data)
                updated_cards.append(updated_card)
            
            return updated_cards
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to bulk update cards: {str(e)}"
            )