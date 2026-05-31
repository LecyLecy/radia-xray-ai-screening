import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SECRET_KEY = os.getenv("SUPABASE_SECRET_KEY")
SUPABASE_PUBLISHABLE_KEY = os.getenv("SUPABASE_PUBLISHABLE_KEY")
CORS_ALLOW_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ALLOW_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173,https://radia-xray-ai-screening.vercel.app",
    ).split(",")
    if origin.strip()
]
STORAGE_BUCKET_XRAY = os.getenv("STORAGE_BUCKET_XRAY", "xray-images")
STORAGE_BUCKET_REPORT = os.getenv("STORAGE_BUCKET_REPORT", "pdf-reports")
STORAGE_BUCKET_PROFILE = os.getenv("STORAGE_BUCKET_PROFILE", "profile-pictures")

MAX_XRAY_UPLOAD_BYTES = int(os.getenv("MAX_XRAY_UPLOAD_BYTES", 10 * 1024 * 1024))
MAX_PROFILE_PICTURE_BYTES = int(os.getenv("MAX_PROFILE_PICTURE_BYTES", 2 * 1024 * 1024))
