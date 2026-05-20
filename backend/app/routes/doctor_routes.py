from fastapi import APIRouter, Depends, HTTPException

from app.schemas.examination_schema import (
    CreateExaminationRequest,
    ExaminationResponse,
)
from app.schemas.user_schema import CurrentUserResponse, PatientProfileResponse
from app.services.examination_service import (
    ExaminationServiceError,
    create_examination,
    get_patient_by_id,
    list_patients,
)
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
