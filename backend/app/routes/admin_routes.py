from fastapi import APIRouter, Depends, HTTPException, Query, Response, status

from app.schemas.admin_schema import (
    AdminCreateDoctorRequest,
    AdminCreatePatientRequest,
    AdminUpdateDoctorRequest,
    AdminUpdatePatientRequest,
    DoctorProfileResponse,
    PromotePatientToDoctorRequest,
)
from app.schemas.user_schema import CurrentUserResponse, PatientProfileResponse
from app.services.admin_service import (
    AdminServiceError,
    create_doctor,
    create_patient,
    delete_doctor,
    delete_patient,
    list_doctors,
    list_patients,
    promote_patient_to_doctor,
    search_patients_by_email,
    update_doctor,
    update_patient,
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


@router.post("/doctors", response_model=DoctorProfileResponse, status_code=status.HTTP_201_CREATED)
def create_admin_doctor(
    payload: AdminCreateDoctorRequest,
    _: CurrentUserResponse = Depends(require_admin),
) -> DoctorProfileResponse:
    try:
        return create_doctor(payload)
    except AdminServiceError as error:
        raise HTTPException(
            status_code=error.status_code,
            detail=error.message,
        ) from error


@router.patch("/doctors/{doctor_id}", response_model=DoctorProfileResponse)
def update_admin_doctor(
    doctor_id: str,
    payload: AdminUpdateDoctorRequest,
    _: CurrentUserResponse = Depends(require_admin),
) -> DoctorProfileResponse:
    try:
        return update_doctor(doctor_id, payload)
    except AdminServiceError as error:
        raise HTTPException(
            status_code=error.status_code,
            detail=error.message,
        ) from error


@router.delete("/doctors/{doctor_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_admin_doctor(
    doctor_id: str,
    _: CurrentUserResponse = Depends(require_admin),
) -> Response:
    try:
        delete_doctor(doctor_id)
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except AdminServiceError as error:
        raise HTTPException(
            status_code=error.status_code,
            detail=error.message,
        ) from error


@router.get("/patients", response_model=list[PatientProfileResponse])
def get_admin_patients(
    _: CurrentUserResponse = Depends(require_admin),
) -> list[PatientProfileResponse]:
    try:
        return list_patients()
    except AdminServiceError as error:
        raise HTTPException(
            status_code=error.status_code,
            detail=error.message,
        ) from error


@router.post("/patients", response_model=PatientProfileResponse, status_code=status.HTTP_201_CREATED)
def create_admin_patient(
    payload: AdminCreatePatientRequest,
    _: CurrentUserResponse = Depends(require_admin),
) -> PatientProfileResponse:
    try:
        return create_patient(payload)
    except AdminServiceError as error:
        raise HTTPException(
            status_code=error.status_code,
            detail=error.message,
        ) from error


@router.patch("/patients/{patient_id}", response_model=PatientProfileResponse)
def update_admin_patient(
    patient_id: str,
    payload: AdminUpdatePatientRequest,
    _: CurrentUserResponse = Depends(require_admin),
) -> PatientProfileResponse:
    try:
        return update_patient(patient_id, payload)
    except AdminServiceError as error:
        raise HTTPException(
            status_code=error.status_code,
            detail=error.message,
        ) from error


@router.delete("/patients/{patient_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_admin_patient(
    patient_id: str,
    _: CurrentUserResponse = Depends(require_admin),
) -> Response:
    try:
        delete_patient(patient_id)
        return Response(status_code=status.HTTP_204_NO_CONTENT)
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
