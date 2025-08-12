from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import logging
from typing import Optional

from app.models.chat import ChatRequest, ChatResponse, N8NCallbackPayload
from app.services.chat_service import ChatService
from app.core.supabase import get_supabase_client
from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

# Rate limiting
limiter = Limiter(key_func=get_remote_address)
router = APIRouter()
security = HTTPBearer()

# Mock auth for now - replace with real auth
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Mock user authentication - replace with real implementation"""
    # For now, return a mock user
    return {
        "id": "mock-user-id",
        "email": "test@example.com"
    }

@router.post("/send", response_model=ChatResponse)
@limiter.limit(f"{settings.CHAT_RATE_LIMIT_PER_MINUTE}/minute")
async def send_chat_message(
    request: Request,
    chat_request: ChatRequest,
    background_tasks: BackgroundTasks,
    current_user = Depends(get_current_user),
    supabase_client = Depends(get_supabase_client)
):
    """
    Send chat message to AI and trigger processing workflow
    """
    try:
        chat_service = ChatService(supabase_client)
        
        # Validate trip access if trip_id is provided
        if chat_request.trip_id:
            has_access = await chat_service.validate_trip_access(
                chat_request.trip_id, 
                current_user["id"]
            )
            if not has_access:
                raise HTTPException(
                    status_code=403, 
                    detail="You don't have access to this trip"
                )
        
        # Log conversation
        conversation_id = await chat_service.log_conversation(
            user_id=current_user["id"],
            trip_id=chat_request.trip_id,
            message=chat_request.message,
            context=chat_request.canvas_context
        )
        
        # Trigger AI workflow in background
        background_tasks.add_task(
            chat_service.trigger_ai_workflow,
            conversation_id=conversation_id,
            user_id=current_user["id"],
            message=chat_request.message,
            context=chat_request.canvas_context
        )
        
        return ChatResponse(
            conversation_id=conversation_id,
            status="processing",
            message="Mona sta elaborando la tua richiesta..."
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in send_chat_message: {e}")
        raise HTTPException(
            status_code=500, 
            detail="Errore nell'elaborazione del messaggio"
        )

@router.post("/callback")
async def handle_ai_callback(
    callback_data: N8NCallbackPayload,
    supabase_client = Depends(get_supabase_client)
):
    """
    Handle callback from n8n AI workflow
    """
    try:
        chat_service = ChatService(supabase_client)
        
        # Update conversation status
        success = await chat_service.update_conversation_status(
            conversation_id=callback_data.conversation_id,
            status=callback_data.status,
            error=callback_data.error,
            ai_response=callback_data.message,
            nodes_created=[node.get("id") for node in (callback_data.nodes_created or [])]
        )
        
        if not success:
            logger.error(f"Failed to update conversation {callback_data.conversation_id}")
            return {"status": "error", "message": "Failed to update conversation"}
        
        # Create canvas nodes if provided
        if callback_data.nodes_created and callback_data.status == "completed":
            # Get conversation to find trip_id and user_id
            conversation = await chat_service.get_conversation(callback_data.conversation_id)
            if conversation and conversation.get("trip_id"):
                created_node_ids = await chat_service.create_canvas_nodes(
                    trip_id=conversation["trip_id"],
                    nodes_data=callback_data.nodes_created,
                    user_id=conversation["user_id"]
                )
                
                logger.info(f"Created {len(created_node_ids)} nodes for conversation {callback_data.conversation_id}")
        
        # Here you would typically trigger a real-time update to the frontend
        # via Supabase real-time or WebSocket
        
        return {
            "status": "success",
            "conversation_id": callback_data.conversation_id
        }
        
    except Exception as e:
        logger.error(f"Error in handle_ai_callback: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error processing AI callback"
        )

@router.get("/conversation/{conversation_id}")
async def get_conversation(
    conversation_id: str,
    current_user = Depends(get_current_user),
    supabase_client = Depends(get_supabase_client)
):
    """
    Get conversation details
    """
    try:
        chat_service = ChatService(supabase_client)
        conversation = await chat_service.get_conversation(conversation_id)
        
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        # Check if user owns this conversation
        if conversation["user_id"] != current_user["id"]:
            raise HTTPException(status_code=403, detail="Access denied")
        
        return conversation
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting conversation: {e}")
        raise HTTPException(status_code=500, detail="Error retrieving conversation")