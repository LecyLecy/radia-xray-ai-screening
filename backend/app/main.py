from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.auth_routes import router as auth_router
from app.routes.doctor_routes import router as doctor_router
from app.routes.examination_routes import router as examination_router
from app.routes.patient_routes import router as patient_router
from app.routes.report_routes import router as report_router
from app.routes.supabase_routes import router as supabase_router

app = FastAPI(title="Radia API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "message": "Radia API is running"
    }

@app.get("/health")
def health_check():
    return {
        "status": "ok"
    }


app.include_router(examination_router)
app.include_router(supabase_router)
app.include_router(auth_router)
app.include_router(patient_router)
app.include_router(doctor_router)
app.include_router(report_router)
