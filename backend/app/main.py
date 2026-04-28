from fastapi import FastAPI

app = FastAPI(
    title="Radia Backend API",
    description="Backend API for Radia X-Ray Examination Management System",
    version="0.1.0",
)

@app.get("/")
def root():
    return {
        "app": "Radia Backend API",
        "status": "initial structure ready"
    }
