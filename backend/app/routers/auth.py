from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client

from app.database import get_supabase
from app.auth import AuthService
from app.models import UserLogin, UserRegister, Token, ResponseModel

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=ResponseModel)
async def register(
    user_data: UserRegister,
    supabase: Client = Depends(get_supabase)
):
    """Register a new user"""
    try:
        auth_service = AuthService(supabase)
        token = await auth_service.register_user(user_data)
        
        # Check if email confirmation is needed
        if token.token_type == "pending_confirmation":
            return ResponseModel(
                success=True,
                message="Registration successful! Please check your email to confirm your account before logging in.",
                data=token
            )
        
        return ResponseModel(
            success=True,
            message="User registered and logged in successfully",
            data=token
        )
    except HTTPException as e:
        # Re-raise HTTP exceptions
        raise e
    except Exception as e:
        print(f"Registration error: {str(e)}")  # Debug log
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Registration failed: {str(e)}"
        )

@router.post("/login", response_model=ResponseModel)
async def login(
    user_data: UserLogin,
    supabase: Client = Depends(get_supabase)
):
    """Login user"""
    auth_service = AuthService(supabase)
    token = await auth_service.login_user(user_data)
    
    return ResponseModel(
        success=True,
        message="Login successful",
        data=token
    )

@router.post("/refresh", response_model=ResponseModel)
async def refresh_token(
    refresh_token: str,
    supabase: Client = Depends(get_supabase)
):
    """Refresh access token"""
    auth_service = AuthService(supabase)
    token = await auth_service.refresh_token(refresh_token)
    
    return ResponseModel(
        success=True,
        message="Token refreshed successfully",
        data=token
    )

@router.post("/logout", response_model=ResponseModel)
async def logout(
    supabase: Client = Depends(get_supabase)
):
    """Logout user (client-side token removal mainly)"""
    # Supabase handles logout on client side mainly
    # Server can revoke refresh tokens if needed
    return ResponseModel(
        success=True,
        message="Logout successful"
    )