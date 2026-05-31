from fastapi import status
from postgrest.exceptions import APIError

from app.schemas.admin_schema import CreateDoctorRequest, DoctorProfileResponse
from app.services.supabase_service import get_supabase_client


class AdminServiceError(Exception):
    def __init__(self, message: str, status_code: int) -> None:
        self.message = message
        self.status_code = status_code
        super().__init__(message)


def _read_error_message(error: Exception) -> str:
    if isinstance(error, APIError):
        return error.message
    return str(error)


def list_doctors() -> list[DoctorProfileResponse]:
    supabase = get_supabase_client()

    try:
        response = (
            supabase.table("doctor_profiles")
            .select(
                "id,user_id,email,full_name,phone_number,age,gender,"
                "profile_picture_url,license_number,specialization"
            )
            .order("full_name")
            .execute()
        )
    except Exception as error:
        raise AdminServiceError(
            message=_read_error_message(error) or "Doctor profiles could not be loaded.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        ) from error

    return [DoctorProfileResponse(**row) for row in response.data or []]


def create_doctor(payload: CreateDoctorRequest) -> DoctorProfileResponse:
    supabase = get_supabase_client()

    try:
        created_user = supabase.auth.admin.create_user(
            {
                "email": payload.email,
                "password": payload.password,
                "email_confirm": True,
                "user_metadata": {
                    "full_name": payload.full_name,
                    "role": "doctor",
                },
            }
        )
    except Exception as error:
        raise AdminServiceError(
            message=_read_error_message(error) or "Doctor auth account could not be created.",
            status_code=status.HTTP_400_BAD_REQUEST,
        ) from error

    user = created_user.user
    if not user or not user.id or not user.email:
        raise AdminServiceError(
            message="Supabase did not return a created doctor user.",
            status_code=status.HTTP_502_BAD_GATEWAY,
        )

    try:
        supabase.table("profiles").insert(
            {
                "user_id": user.id,
                "email": user.email,
                "role": "doctor",
            }
        ).execute()

        doctor_response = (
            supabase.table("doctor_profiles")
            .insert(
                {
                    "user_id": user.id,
                    "email": user.email,
                    "full_name": payload.full_name,
                    "phone_number": payload.phone_number,
                    "age": payload.age,
                    "gender": payload.gender,
                    "license_number": payload.license_number,
                    "specialization": payload.specialization,
                    "profile_picture_url": None,
                }
            )
            .execute()
        )
    except Exception as error:
        raise AdminServiceError(
            message=_read_error_message(error)
            or "Doctor account was created, but profile data could not be saved.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        ) from error

    if not doctor_response.data:
        raise AdminServiceError(
            message="Doctor profile could not be saved.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return DoctorProfileResponse(**doctor_response.data[0])
