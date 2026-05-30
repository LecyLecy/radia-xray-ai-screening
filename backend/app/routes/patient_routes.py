from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from app.schemas.examination_schema import (
    PatientExaminationDetailResponse,
    PatientExaminationHistoryItem,
)
from app.schemas.user_schema import (
    CurrentUserResponse,
    PatientProfileResponse,
    UpdatePatientProfileRequest,
)
from app.services.examination_service import (
    ExaminationServiceError,
    get_current_patient_examination_detail,
    list_current_patient_examinations,
)
from app.services.user_service import (
    UserServiceError,
    get_patient_profile,
    update_patient_profile,
    update_patient_profile_picture,
)
from app.utils.security import get_current_auth_user


router = APIRouter(prefix="/patients", tags=["Patients"])


@router.get("/me", response_model=PatientProfileResponse)
def get_my_patient_profile(
    current_user: CurrentUserResponse = Depends(get_current_auth_user),
) -> PatientProfileResponse:
    try:
        return get_patient_profile(current_user)
    except UserServiceError as error:
        raise HTTPException(
            status_code=error.status_code,
            detail=error.message,
        ) from error


@router.patch("/me", response_model=PatientProfileResponse)
def update_my_patient_profile(
    payload: UpdatePatientProfileRequest,
    current_user: CurrentUserResponse = Depends(get_current_auth_user),
) -> PatientProfileResponse:
    try:
        return update_patient_profile(current_user, payload)
    except UserServiceError as error:
        raise HTTPException(
            status_code=error.status_code,
            detail=error.message,
        ) from error


@router.post("/me/profile-picture", response_model=PatientProfileResponse)
async def upload_my_profile_picture(
    profile_picture: UploadFile = File(...),
    current_user: CurrentUserResponse = Depends(get_current_auth_user),
) -> PatientProfileResponse:
    try:
        return await update_patient_profile_picture(current_user, profile_picture)
    except UserServiceError as error:
        raise HTTPException(
            status_code=error.status_code,
            detail=error.message,
        ) from error


@router.get("/me/examinations", response_model=list[PatientExaminationHistoryItem])
def get_my_examination_history(
    current_user: CurrentUserResponse = Depends(get_current_auth_user),
) -> list[PatientExaminationHistoryItem]:
    try:
        return list_current_patient_examinations(current_user)
    except ExaminationServiceError as error:
        raise HTTPException(
            status_code=error.status_code,
            detail=error.message,
        ) from error


@router.get(
    "/me/examinations/{examination_id}",
    response_model=PatientExaminationDetailResponse,
)
def get_my_examination_detail(
    examination_id: str,
    current_user: CurrentUserResponse = Depends(get_current_auth_user),
) -> PatientExaminationDetailResponse:
    try:
        return get_current_patient_examination_detail(examination_id, current_user)
    except ExaminationServiceError as error:
        raise HTTPException(
            status_code=error.status_code,
            detail=error.message,
        ) from error
