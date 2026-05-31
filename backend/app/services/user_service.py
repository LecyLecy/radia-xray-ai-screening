from fastapi import status
from postgrest.exceptions import APIError

from fastapi import UploadFile

from app.schemas.user_schema import (
    CurrentUserProfileResponse,
    CurrentUserResponse,
    PatientProfileResponse,
    UpdatePatientProfileRequest,
)
from app.services.supabase_service import get_supabase_client
from app.services.storage_service import (
    StorageServiceError,
    create_profile_picture_signed_url,
    read_valid_profile_picture_upload,
    upload_profile_picture,
)


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
                "id,user_id,email,full_name,phone_number,age,gender,profile_picture_url"
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

    return _to_patient_profile_response(response.data)


def _to_patient_profile_response(row: dict) -> PatientProfileResponse:
    return PatientProfileResponse(
        **row,
        profile_picture_download_url=create_profile_picture_signed_url(
            row.get("profile_picture_url")
        ),
    )


def get_current_user_profile(auth_user: CurrentUserResponse) -> CurrentUserProfileResponse:
    current_user = get_current_user_with_role(auth_user)
    supabase = get_supabase_client()

    table_by_role = {
        "patient": "patient_profiles",
        "doctor": "doctor_profiles",
        "admin": "admin_profiles",
    }
    table_name = table_by_role[current_user.role]
    if current_user.role == "admin":
        selected_columns = "id,user_id,email,full_name"
    else:
        selected_columns = (
            "id,user_id,email,full_name,phone_number,age,gender,profile_picture_url"
        )
    if current_user.role == "doctor":
        selected_columns += ",license_number,specialization"

    try:
        response = (
            supabase.table(table_name)
            .select(selected_columns)
            .eq("user_id", current_user.user_id)
            .single()
            .execute()
        )
        row = response.data or {}
    except Exception:
        row = {}

    return CurrentUserProfileResponse(
        user_id=current_user.user_id,
        email=row.get("email") or current_user.email,
        role=current_user.role,
        full_name=row.get("full_name"),
        phone_number=row.get("phone_number"),
        age=row.get("age"),
        gender=row.get("gender"),
        profile_picture_url=(
            row.get("profile_picture_url") if current_user.role != "admin" else None
        ),
        profile_picture_download_url=(
            create_profile_picture_signed_url(row.get("profile_picture_url"))
            if current_user.role != "admin"
            else None
        ),
        license_number=row.get("license_number"),
        specialization=row.get("specialization"),
    )


def _get_current_patient_profile_row(auth_user: CurrentUserResponse) -> dict:
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
                "id,user_id,email,full_name,phone_number,age,gender,profile_picture_url"
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

    return response.data


def update_patient_profile(
    auth_user: CurrentUserResponse,
    payload: UpdatePatientProfileRequest,
) -> PatientProfileResponse:
    current_profile = _get_current_patient_profile_row(auth_user)
    supabase = get_supabase_client()

    update_row = {
        "full_name": payload.full_name,
        "phone_number": payload.phone_number,
        "age": payload.age,
        "gender": payload.gender,
    }

    try:
        response = (
            supabase.table("patient_profiles")
            .update(update_row)
            .eq("id", current_profile["id"])
            .execute()
        )
    except Exception as error:
        raise UserServiceError(
            message=_read_error_message(error) or "Patient profile could not be updated.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        ) from error

    if not response.data:
        raise UserServiceError(
            message="Patient profile could not be updated.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return _to_patient_profile_response(response.data[0])


async def update_patient_profile_picture(
    auth_user: CurrentUserResponse,
    profile_picture: UploadFile,
) -> PatientProfileResponse:
    current_profile = _get_current_patient_profile_row(auth_user)

    try:
        upload_data = await read_valid_profile_picture_upload(profile_picture)
        profile_picture_url = upload_profile_picture(auth_user.user_id, upload_data)
    except StorageServiceError as error:
        raise UserServiceError(
            message=error.message,
            status_code=error.status_code,
        ) from error

    supabase = get_supabase_client()
    try:
        response = (
            supabase.table("patient_profiles")
            .update({"profile_picture_url": profile_picture_url})
            .eq("id", current_profile["id"])
            .execute()
        )
    except Exception as error:
        raise UserServiceError(
            message=_read_error_message(error)
            or "Patient profile picture could not be saved.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        ) from error

    if not response.data:
        raise UserServiceError(
            message="Patient profile picture could not be saved.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return _to_patient_profile_response(response.data[0])


def require_role(
    auth_user: CurrentUserResponse,
    allowed_roles: set[str],
) -> CurrentUserResponse:
    current_user = get_current_user_with_role(auth_user)
    if current_user.role not in allowed_roles:
        raise UserServiceError(
            message="User role is not allowed to access this endpoint.",
            status_code=status.HTTP_403_FORBIDDEN,
        )

    return current_user
