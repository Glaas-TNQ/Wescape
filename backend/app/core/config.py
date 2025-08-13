import os
from functools import lru_cache
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """Application settings"""
    
    # Project Configuration
    PROJECT_NAME: str = "WeScape API"
    API_V1_STR: str = "/api/v1"
    
    # API Configuration
    API_BASE_URL: str = "http://localhost:8000"
    DEBUG: bool = False
    
    # Supabase Configuration
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    SUPABASE_JWT_SECRET: str = ""
    
    # Auth Configuration
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    ALGORITHM: str = "HS256"
    
    # CORS Configuration
    BACKEND_CORS_ORIGINS: str = '["*"]'
    
    # n8n Integration
    N8N_CHAT_WEBHOOK_URL: str = ""
    
    # Rate Limiting
    CHAT_RATE_LIMIT_PER_MINUTE: int = 10
    
    model_config = {
        "env_file": ".env",
        "extra": "ignore"  # Permette campi extra nel .env senza errori
    }

@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()