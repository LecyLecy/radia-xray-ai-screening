from fastapi import APIRouter
from app.services.supabase_service import get_supabase_client

router = APIRouter(prefix="/supabase", tags=["Supabase"])

@router.get("/test")
def test_supabase_connection():
    supabase = get_supabase_client()

    result = supabase.table("profiles").select("*").limit(1).execute()

    return {
        "status": "connected",
        "table": "profiles",
        "data": result.data
    }