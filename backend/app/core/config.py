import os
from functools import lru_cache
from pydantic import BaseSettings

class Settings(BaseSettings):
    """Application settings"""
    
    # API Configuration
    API_BASE_URL: str = os.getenv("API_BASE_URL", "http://localhost:8000")
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    
    # Supabase Configuration
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    
    # n8n Integration
    N8N_CHAT_WEBHOOK_URL: str = os.getenv("N8N_CHAT_WEBHOOK_URL", "")
    
    # Rate Limiting
    CHAT_RATE_LIMIT_PER_MINUTE: int = int(os.getenv("CHAT_RATE_LIMIT_PER_MINUTE", "10"))
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    
    class Config:
        env_file = ".env"

@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()