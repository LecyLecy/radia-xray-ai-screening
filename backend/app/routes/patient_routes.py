from fastapi import APIRouter, Depends, HTTPException

from app.schemas.user_schema import CurrentUserResponse, PatientProfileResponse
from app.services.user_service import UserServiceError, get_patient_profile
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
