from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


PredictionResult = Literal["Normal", "Pneumonia"]
ExaminationStatus = Literal["pending_review", "reviewed", "report_ready"]


class MockAIPredictionResponse(BaseModel):
    examination_id: str | None = None
    prediction_result: PredictionResult
    confidence_score: float = Field(ge=0, le=1)
    confidence_percentage: int = Field(ge=0, le=100)
    model_name: str
    is_mock: bool
    disclaimer: str


class StoredAIPredictionResponse(MockAIPredictionResponse):
    xray_image_id: str
    ai_prediction_id: str
    image_url: str


class CreateExaminationRequest(BaseModel):
    patient_id: str
    examination_date: datetime | None = None


class ExaminationResponse(BaseModel):
    id: str
    patient_id: str
    doctor_id: str | None = None
    created_by_user_id: str
    examination_date: datetime
    status: ExaminationStatus
    doctor_note: str | None = None
