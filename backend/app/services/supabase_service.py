from supabase import create_client, Client
from app.config import SUPABASE_PUBLISHABLE_KEY, SUPABASE_SECRET_KEY, SUPABASE_URL

def get_supabase_client() -> Client:
    if not SUPABASE_URL or not SUPABASE_SECRET_KEY:
        raise ValueError("Supabase URL or secret key is missing")

    return create_client(SUPABASE_URL, SUPABASE_SECRET_KEY)


def get_supabase_auth_client() -> Client:
    if not SUPABASE_URL or not SUPABASE_PUBLISHABLE_KEY:
        raise ValueError("Supabase URL or publishable key is missing")

    return create_client(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
