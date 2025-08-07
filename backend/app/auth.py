from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
from supabase import Client

from app.config import settings
from app.database import get_supabase
from app.models import TokenPayload, UserLogin, UserRegister, Token

security = HTTPBearer()

class AuthService:
    def __init__(self, supabase: Client):
        self.supabase = supabase

    async def register_user(self, user_data: UserRegister) -> Token:
        """Register a new user with Supabase Auth"""
        try:
            print(f"Attempting to register user: {user_data.email}")  # Debug log
            
            # Register with Supabase Auth
            auth_response = self.supabase.auth.sign_up({
                "email": user_data.email,
                "password": user_data.password,
                "options": {
                    "data": {
                        "full_name": user_data.full_name
                    }
                }
            })
            
            print(f"Supabase auth response: {auth_response}")  # Debug log
            
            if not auth_response.user:
                print("No user in auth response")  # Debug log
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Registration failed"
                )
            
            # Check if email confirmation is required
            if not auth_response.session:
                print("No session - email confirmation required")  # Debug log
                # User created but needs email confirmation
                return Token(
                    access_token="",  # Empty token since user needs to confirm email
                    refresh_token="",
                    expires_in=0,
                    token_type="pending_confirmation"  # Special token type
                )
            
            # Return token info if session exists
            return Token(
                access_token=auth_response.session.access_token,
                refresh_token=auth_response.session.refresh_token,
                expires_in=auth_response.session.expires_in,
                token_type="bearer"
            )
            
        except HTTPException as e:
            # Re-raise HTTP exceptions
            raise e
        except Exception as e:
            error_message = str(e)
            print(f"Exception in register_user: {error_message}")  # Debug log
            
            # Handle specific Supabase errors
            if "you can only request this after" in error_message.lower():
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Too many registration attempts. Please wait before trying again."
                )
            elif "user already registered" in error_message.lower():
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="An account with this email already exists. Please try logging in instead."
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Registration failed: {error_message}"
                )

    async def login_user(self, user_data: UserLogin) -> Token:
        """Login user with Supabase Auth"""
        try:
            # Login with Supabase Auth
            auth_response = self.supabase.auth.sign_in_with_password({
                "email": user_data.email,
                "password": user_data.password
            })
            
            if not auth_response.user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid credentials"
                )
            
            return Token(
                access_token=auth_response.session.access_token,
                refresh_token=auth_response.session.refresh_token,
                expires_in=auth_response.session.expires_in,
                token_type="bearer"
            )
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Login failed: {str(e)}"
            )

    async def refresh_token(self, refresh_token: str) -> Token:
        """Refresh access token using refresh token"""
        try:
            auth_response = self.supabase.auth.refresh_session(refresh_token)
            
            if not auth_response.session:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid refresh token"
                )
            
            return Token(
                access_token=auth_response.session.access_token,
                refresh_token=auth_response.session.refresh_token,
                expires_in=auth_response.session.expires_in,
                token_type="bearer"
            )
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Token refresh failed: {str(e)}"
            )

    def verify_token(self, token: str) -> Optional[str]:
        """Verify JWT token and return user ID"""
        try:
            # Supabase JWT verification
            user_response = self.supabase.auth.get_user(token)
            
            if not user_response.user:
                return None
                
            return user_response.user.id
            
        except Exception:
            return None

# Dependency to get current user from token
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    supabase: Client = Depends(get_supabase)
) -> str:
    """Get current authenticated user ID from JWT token"""
    
    auth_service = AuthService(supabase)
    user_id = auth_service.verify_token(credentials.credentials)
    
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user_id

# Dependency to get current user and token
async def get_current_user_with_token(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    supabase: Client = Depends(get_supabase)
) -> tuple[str, str]:
    """Get current authenticated user ID and token"""
    
    auth_service = AuthService(supabase)
    user_id = auth_service.verify_token(credentials.credentials)
    
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user_id, credentials.credentials

# Optional dependency for protected routes
async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False)),
    supabase: Client = Depends(get_supabase)
) -> Optional[str]:
    """Get current user ID if authenticated, otherwise None"""
    
    if not credentials:
        return None
        
    auth_service = AuthService(supabase)
    return auth_service.verify_token(credentials.credentials)