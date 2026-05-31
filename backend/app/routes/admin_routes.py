from fastapi import APIRouter, Depends, HTTPException, Query

from app.schemas.admin_schema import DoctorProfileResponse, PromotePatientToDoctorRequest
from app.schemas.user_schema import CurrentUserResponse, PatientProfileResponse
from app.services.admin_service import (
    AdminServiceError,
    list_doctors,
    promote_patient_to_doctor,
    search_patients_by_email,
)
from app.services.user_service import UserServiceError, require_role
from app.utils.security import get_current_auth_user


router = APIRouter(prefix="/admin", tags=["Admin"])


def require_admin(
    auth_user: CurrentUserResponse = Depends(get_current_auth_user),
) -> CurrentUserResponse:
    try:
        return require_role(auth_user, {"admin"})
    except UserServiceError as error:
        raise HTTPException(
            status_code=error.status_code,
            detail=error.message,
        ) from error


@router.get("/doctors", response_model=list[DoctorProfileResponse])
def get_admin_doctors(
    _: CurrentUserResponse = Depends(require_admin),
) -> list[DoctorProfileResponse]:
    try:
        return list_doctors()
    except AdminServiceError as error:
        raise HTTPException(
            status_code=error.status_code,
            detail=error.message,
        ) from error


@router.get("/patients/search", response_model=list[PatientProfileResponse])
def search_admin_patients(
    email: str = Query(min_length=1),
    _: CurrentUserResponse = Depends(require_admin),
) -> list[PatientProfileResponse]:
    try:
        return search_patients_by_email(email)
    except AdminServiceError as error:
        raise HTTPException(
            status_code=error.status_code,
            detail=error.message,
        ) from error


@router.post("/doctors/promote", response_model=DoctorProfileResponse)
def promote_admin_patient_to_doctor(
    payload: PromotePatientToDoctorRequest,
    _: CurrentUserResponse = Depends(require_admin),
) -> DoctorProfileResponse:
    try:
        return promote_patient_to_doctor(payload)
    except AdminServiceError as error:
        raise HTTPException(
            status_code=error.status_code,
            detail=error.message,
        ) from error
