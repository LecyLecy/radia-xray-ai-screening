from fastapi import APIRouter, HTTPException, status

from app.schemas.auth_schema import (
    AuthSessionResponse,
    AuthUserResponse,
    LoginRequest,
    PatientRegisterRequest,
)
from app.services.auth_service import AuthServiceError, login_user, register_patient


router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post(
    "/register/patient",
    response_model=AuthUserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register_patient_account(payload: PatientRegisterRequest) -> AuthUserResponse:
    try:
        return register_patient(payload)
    except AuthServiceError as error:
        raise HTTPException(
            status_code=error.status_code,
            detail=error.message,
        ) from error


@router.post("/login", response_model=AuthSessionResponse)
def login(payload: LoginRequest) -> AuthSessionResponse:
    try:
        return login_user(payload)
    except AuthServiceError as error:
        raise HTTPException(
            status_code=error.status_code,
            detail=error.message,
        ) from error
