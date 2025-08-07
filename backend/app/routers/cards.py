from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client

from app.database import get_supabase, get_supabase_admin
from app.auth import get_current_user
from app.services.card_service import CardService
from app.models import Card, CardCreate, CardUpdate, ResponseModel

router = APIRouter(prefix="/trips", tags=["Cards"])

@router.post("/{trip_id}/cards", response_model=ResponseModel)
async def create_card(
    trip_id: str,
    card_data: CardCreate,
    current_user: str = Depends(get_current_user),
    supabase_admin: Client = Depends(get_supabase_admin)
):
    """Create a new card in a trip"""
    # Ensure trip_id in URL matches card_data
    card_data.trip_id = trip_id
    
    service = CardService(supabase_admin, current_user)
    card = await service.create_card(card_data)
    
    return ResponseModel(
        success=True,
        message="Card created successfully",
        data=card
    )

@router.get("/{trip_id}/cards", response_model=ResponseModel)
async def get_trip_cards(
    trip_id: str,
    current_user: str = Depends(get_current_user),
    supabase_admin: Client = Depends(get_supabase_admin)
):
    """Get all cards for a trip"""
    service = CardService(supabase_admin, current_user)
    cards = await service.get_trip_cards(trip_id)
    
    return ResponseModel(
        success=True,
        message="Cards retrieved successfully",
        data=cards
    )

@router.get("/cards/{card_id}", response_model=ResponseModel)
async def get_card(
    card_id: str,
    current_user: str = Depends(get_current_user),
    supabase_admin: Client = Depends(get_supabase_admin)
):
    """Get a specific card"""
    service = CardService(supabase_admin, current_user)
    card = await service.get_card_by_id(card_id)
    
    return ResponseModel(
        success=True,
        message="Card retrieved successfully",
        data=card
    )

@router.put("/cards/{card_id}", response_model=ResponseModel)
async def update_card(
    card_id: str,
    card_data: CardUpdate,
    current_user: str = Depends(get_current_user),
    supabase_admin: Client = Depends(get_supabase_admin)
):
    """Update a card"""
    service = CardService(supabase_admin, current_user)
    card = await service.update_card(card_id, card_data)
    
    return ResponseModel(
        success=True,
        message="Card updated successfully",
        data=card
    )

@router.delete("/cards/{card_id}", response_model=ResponseModel)
async def delete_card(
    card_id: str,
    current_user: str = Depends(get_current_user),
    supabase_admin: Client = Depends(get_supabase_admin)
):
    """Delete a card"""
    service = CardService(supabase_admin, current_user)
    await service.delete_card(card_id)
    
    return ResponseModel(
        success=True,
        message="Card deleted successfully"
    )

@router.put("/cards/bulk-update", response_model=ResponseModel)
async def bulk_update_cards(
    updates: List[dict],
    current_user: str = Depends(get_current_user),
    supabase_admin: Client = Depends(get_supabase_admin)
):
    """Bulk update multiple cards (useful for position updates)"""
    service = CardService(supabase_admin, current_user)
    cards = await service.bulk_update_cards(updates)
    
    return ResponseModel(
        success=True,
        message="Cards updated successfully",
        data=cards
    )