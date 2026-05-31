from fastapi import status
from postgrest.exceptions import APIError

from app.schemas.admin_schema import (
    AdminCreateDoctorRequest,
    AdminCreatePatientRequest,
    AdminUpdateDoctorRequest,
    AdminUpdatePatientRequest,
    DoctorProfileResponse,
    PromotePatientToDoctorRequest,
)
from app.schemas.user_schema import PatientProfileResponse
from app.services.storage_service import create_profile_picture_signed_url
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


def list_patients() -> list[PatientProfileResponse]:
    supabase = get_supabase_client()

    try:
        response = (
            supabase.table("patient_profiles")
            .select("id,user_id,email,full_name,phone_number,age,gender,profile_picture_url")
            .order("full_name")
            .execute()
        )
    except Exception as error:
        raise AdminServiceError(
            message=_read_error_message(error) or "Patient profiles could not be loaded.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        ) from error

    return [PatientProfileResponse(**row) for row in response.data or []]


def _get_patient(patient_id: str) -> dict:
    supabase = get_supabase_client()
    try:
        response = (
            supabase.table("patient_profiles")
            .select("id,user_id,email,full_name,phone_number,age,gender,profile_picture_url")
            .eq("id", patient_id)
            .single()
            .execute()
        )
    except Exception as error:
        raise AdminServiceError(
            message=_read_error_message(error) or "Patient profile was not found.",
            status_code=status.HTTP_404_NOT_FOUND,
        ) from error

    if not response.data:
        raise AdminServiceError(
            message="Patient profile was not found.",
            status_code=status.HTTP_404_NOT_FOUND,
        )

    return response.data


def _get_doctor(doctor_id: str) -> dict:
    supabase = get_supabase_client()
    try:
        response = (
            supabase.table("doctor_profiles")
            .select(
                "id,user_id,email,full_name,phone_number,age,gender,"
                "profile_picture_url,license_number,specialization"
            )
            .eq("id", doctor_id)
            .single()
            .execute()
        )
    except Exception as error:
        raise AdminServiceError(
            message=_read_error_message(error) or "Doctor profile was not found.",
            status_code=status.HTTP_404_NOT_FOUND,
        ) from error

    if not response.data:
        raise AdminServiceError(
            message="Doctor profile was not found.",
            status_code=status.HTTP_404_NOT_FOUND,
        )

    return response.data


def _profile_has_examinations(column_name: str, profile_id: str) -> bool:
    supabase = get_supabase_client()
    try:
        response = (
            supabase.table("examinations")
            .select("id")
            .eq(column_name, profile_id)
            .limit(1)
            .execute()
        )
    except Exception as error:
        raise AdminServiceError(
            message=_read_error_message(error) or "Related examinations could not be checked.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        ) from error

    return bool(response.data)


def _get_profile_role(user_id: str) -> str | None:
    supabase = get_supabase_client()
    try:
        response = (
            supabase.table("profiles")
            .select("role")
            .eq("user_id", user_id)
            .single()
            .execute()
        )
    except Exception as error:
        raise AdminServiceError(
            message=_read_error_message(error) or "User role profile was not found.",
            status_code=status.HTTP_404_NOT_FOUND,
        ) from error

    return response.data.get("role") if response.data else None


def create_patient(payload: AdminCreatePatientRequest) -> PatientProfileResponse:
    supabase = get_supabase_client()

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
        raise AdminServiceError(
            message=_read_error_message(error) or "Patient auth account could not be created.",
            status_code=status.HTTP_400_BAD_REQUEST,
        ) from error

    user = created_user.user
    if not user or not user.id or not user.email:
        raise AdminServiceError(
            message="Supabase did not return a created patient user.",
            status_code=status.HTTP_502_BAD_GATEWAY,
        )

    try:
        supabase.table("profiles").insert(
            {"user_id": user.id, "email": user.email, "role": "patient"}
        ).execute()
        response = (
            supabase.table("patient_profiles")
            .insert(
                {
                    "user_id": user.id,
                    "email": user.email,
                    "full_name": payload.full_name,
                    "phone_number": payload.phone_number,
                    "age": payload.age,
                    "gender": payload.gender,
                    "profile_picture_url": None,
                }
            )
            .execute()
        )
    except Exception as error:
        raise AdminServiceError(
            message=_read_error_message(error)
            or "Patient auth account was created, but profile data could not be saved.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        ) from error

    if not response.data:
        raise AdminServiceError(
            message="Patient profile could not be saved.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return PatientProfileResponse(**response.data[0])


def create_doctor(payload: AdminCreateDoctorRequest) -> DoctorProfileResponse:
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
            message=_read_error_message(error)
            or "Medical staff auth account could not be created.",
            status_code=status.HTTP_400_BAD_REQUEST,
        ) from error

    user = created_user.user
    if not user or not user.id or not user.email:
        raise AdminServiceError(
            message="Supabase did not return a created medical staff user.",
            status_code=status.HTTP_502_BAD_GATEWAY,
        )

    try:
        supabase.table("profiles").insert(
            {"user_id": user.id, "email": user.email, "role": "doctor"}
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
                    "profile_picture_url": None,
                    "license_number": payload.license_number,
                    "specialization": payload.specialization,
                }
            )
            .execute()
        )
    except Exception as error:
        raise AdminServiceError(
            message=_read_error_message(error)
            or "Medical staff auth account was created, but profile data could not be saved.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        ) from error

    if not doctor_response.data:
        raise AdminServiceError(
            message="Medical staff profile could not be saved.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return DoctorProfileResponse(**doctor_response.data[0])


def search_patients_by_email(email: str) -> list[PatientProfileResponse]:
    supabase = get_supabase_client()
    normalized_email = email.strip()
    if not normalized_email:
        raise AdminServiceError(
            message="Email search query is required.",
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    try:
        response = (
            supabase.table("patient_profiles")
            .select(
                "id,user_id,email,full_name,phone_number,age,gender,profile_picture_url"
            )
            .ilike("email", f"%{normalized_email}%")
            .order("email")
            .limit(10)
            .execute()
        )
    except Exception as error:
        raise AdminServiceError(
            message=_read_error_message(error) or "Patient profiles could not be searched.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        ) from error

    return [
        PatientProfileResponse(
            **row,
            profile_picture_download_url=create_profile_picture_signed_url(
                row.get("profile_picture_url")
            ),
        )
        for row in response.data or []
    ]


def _patient_has_ongoing_examination(patient_id: str) -> bool:
    supabase = get_supabase_client()

    try:
        response = (
            supabase.table("examinations")
            .select("id,status")
            .eq("patient_id", patient_id)
            .in_("status", ["pending_review", "reviewed"])
            .limit(1)
            .execute()
        )
    except Exception as error:
        raise AdminServiceError(
            message=_read_error_message(error)
            or "Patient examination status could not be checked.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        ) from error

    return bool(response.data)


def promote_patient_to_doctor(
    payload: PromotePatientToDoctorRequest,
) -> DoctorProfileResponse:
    supabase = get_supabase_client()

    try:
        patient_response = (
            supabase.table("patient_profiles")
            .select(
                "id,user_id,email,full_name,phone_number,age,gender,profile_picture_url"
            )
            .eq("id", payload.patient_id)
            .single()
            .execute()
        )
    except Exception as error:
        raise AdminServiceError(
            message=_read_error_message(error) or "Patient profile was not found.",
            status_code=status.HTTP_404_NOT_FOUND,
        ) from error

    patient = patient_response.data
    if not patient:
        raise AdminServiceError(
            message="Patient profile was not found.",
            status_code=status.HTTP_404_NOT_FOUND,
        )

    if _patient_has_ongoing_examination(patient["id"]):
        raise AdminServiceError(
            message=(
                "This patient has an ongoing examination. Complete the examination "
                "and generate the report before promoting them to medical staff."
            ),
            status_code=status.HTTP_409_CONFLICT,
        )

    try:
        profile_response = (
            supabase.table("profiles")
            .select("id,user_id,email,role")
            .eq("user_id", patient["user_id"])
            .single()
            .execute()
        )
    except Exception as error:
        raise AdminServiceError(
            message=_read_error_message(error) or "User role profile was not found.",
            status_code=status.HTTP_404_NOT_FOUND,
        ) from error

    role = profile_response.data.get("role") if profile_response.data else None
    if role not in {"patient", "doctor"}:
        raise AdminServiceError(
            message="Only patient users can be promoted to medical staff.",
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    try:
        existing_doctor_response = (
            supabase.table("doctor_profiles")
            .select(
                "id,user_id,email,full_name,phone_number,age,gender,"
                "profile_picture_url,license_number,specialization"
            )
            .eq("user_id", patient["user_id"])
            .execute()
        )
    except Exception as error:
        raise AdminServiceError(
            message=_read_error_message(error) or "Doctor profile could not be checked.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        ) from error

    doctor_row = {
        "user_id": patient["user_id"],
        "email": patient["email"],
        "full_name": patient["full_name"],
        "phone_number": patient.get("phone_number"),
        "age": patient.get("age"),
        "gender": patient.get("gender"),
        "profile_picture_url": patient.get("profile_picture_url"),
        "license_number": payload.license_number,
        "specialization": payload.specialization,
    }

    try:
        if role == "patient":
            supabase.table("profiles").update({"role": "doctor"}).eq(
                "user_id",
                patient["user_id"],
            ).execute()

        existing_rows = existing_doctor_response.data or []
        if existing_rows:
            doctor_response = (
                supabase.table("doctor_profiles")
                .update(doctor_row)
                .eq("id", existing_rows[0]["id"])
                .execute()
            )
        else:
            doctor_response = (
                supabase.table("doctor_profiles")
                .insert(doctor_row)
                .execute()
            )
    except Exception as error:
        raise AdminServiceError(
            message=_read_error_message(error) or "Patient could not be promoted.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        ) from error

    if not doctor_response.data:
        try:
            doctor_response = (
                supabase.table("doctor_profiles")
                .select(
                    "id,user_id,email,full_name,phone_number,age,gender,"
                    "profile_picture_url,license_number,specialization"
                )
                .eq("user_id", patient["user_id"])
                .single()
                .execute()
            )
        except Exception as error:
            raise AdminServiceError(
                message=_read_error_message(error)
                or "Promoted doctor profile could not be loaded.",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            ) from error

    if not doctor_response.data:
        raise AdminServiceError(
            message="Promoted doctor profile could not be saved.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    row = (
        doctor_response.data[0]
        if isinstance(doctor_response.data, list)
        else doctor_response.data
    )
    return DoctorProfileResponse(**row)


def update_patient(
    patient_id: str,
    payload: AdminUpdatePatientRequest,
) -> PatientProfileResponse:
    patient = _get_patient(patient_id)
    role = _get_profile_role(patient["user_id"]) or "patient"
    supabase = get_supabase_client()
    row = {
        "full_name": payload.full_name,
        "phone_number": payload.phone_number,
        "age": payload.age,
        "gender": payload.gender,
    }

    try:
        response = (
            supabase.table("patient_profiles")
            .update(row)
            .eq("id", patient_id)
            .execute()
        )
        supabase.auth.admin.update_user_by_id(
            patient["user_id"],
            {"user_metadata": {"full_name": payload.full_name, "role": role}},
        )
    except Exception as error:
        raise AdminServiceError(
            message=_read_error_message(error) or "Patient profile could not be updated.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        ) from error

    if not response.data:
        raise AdminServiceError(
            message="Patient profile could not be updated.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return PatientProfileResponse(**response.data[0])


def update_doctor(
    doctor_id: str,
    payload: AdminUpdateDoctorRequest,
) -> DoctorProfileResponse:
    doctor = _get_doctor(doctor_id)
    supabase = get_supabase_client()
    row = {
        "full_name": payload.full_name,
        "phone_number": payload.phone_number,
        "age": payload.age,
        "gender": payload.gender,
        "license_number": payload.license_number,
        "specialization": payload.specialization,
    }

    try:
        response = (
            supabase.table("doctor_profiles")
            .update(row)
            .eq("id", doctor_id)
            .execute()
        )
        supabase.auth.admin.update_user_by_id(
            doctor["user_id"],
            {"user_metadata": {"full_name": payload.full_name, "role": "doctor"}},
        )
    except Exception as error:
        raise AdminServiceError(
            message=_read_error_message(error)
            or "Medical staff profile could not be updated.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        ) from error

    if not response.data:
        raise AdminServiceError(
            message="Medical staff profile could not be updated.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return DoctorProfileResponse(**response.data[0])


def delete_patient(patient_id: str) -> None:
    patient = _get_patient(patient_id)
    if _profile_has_examinations("patient_id", patient_id):
        raise AdminServiceError(
            message="Patient cannot be deleted while examination records still reference them.",
            status_code=status.HTTP_409_CONFLICT,
        )

    supabase = get_supabase_client()
    try:
        doctor_response = (
            supabase.table("doctor_profiles")
            .select("id")
            .eq("user_id", patient["user_id"])
            .limit(1)
            .execute()
        )
        supabase.table("patient_profiles").delete().eq("id", patient_id).execute()
        if doctor_response.data:
            supabase.table("profiles").update({"role": "doctor"}).eq(
                "user_id", patient["user_id"]
            ).execute()
            supabase.auth.admin.update_user_by_id(
                patient["user_id"],
                {"user_metadata": {"full_name": patient["full_name"], "role": "doctor"}},
            )
        else:
            supabase.table("profiles").delete().eq(
                "user_id", patient["user_id"]
            ).execute()
            supabase.auth.admin.delete_user(patient["user_id"])
    except Exception as error:
        raise AdminServiceError(
            message=_read_error_message(error) or "Patient could not be deleted.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        ) from error


def delete_doctor(doctor_id: str) -> None:
    doctor = _get_doctor(doctor_id)
    if _profile_has_examinations("doctor_id", doctor_id):
        raise AdminServiceError(
            message="Medical staff cannot be deleted while examination records still reference them.",
            status_code=status.HTTP_409_CONFLICT,
        )

    supabase = get_supabase_client()
    try:
        supabase.table("doctor_profiles").delete().eq("id", doctor_id).execute()
        patient_response = (
            supabase.table("patient_profiles")
            .select("id")
            .eq("user_id", doctor["user_id"])
            .limit(1)
            .execute()
        )
        if patient_response.data:
            supabase.table("profiles").update({"role": "patient"}).eq(
                "user_id", doctor["user_id"]
            ).execute()
            supabase.auth.admin.update_user_by_id(
                doctor["user_id"],
                {"user_metadata": {"full_name": doctor["full_name"], "role": "patient"}},
            )
        else:
            supabase.table("profiles").delete().eq("user_id", doctor["user_id"]).execute()
            supabase.auth.admin.delete_user(doctor["user_id"])
    except Exception as error:
        raise AdminServiceError(
            message=_read_error_message(error)
            or "Medical staff could not be deleted.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        ) from error
