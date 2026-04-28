from pydantic import BaseModel

class Settings(BaseModel):
    app_name: str = "Radia"
    environment: str = "development"

settings = Settings()
