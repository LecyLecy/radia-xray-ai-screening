from datetime import datetime, timezone

from fastapi import UploadFile, status
from postgrest.exceptions import APIError

from app.schemas.examination_schema import (
    CreateExaminationRequest,
    DoctorFeedbackRequest,
    DoctorFeedbackResponse,
    ExaminationResponse,
    StoredAIPredictionResponse,
    UpdateDoctorNoteRequest,
)
from app.schemas.user_schema import CurrentUserResponse, PatientProfileResponse
from app.services.ai_service import create_mock_prediction
from app.services.supabase_service import get_supabase_client
from app.services.storage_service import (
    StorageServiceError,
    read_valid_xray_upload,
    upload_xray_image,
)


class ExaminationServiceError(Exception):
    def __init__(self, message: str, status_code: int) -> None:
        self.message = message
        self.status_code = status_code
        super().__init__(message)


def _read_error_message(error: Exception) -> str:
    if isinstance(error, APIError):
        return error.message
    return str(error)


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
        raise ExaminationServiceError(
            message=_read_error_message(error) or "Patients could not be loaded.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        ) from error

    return [PatientProfileResponse(**row) for row in response.data or []]


def get_patient_by_id(patient_id: str) -> PatientProfileResponse:
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
        raise ExaminationServiceError(
            message="Patient was not found.",
            status_code=status.HTTP_404_NOT_FOUND,
        ) from error

    if not response.data:
        raise ExaminationServiceError(
            message="Patient was not found.",
            status_code=status.HTTP_404_NOT_FOUND,
        )

    return PatientProfileResponse(**response.data)


def get_examination_by_id(examination_id: str) -> dict:
    supabase = get_supabase_client()

    try:
        response = (
            supabase.table("examinations")
            .select("id")
            .eq("id", examination_id)
            .single()
            .execute()
        )
    except Exception as error:
        raise ExaminationServiceError(
            message="Examination was not found.",
            status_code=status.HTTP_404_NOT_FOUND,
        ) from error

    if not response.data:
        raise ExaminationServiceError(
            message="Examination was not found.",
            status_code=status.HTTP_404_NOT_FOUND,
        )

    return response.data


def _get_doctor_profile_id(user_id: str) -> str | None:
    supabase = get_supabase_client()

    try:
        response = (
            supabase.table("doctor_profiles")
            .select("id")
            .eq("user_id", user_id)
            .limit(1)
            .execute()
        )
    except Exception:
        return None

    if not response.data:
        return None

    return response.data[0].get("id")


def _get_doctor_profile_id_or_none(current_user: CurrentUserResponse) -> str | None:
    if current_user.role != "doctor":
        return None

    return _get_doctor_profile_id(current_user.user_id)


def create_examination(
    payload: CreateExaminationRequest,
    current_user: CurrentUserResponse,
) -> ExaminationResponse:
    supabase = get_supabase_client()
    get_patient_by_id(payload.patient_id)

    doctor_id = _get_doctor_profile_id_or_none(current_user)

    examination_date = payload.examination_date or datetime.now(timezone.utc)
    row = {
        "patient_id": payload.patient_id,
        "doctor_id": doctor_id,
        "created_by_user_id": current_user.user_id,
        "examination_date": examination_date.isoformat(),
        "status": "pending_review",
        "doctor_note": None,
    }

    try:
        response = supabase.table("examinations").insert(row).execute()
    except Exception as error:
        raise ExaminationServiceError(
            message=_read_error_message(error) or "Examination could not be created.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        ) from error

    if not response.data:
        raise ExaminationServiceError(
            message="Examination could not be created.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return ExaminationResponse(**response.data[0])


async def create_stored_mock_prediction(
    examination_id: str,
    xray_image: UploadFile,
    current_user: CurrentUserResponse,
) -> StoredAIPredictionResponse:
    get_examination_by_id(examination_id)

    try:
        upload_data = await read_valid_xray_upload(xray_image)
        image_url = upload_xray_image(examination_id, upload_data)
    except StorageServiceError as error:
        raise ExaminationServiceError(
            message=error.message,
            status_code=error.status_code,
        ) from error

    supabase = get_supabase_client()
    xray_row = {
        "examination_id": examination_id,
        "image_url": image_url,
        "file_name": upload_data.filename,
        "file_type": upload_data.content_type,
        "uploaded_by_user_id": current_user.user_id,
    }

    try:
        xray_response = supabase.table("xray_images").insert(xray_row).execute()
    except Exception as error:
        raise ExaminationServiceError(
            message=_read_error_message(error) or "X-Ray image metadata could not be saved.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        ) from error

    if not xray_response.data:
        raise ExaminationServiceError(
            message="X-Ray image metadata could not be saved.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    prediction = await create_mock_prediction(
        xray_image=xray_image,
        examination_id=examination_id,
        file_bytes=upload_data.content,
    )
    prediction_row = {
        "examination_id": examination_id,
        "prediction_result": prediction.prediction_result,
        "confidence_score": prediction.confidence_score,
        "confidence_percentage": prediction.confidence_percentage,
        "gradcam_url": None,
        "model_name": prediction.model_name,
    }

    try:
        prediction_response = (
            supabase.table("ai_predictions").insert(prediction_row).execute()
        )
    except Exception as error:
        raise ExaminationServiceError(
            message=_read_error_message(error) or "AI prediction could not be saved.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        ) from error

    if not prediction_response.data:
        raise ExaminationServiceError(
            message="AI prediction could not be saved.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    prediction_payload = (
        prediction.model_dump() if hasattr(prediction, "model_dump") else prediction.dict()
    )

    return StoredAIPredictionResponse(
        **prediction_payload,
        xray_image_id=xray_response.data[0]["id"],
        ai_prediction_id=prediction_response.data[0]["id"],
        image_url=image_url,
    )


def update_doctor_note(
    examination_id: str,
    payload: UpdateDoctorNoteRequest,
) -> ExaminationResponse:
    get_examination_by_id(examination_id)
    supabase = get_supabase_client()

    try:
        response = (
            supabase.table("examinations")
            .update({"doctor_note": payload.doctor_note})
            .eq("id", examination_id)
            .execute()
        )
    except Exception as error:
        raise ExaminationServiceError(
            message=_read_error_message(error) or "Doctor note could not be saved.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        ) from error

    if not response.data:
        raise ExaminationServiceError(
            message="Doctor note could not be saved.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return ExaminationResponse(**response.data[0])


def save_doctor_feedback(
    examination_id: str,
    payload: DoctorFeedbackRequest,
    current_user: CurrentUserResponse,
) -> DoctorFeedbackResponse:
    get_examination_by_id(examination_id)
    supabase = get_supabase_client()
    doctor_id = _get_doctor_profile_id_or_none(current_user)

    feedback_row = {
        "examination_id": examination_id,
        "doctor_id": doctor_id,
        "feedback_status": payload.feedback_status,
        "feedback_note": payload.feedback_note,
    }

    try:
        existing_response = (
            supabase.table("doctor_feedbacks")
            .select("id")
            .eq("examination_id", examination_id)
            .limit(1)
            .execute()
        )
    except Exception as error:
        raise ExaminationServiceError(
            message=_read_error_message(error) or "Doctor feedback could not be loaded.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        ) from error

    try:
        if existing_response.data:
            feedback_response = (
                supabase.table("doctor_feedbacks")
                .update(feedback_row)
                .eq("id", existing_response.data[0]["id"])
                .execute()
            )
        else:
            feedback_response = (
                supabase.table("doctor_feedbacks").insert(feedback_row).execute()
            )
    except Exception as error:
        raise ExaminationServiceError(
            message=_read_error_message(error) or "Doctor feedback could not be saved.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        ) from error

    if not feedback_response.data:
        raise ExaminationServiceError(
            message="Doctor feedback could not be saved.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    try:
        supabase.table("examinations").update({"status": "reviewed"}).eq(
            "id", examination_id
        ).execute()
    except Exception as error:
        raise ExaminationServiceError(
            message=_read_error_message(error) or "Examination status could not be updated.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        ) from error

    return DoctorFeedbackResponse(**feedback_response.data[0])
