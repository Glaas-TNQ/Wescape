from supabase import create_client, Client
from app.core.config import get_settings

settings = get_settings()

# Create Supabase client
supabase: Client = create_client(
    settings.SUPABASE_URL, 
    settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY
)

def get_supabase_client() -> Client:
    """Get Supabase client instance"""
    return supabase