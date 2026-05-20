from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.examination_routes import router as examination_router

app = FastAPI(title="Radia API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
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
