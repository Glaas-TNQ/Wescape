from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class CanvasContext(BaseModel):
    """Canvas context data for chat requests"""
    trip_id: Optional[str] = None
    viewport: Dict[str, float]  # {x, y, zoom}
    existing_nodes: List[Dict[str, Any]]
    selected_nodes: List[str]
    last_modified: Optional[str] = None

class ChatRequest(BaseModel):
    """Chat message request from frontend"""
    message: str
    trip_id: Optional[str] = None
    canvas_context: CanvasContext

class ChatResponse(BaseModel):
    """Chat response to frontend"""
    conversation_id: str
    status: str  # "processing" | "completed" | "error"
    message: Optional[str] = None
    nodes_created: Optional[List[str]] = None

class N8NWebhookPayload(BaseModel):
    """Payload sent to n8n webhook"""
    conversation_id: str
    user_message: str
    canvas_context: Dict[str, Any]
    callback_url: str
    user_id: str

class N8NCallbackPayload(BaseModel):
    """Callback payload from n8n workflow"""
    conversation_id: str
    status: str  # "completed" | "error"
    message: str
    nodes_created: Optional[List[Dict[str, Any]]] = None
    error: Optional[str] = None