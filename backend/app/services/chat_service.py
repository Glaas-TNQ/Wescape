import httpx
import logging
from typing import Optional, Dict, Any
from datetime import datetime
from uuid import uuid4

from app.models.chat import CanvasContext, N8NWebhookPayload
from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

class ChatService:
    """Service for handling chat AI interactions"""
    
    def __init__(self, supabase_client):
        self.supabase = supabase_client
    
    async def validate_trip_access(self, trip_id: str, user_id: str) -> bool:
        """Validate that user has access to the trip"""
        if not trip_id:
            return True  # No trip context is okay
            
        try:
            response = await self.supabase.table("trips").select("id").eq("id", trip_id).eq("user_id", user_id).single().execute()
            return response.data is not None
        except Exception as e:
            logger.error(f"Error validating trip access: {e}")
            return False
    
    async def log_conversation(
        self, 
        user_id: str, 
        trip_id: Optional[str], 
        message: str, 
        context: CanvasContext
    ) -> str:
        """Log conversation message to database"""
        try:
            conversation_id = str(uuid4())
            
            # Create conversation record
            conversation_data = {
                "id": conversation_id,
                "user_id": user_id,
                "trip_id": trip_id,
                "message": message,
                "context": context.dict(),
                "status": "processing",
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
            
            # Insert into chat_conversations table
            response = await self.supabase.table("chat_conversations").insert(conversation_data).execute()
            
            if response.data:
                return conversation_id
            else:
                raise Exception("Failed to create conversation record")
                
        except Exception as e:
            logger.error(f"Error logging conversation: {e}")
            raise e
    
    async def trigger_ai_workflow(
        self, 
        conversation_id: str, 
        user_id: str,
        message: str, 
        context: CanvasContext
    ) -> bool:
        """Trigger n8n AI workflow via webhook"""
        try:
            webhook_url = settings.N8N_CHAT_WEBHOOK_URL
            if not webhook_url:
                logger.error("N8N_CHAT_WEBHOOK_URL not configured")
                return False
            
            payload = N8NWebhookPayload(
                conversation_id=conversation_id,
                user_message=message,
                canvas_context=context.dict(),
                callback_url=f"{settings.API_BASE_URL}/api/v1/chat/callback",
                user_id=user_id
            )
            
            # Send async webhook request
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    webhook_url,
                    json=payload.dict(),
                    headers={"Content-Type": "application/json"}
                )
                response.raise_for_status()
                
            logger.info(f"Successfully triggered AI workflow for conversation {conversation_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error triggering AI workflow: {e}")
            await self.update_conversation_status(conversation_id, "error", str(e))
            return False
    
    async def update_conversation_status(
        self, 
        conversation_id: str, 
        status: str, 
        error: Optional[str] = None,
        ai_response: Optional[str] = None,
        nodes_created: Optional[list] = None
    ) -> bool:
        """Update conversation status and response"""
        try:
            update_data = {
                "status": status,
                "updated_at": datetime.utcnow().isoformat()
            }
            
            if error:
                update_data["error"] = error
            if ai_response:
                update_data["ai_response"] = ai_response
            if nodes_created:
                update_data["nodes_created"] = nodes_created
            
            response = await self.supabase.table("chat_conversations").update(update_data).eq("id", conversation_id).execute()
            
            return response.data is not None
            
        except Exception as e:
            logger.error(f"Error updating conversation status: {e}")
            return False
    
    async def get_conversation(self, conversation_id: str) -> Optional[Dict[str, Any]]:
        """Get conversation by ID"""
        try:
            response = await self.supabase.table("chat_conversations").select("*").eq("id", conversation_id).single().execute()
            return response.data
        except Exception as e:
            logger.error(f"Error getting conversation: {e}")
            return None
    
    async def create_canvas_nodes(
        self, 
        trip_id: str, 
        nodes_data: List[Dict[str, Any]], 
        user_id: str
    ) -> List[str]:
        """Create nodes in canvas from AI response"""
        try:
            created_node_ids = []
            
            for node_data in nodes_data:
                # Generate unique node ID
                node_id = f"{node_data.get('type', 'node')}_{int(datetime.utcnow().timestamp() * 1000)}_{uuid4().hex[:8]}"
                
                # Prepare node data for database
                db_node_data = {
                    "id": node_id,
                    "trip_id": trip_id,
                    "type": node_data.get("type", "note"),
                    "position_x": node_data.get("position", {}).get("x", 100),
                    "position_y": node_data.get("position", {}).get("y", 100),
                    "width": node_data.get("width", 220),
                    "height": node_data.get("height", 140),
                    "data": node_data.get("data", {}),
                    "style": node_data.get("style", {}),
                    "created_by": user_id,
                    "created_at": datetime.utcnow().isoformat(),
                    "updated_at": datetime.utcnow().isoformat()
                }
                
                # Insert node
                response = await self.supabase.table("cards").insert(db_node_data).execute()
                
                if response.data:
                    created_node_ids.append(node_id)
                else:
                    logger.error(f"Failed to create node: {node_data}")
            
            logger.info(f"Created {len(created_node_ids)} nodes for trip {trip_id}")
            return created_node_ids
            
        except Exception as e:
            logger.error(f"Error creating canvas nodes: {e}")
            return []