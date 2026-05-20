from fastapi import status
from postgrest.exceptions import APIError

from app.schemas.auth_schema import (
    AuthSessionResponse,
    AuthUserResponse,
    LoginRequest,
    PatientRegisterRequest,
)
from app.services.supabase_service import get_supabase_auth_client, get_supabase_client


class AuthServiceError(Exception):
    def __init__(self, message: str, status_code: int) -> None:
        self.message = message
        self.status_code = status_code
        super().__init__(message)


def _read_error_message(error: Exception) -> str:
    if isinstance(error, APIError):
        return error.message
    return str(error)


def _raise_clear_error(error: Exception, fallback: str, status_code: int) -> None:
    message = _read_error_message(error) or fallback
    raise AuthServiceError(message=message, status_code=status_code) from error


def register_patient(payload: PatientRegisterRequest) -> AuthUserResponse:
    supabase = get_supabase_client()
    auth_user_id: str | None = None

    try:
        created_user = supabase.auth.admin.create_user(
            {
                "email": payload.email,
                "password": payload.password,
                "email_confirm": True,
                "user_metadata": {
                    "full_name": payload.full_name,
                    "role": "patient",
                },
            }
        )
    except Exception as error:
        _raise_clear_error(
            error,
            fallback="Supabase could not create the patient account.",
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    user = created_user.user
    if not user or not user.id or not user.email:
        raise AuthServiceError(
            message="Supabase did not return a created user.",
            status_code=status.HTTP_502_BAD_GATEWAY,
        )

    auth_user_id = user.id

    try:
        supabase.table("profiles").insert(
            {
                "user_id": auth_user_id,
                "email": user.email,
                "role": "patient",
            }
        ).execute()

        supabase.table("patient_profiles").insert(
            {
                "user_id": auth_user_id,
                "full_name": payload.full_name,
                "email": user.email,
                "phone_number": payload.phone_number,
                "age": payload.age,
                "gender": payload.gender,
                "profile_picture_url": payload.profile_picture_url,
            }
        ).execute()
    except Exception as error:
        # TODO rollback auth user if profile insertion fails.
        _raise_clear_error(
            error,
            fallback="Patient account was created, but profile data could not be saved.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return AuthUserResponse(user_id=auth_user_id, email=user.email, role="patient")


def login_user(payload: LoginRequest) -> AuthSessionResponse:
    auth_client = get_supabase_auth_client()
    supabase = get_supabase_client()

    try:
        auth_response = auth_client.auth.sign_in_with_password(
            {
                "email": payload.email,
                "password": payload.password,
            }
        )
    except Exception as error:
        _raise_clear_error(
            error,
            fallback="Invalid email or password.",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )

    if not auth_response.user or not auth_response.session:
        raise AuthServiceError(
            message="Invalid email or password.",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )

    user = auth_response.user
    session = auth_response.session

    try:
        profile_response = (
            supabase.table("profiles")
            .select("role")
            .eq("user_id", user.id)
            .single()
            .execute()
        )
    except Exception as error:
        _raise_clear_error(
            error,
            fallback="User role could not be loaded.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    role = profile_response.data.get("role") if profile_response.data else None
    if role not in {"patient", "doctor", "admin"}:
        raise AuthServiceError(
            message="User role is missing or invalid.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return AuthSessionResponse(
        access_token=session.access_token,
        refresh_token=session.refresh_token,
        user=AuthUserResponse(
            user_id=user.id,
            email=user.email or payload.email,
            role=role,
        ),
    )
