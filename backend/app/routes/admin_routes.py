from fastapi import APIRouter, Depends, HTTPException

from app.schemas.admin_schema import CreateDoctorRequest, DoctorProfileResponse
from app.schemas.user_schema import CurrentUserResponse
from app.services.admin_service import AdminServiceError, create_doctor, list_doctors
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


@router.post("/doctors", response_model=DoctorProfileResponse)
def create_admin_doctor(
    payload: CreateDoctorRequest,
    _: CurrentUserResponse = Depends(require_admin),
) -> DoctorProfileResponse:
    try:
        return create_doctor(payload)
    except AdminServiceError as error:
        raise HTTPException(
            status_code=error.status_code,
            detail=error.message,
        ) from error
