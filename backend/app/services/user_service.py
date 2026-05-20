from fastapi import status
from postgrest.exceptions import APIError

from app.schemas.user_schema import CurrentUserResponse, PatientProfileResponse
from app.services.supabase_service import get_supabase_client


class UserServiceError(Exception):
    def __init__(self, message: str, status_code: int) -> None:
        self.message = message
        self.status_code = status_code
        super().__init__(message)


def _read_error_message(error: Exception) -> str:
    if isinstance(error, APIError):
        return error.message
    return str(error)


def get_current_user_with_role(auth_user: CurrentUserResponse) -> CurrentUserResponse:
    supabase = get_supabase_client()

    try:
        response = (
            supabase.table("profiles")
            .select("role")
            .eq("user_id", auth_user.user_id)
            .single()
            .execute()
        )
    except Exception as error:
        raise UserServiceError(
            message=_read_error_message(error) or "User role could not be loaded.",
            status_code=status.HTTP_404_NOT_FOUND,
        ) from error

    role = response.data.get("role") if response.data else None
    if role not in {"patient", "doctor", "admin"}:
        raise UserServiceError(
            message="User role is missing or invalid.",
            status_code=status.HTTP_404_NOT_FOUND,
        )

    return CurrentUserResponse(
        user_id=auth_user.user_id,
        email=auth_user.email,
        role=role,
    )


def get_patient_profile(auth_user: CurrentUserResponse) -> PatientProfileResponse:
    current_user = get_current_user_with_role(auth_user)
    if current_user.role != "patient":
        raise UserServiceError(
            message="Only patient users can access this profile endpoint.",
            status_code=status.HTTP_403_FORBIDDEN,
        )

    supabase = get_supabase_client()
    try:
        response = (
            supabase.table("patient_profiles")
            .select(
                "user_id,email,full_name,phone_number,age,gender,profile_picture_url"
            )
            .eq("user_id", current_user.user_id)
            .single()
            .execute()
        )
    except Exception as error:
        raise UserServiceError(
            message=_read_error_message(error) or "Patient profile was not found.",
            status_code=status.HTTP_404_NOT_FOUND,
        ) from error

    if not response.data:
        raise UserServiceError(
            message="Patient profile was not found.",
            status_code=status.HTTP_404_NOT_FOUND,
        )

    return PatientProfileResponse(**response.data)
