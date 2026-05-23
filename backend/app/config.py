import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SECRET_KEY = os.getenv("SUPABASE_SECRET_KEY")
SUPABASE_PUBLISHABLE_KEY = os.getenv("SUPABASE_PUBLISHABLE_KEY")
STORAGE_BUCKET_XRAY = os.getenv("STORAGE_BUCKET_XRAY", "xray-images")

MAX_XRAY_UPLOAD_BYTES = int(os.getenv("MAX_XRAY_UPLOAD_BYTES", 10 * 1024 * 1024))
