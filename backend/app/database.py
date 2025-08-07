from supabase import create_client, Client
from app.config import settings

# Initialize Supabase client
supabase: Client = create_client(settings.supabase_url, settings.supabase_anon_key)

# Service role client for admin operations
supabase_admin: Client = create_client(settings.supabase_url, settings.supabase_service_role_key)

def get_supabase() -> Client:
    """Dependency to get Supabase client"""
    return supabase

def get_supabase_admin() -> Client:
    """Dependency to get Supabase admin client"""
    return supabase_admin