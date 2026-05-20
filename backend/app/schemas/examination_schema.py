from typing import Literal

from pydantic import BaseModel, Field


PredictionResult = Literal["Normal", "Pneumonia"]


class MockAIPredictionResponse(BaseModel):
    examination_id: int | None = None
    prediction_result: PredictionResult
    confidence_score: float = Field(ge=0, le=1)
    confidence_percentage: int = Field(ge=0, le=100)
    model_name: str
    is_mock: bool
    disclaimer: str
