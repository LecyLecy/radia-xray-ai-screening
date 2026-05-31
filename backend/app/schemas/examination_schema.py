from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

from app.schemas.user_schema import PatientProfileResponse


PredictionResult = Literal["Normal", "Pneumonia"]
ExaminationStatus = Literal["not_ready", "ready"]
FeedbackStatus = Literal["correct", "incorrect", "uncertain"]


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


class UpdateDoctorNoteRequest(BaseModel):
    doctor_note: str = Field(min_length=1)


class DoctorFeedbackRequest(BaseModel):
    feedback_status: FeedbackStatus
    feedback_note: str | None = None


class FinalDoctorReviewRequest(DoctorFeedbackRequest):
    final_diagnosis_result: PredictionResult
    final_doctor_note: str = Field(min_length=1)


class DoctorFeedbackResponse(BaseModel):
    id: str
    examination_id: str
    doctor_id: str | None = None
    feedback_status: FeedbackStatus
    feedback_note: str | None = None


class ExaminationResponse(BaseModel):
    id: str
    patient_id: str
    doctor_id: str | None = None
    created_by_user_id: str
    examination_date: datetime
    status: ExaminationStatus
    doctor_note: str | None = None
    symptoms_description: str | None = None
    preliminary_solution: str | None = None
    final_diagnosis_result: PredictionResult | None = None
    final_doctor_note: str | None = None


class PatientExaminationHistoryItem(BaseModel):
    id: str
    examination_date: datetime
    status: ExaminationStatus
    doctor_name: str | None = None
    final_diagnosis_result: PredictionResult | None = None
    report_id: str | None = None


class DoctorExaminationSummary(BaseModel):
    id: str
    patient_id: str
    patient_name: str | None = None
    patient_email: str | None = None
    examination_date: datetime
    status: ExaminationStatus
    prediction_result: PredictionResult | None = None
    confidence_percentage: int | None = Field(default=None, ge=0, le=100)
    report_id: str | None = None


class PatientDoctorSummary(BaseModel):
    id: str
    full_name: str | None = None
    email: str | None = None
    specialization: str | None = None


class PatientXraySummary(BaseModel):
    id: str
    image_url: str
    image_download_url: str | None = None
    file_name: str | None = None
    file_type: str | None = None
    uploaded_at: datetime | None = None


class PatientPredictionSummary(BaseModel):
    id: str
    prediction_result: PredictionResult
    confidence_score: float = Field(ge=0, le=1)
    confidence_percentage: int = Field(ge=0, le=100)
    gradcam_url: str | None = None
    model_name: str | None = None
    created_at: datetime | None = None


class PatientFeedbackSummary(BaseModel):
    id: str
    feedback_status: FeedbackStatus
    feedback_note: str | None = None
    created_at: datetime | None = None


class PatientReportSummary(BaseModel):
    id: str
    report_url: str
    generated_at: datetime | None = None


class PatientExaminationDetailResponse(BaseModel):
    id: str
    patient_id: str
    doctor_id: str | None = None
    created_by_user_id: str
    examination_date: datetime
    status: ExaminationStatus
    doctor_note: str | None = None
    symptoms_description: str | None = None
    preliminary_solution: str | None = None
    final_diagnosis_result: PredictionResult | None = None
    final_doctor_note: str | None = None
    doctor: PatientDoctorSummary | None = None
    xray_image: PatientXraySummary | None = None
    ai_prediction: PatientPredictionSummary | None = None
    doctor_feedback: PatientFeedbackSummary | None = None
    report: PatientReportSummary | None = None
    disclaimer: str


class DoctorExaminationDetailResponse(PatientExaminationDetailResponse):
    patient: PatientProfileResponse | None = None
