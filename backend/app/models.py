from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from enum import Enum

# Enums
class VisibilityEnum(str, Enum):
    private = "private"
    shared = "shared" 
    public = "public"

class NodeTypeEnum(str, Enum):
    destination = "destination"
    activity = "activity"
    restaurant = "restaurant"
    hotel = "hotel"
    transport = "transport"
    note = "note"
    dayDivider = "dayDivider"
    nestedCanvas = "nestedCanvas"

class SubscriptionTierEnum(str, Enum):
    free = "free"
    premium = "premium"
    pro = "pro"

# Base Models
class TimestampMixin(BaseModel):
    created_at: datetime
    updated_at: datetime

# User Profile Models
class UserProfileBase(BaseModel):
    username: Optional[str] = None
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    travel_style: List[str] = []
    preferences: Dict[str, Any] = {}
    onboarding_completed: bool = False
    subscription_tier: SubscriptionTierEnum = SubscriptionTierEnum.free

class UserProfileCreate(UserProfileBase):
    pass

class UserProfileUpdate(BaseModel):
    username: Optional[str] = None
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    travel_style: Optional[List[str]] = None
    preferences: Optional[Dict[str, Any]] = None
    onboarding_completed: Optional[bool] = None

class UserProfile(UserProfileBase, TimestampMixin):
    id: str
    subscription_expires_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Trip Models
class TripBase(BaseModel):
    title: str
    description: Optional[str] = None
    destination: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    budget: Optional[float] = None
    currency: str = "EUR"
    visibility: VisibilityEnum = VisibilityEnum.private
    cover_image: Optional[str] = None
    settings: Dict[str, Any] = {}
    metadata: Dict[str, Any] = {}

class TripCreate(TripBase):
    pass

class TripUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    destination: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    budget: Optional[float] = None
    currency: Optional[str] = None
    visibility: Optional[VisibilityEnum] = None
    cover_image: Optional[str] = None
    settings: Optional[Dict[str, Any]] = None
    metadata: Optional[Dict[str, Any]] = None

class Trip(TripBase, TimestampMixin):
    id: str
    user_id: str

    class Config:
        from_attributes = True

# Card Models  
class CardBase(BaseModel):
    type: NodeTypeEnum
    title: str
    content: Dict[str, Any] = {}
    position: Dict[str, float] = {"x": 0, "y": 0}
    style: Dict[str, Any] = {}

class CardCreate(CardBase):
    trip_id: str
    id: Optional[str] = None  # Allow custom ID from frontend

class CardUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[Dict[str, Any]] = None
    position: Optional[Dict[str, float]] = None
    style: Optional[Dict[str, Any]] = None

class Card(CardBase, TimestampMixin):
    id: str
    trip_id: str

    class Config:
        from_attributes = True

# Connection Models
class ConnectionBase(BaseModel):
    type: str = "default"
    metadata: Dict[str, Any] = {}

class ConnectionCreate(ConnectionBase):
    trip_id: str
    from_card_id: str
    to_card_id: str
    id: Optional[str] = None  # Allow custom ID from frontend

class ConnectionUpdate(BaseModel):
    type: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class Connection(ConnectionBase):
    id: str
    trip_id: str
    from_card_id: str
    to_card_id: str
    created_at: datetime

    class Config:
        from_attributes = True

# Authentication Models
class UserLogin(BaseModel):
    email: str
    password: str

class UserRegister(BaseModel):
    email: str
    password: str
    full_name: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    refresh_token: Optional[str] = None

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    exp: Optional[int] = None

# Response Models
class ResponseModel(BaseModel):
    success: bool = True
    message: str = "Success"
    data: Optional[Any] = None

class ErrorResponse(BaseModel):
    success: bool = False
    message: str
    error: Optional[str] = None