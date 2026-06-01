from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile

from app.schemas.examination_schema import (
    CreateExaminationRequest,
    DoctorExaminationDetailResponse,
    DoctorExaminationSummary,
    DoctorFeedbackRequest,
    DoctorFeedbackResponse,
    ExaminationResponse,
    FinalDoctorReviewRequest,
    StoredAIPredictionResponse,
    UpdateDoctorNoteRequest,
)
from app.schemas.report_schema import ReportResponse
from app.schemas.user_schema import CurrentUserResponse, PatientProfileResponse
from app.services.examination_service import (
    ExaminationServiceError,
    create_examination,
    delete_doctor_examination,
    get_doctor_examination_detail,
    get_patient_by_id,
    list_doctor_examinations,
    list_patients,
    save_final_doctor_review,
    save_doctor_feedback,
    search_patients,
    start_doctor_examination,
    update_doctor_note,
)
from app.services.report_service import ReportServiceError, generate_examination_report
from app.services.user_service import UserServiceError, require_role
from app.utils.security import get_current_auth_user


router = APIRouter(prefix="/doctor", tags=["Doctor"])


def require_doctor_or_admin(
    auth_user: CurrentUserResponse = Depends(get_current_auth_user),
) -> CurrentUserResponse:
    try:
        return require_role(auth_user, {"doctor", "admin"})
    except UserServiceError as error:
        raise HTTPException(
            status_code=error.status_code,
            detail=error.message,
        ) from error


@router.get("/patients", response_model=list[PatientProfileResponse])
def get_doctor_patients(
    _: CurrentUserResponse = Depends(require_doctor_or_admin),
) -> list[PatientProfileResponse]:
    try:
        return list_patients()
    except ExaminationServiceError as error:
        raise HTTPException(
            status_code=error.status_code,
            detail=error.message,
        ) from error


@router.get("/patients/search", response_model=list[PatientProfileResponse])
def search_doctor_patients(
    email: str = Query(min_length=1),
    _: CurrentUserResponse = Depends(require_doctor_or_admin),
) -> list[PatientProfileResponse]:
    try:
        return search_patients(email)
    except ExaminationServiceError as error:
        raise HTTPException(
            status_code=error.status_code,
            detail=error.message,
        ) from error


@router.get("/patients/{patient_id}", response_model=PatientProfileResponse)
def get_doctor_patient_detail(
    patient_id: str,
    _: CurrentUserResponse = Depends(require_doctor_or_admin),
) -> PatientProfileResponse:
    try:
        return get_patient_by_id(patient_id)
    except ExaminationServiceError as error:
        raise HTTPException(
            status_code=error.status_code,
            detail=error.message,
        ) from error


@router.get("/examinations", response_model=list[DoctorExaminationSummary])
def get_doctor_examinations(
    current_user: CurrentUserResponse = Depends(require_doctor_or_admin),
) -> list[DoctorExaminationSummary]:
    try:
        return list_doctor_examinations(current_user)
    except ExaminationServiceError as error:
        raise HTTPException(
            status_code=error.status_code,
            detail=error.message,
        ) from error


@router.post("/examinations/start", response_model=StoredAIPredictionResponse)
async def start_new_doctor_examination(
    patient_email: str = Form(...),
    symptoms_description: str = Form(...),
    preliminary_solution: str = Form(...),
    xray_image: UploadFile = File(...),
    current_user: CurrentUserResponse = Depends(require_doctor_or_admin),
) -> StoredAIPredictionResponse:
    try:
        return await start_doctor_examination(
            patient_email=patient_email,
            symptoms_description=symptoms_description,
            preliminary_solution=preliminary_solution,
            xray_image=xray_image,
            current_user=current_user,
        )
    except ExaminationServiceError as error:
        raise HTTPException(
            status_code=error.status_code,
            detail=error.message,
        ) from error


@router.post("/examinations", response_model=ExaminationResponse)
def create_doctor_examination(
    payload: CreateExaminationRequest,
    current_user: CurrentUserResponse = Depends(require_doctor_or_admin),
) -> ExaminationResponse:
    try:
        return create_examination(payload, current_user)
    except ExaminationServiceError as error:
        raise HTTPException(
            status_code=error.status_code,
            detail=error.message,
        ) from error


@router.get(
    "/examinations/{examination_id}",
    response_model=DoctorExaminationDetailResponse,
)
def get_doctor_examination(
    examination_id: str,
    current_user: CurrentUserResponse = Depends(require_doctor_or_admin),
) -> DoctorExaminationDetailResponse:
    try:
        return get_doctor_examination_detail(examination_id, current_user)
    except ExaminationServiceError as error:
        raise HTTPException(
            status_code=error.status_code,
            detail=error.message,
        ) from error


@router.delete("/examinations/{examination_id}", status_code=204)
def delete_doctor_examination_record(
    examination_id: str,
    current_user: CurrentUserResponse = Depends(require_doctor_or_admin),
) -> None:
    try:
        delete_doctor_examination(examination_id, current_user)
    except ExaminationServiceError as error:
        raise HTTPException(
            status_code=error.status_code,
            detail=error.message,
        ) from error


@router.patch(
    "/examinations/{examination_id}/note",
    response_model=ExaminationResponse,
)
def update_doctor_examination_note(
    examination_id: str,
    payload: UpdateDoctorNoteRequest,
    current_user: CurrentUserResponse = Depends(require_doctor_or_admin),
) -> ExaminationResponse:
    try:
        return update_doctor_note(examination_id, payload, current_user)
    except ExaminationServiceError as error:
        raise HTTPException(
            status_code=error.status_code,
            detail=error.message,
        ) from error


@router.patch(
    "/examinations/{examination_id}/final-review",
    response_model=ExaminationResponse,
)
def save_doctor_examination_final_review(
    examination_id: str,
    payload: FinalDoctorReviewRequest,
    current_user: CurrentUserResponse = Depends(require_doctor_or_admin),
) -> ExaminationResponse:
    try:
        return save_final_doctor_review(examination_id, payload, current_user)
    except ExaminationServiceError as error:
        raise HTTPException(
            status_code=error.status_code,
            detail=error.message,
        ) from error


@router.patch(
    "/examinations/{examination_id}/feedback",
    response_model=DoctorFeedbackResponse,
)
def save_doctor_examination_feedback(
    examination_id: str,
    payload: DoctorFeedbackRequest,
    current_user: CurrentUserResponse = Depends(require_doctor_or_admin),
) -> DoctorFeedbackResponse:
    try:
        return save_doctor_feedback(examination_id, payload, current_user)
    except ExaminationServiceError as error:
        raise HTTPException(
            status_code=error.status_code,
            detail=error.message,
        ) from error


@router.post(
    "/examinations/{examination_id}/report",
    response_model=ReportResponse,
)
def generate_doctor_examination_report(
    examination_id: str,
    current_user: CurrentUserResponse = Depends(require_doctor_or_admin),
) -> ReportResponse:
    try:
        return generate_examination_report(examination_id, current_user)
    except ReportServiceError as error:
        raise HTTPException(
            status_code=error.status_code,
            detail=error.message,
        ) from error
