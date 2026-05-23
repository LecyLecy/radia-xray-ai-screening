from datetime import datetime, timezone

from fastapi import UploadFile, status
from postgrest.exceptions import APIError

from app.schemas.examination_schema import (
    CreateExaminationRequest,
    DoctorFeedbackRequest,
    DoctorFeedbackResponse,
    ExaminationResponse,
    PatientDoctorSummary,
    PatientExaminationDetailResponse,
    PatientExaminationHistoryItem,
    PatientFeedbackSummary,
    PatientPredictionSummary,
    PatientReportSummary,
    PatientXraySummary,
    StoredAIPredictionResponse,
    UpdateDoctorNoteRequest,
)
from app.schemas.user_schema import CurrentUserResponse, PatientProfileResponse
from app.services.ai_service import MEDICAL_AI_DISCLAIMER, create_mock_prediction
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


def _get_current_patient_profile_id(current_user: CurrentUserResponse) -> str:
    supabase = get_supabase_client()

    try:
        role_response = (
            supabase.table("profiles")
            .select("role")
            .eq("user_id", current_user.user_id)
            .single()
            .execute()
        )
    except Exception as error:
        raise ExaminationServiceError(
            message=_read_error_message(error) or "User role could not be loaded.",
            status_code=status.HTTP_404_NOT_FOUND,
        ) from error

    role = role_response.data.get("role") if role_response.data else None
    if role != "patient":
        raise ExaminationServiceError(
            message="Only patient users can access patient examination records.",
            status_code=status.HTTP_403_FORBIDDEN,
        )

    try:
        patient_response = (
            supabase.table("patient_profiles")
            .select("id")
            .eq("user_id", current_user.user_id)
            .single()
            .execute()
        )
    except Exception as error:
        raise ExaminationServiceError(
            message=_read_error_message(error) or "Patient profile was not found.",
            status_code=status.HTTP_404_NOT_FOUND,
        ) from error

    patient_id = patient_response.data.get("id") if patient_response.data else None
    if not patient_id:
        raise ExaminationServiceError(
            message="Patient profile was not found.",
            status_code=status.HTTP_404_NOT_FOUND,
        )

    return patient_id


def _latest_related_rows(
    table_name: str,
    examination_ids: list[str],
    order_column: str,
) -> dict[str, dict]:
    if not examination_ids:
        return {}

    supabase = get_supabase_client()
    try:
        response = (
            supabase.table(table_name)
            .select("*")
            .in_("examination_id", examination_ids)
            .order(order_column, desc=True)
            .execute()
        )
    except Exception as error:
        raise ExaminationServiceError(
            message=_read_error_message(error) or f"{table_name} data could not be loaded.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        ) from error

    latest_by_examination: dict[str, dict] = {}
    for row in response.data or []:
        examination_id = row.get("examination_id")
        if examination_id and examination_id not in latest_by_examination:
            latest_by_examination[examination_id] = row

    return latest_by_examination


def _doctor_profiles_by_id(doctor_ids: list[str]) -> dict[str, dict]:
    if not doctor_ids:
        return {}

    supabase = get_supabase_client()
    try:
        response = (
            supabase.table("doctor_profiles")
            .select("id,email,full_name,specialization")
            .in_("id", doctor_ids)
            .execute()
        )
    except Exception as error:
        raise ExaminationServiceError(
            message=_read_error_message(error) or "Doctor profiles could not be loaded.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        ) from error

    return {row["id"]: row for row in response.data or []}


def list_current_patient_examinations(
    current_user: CurrentUserResponse,
) -> list[PatientExaminationHistoryItem]:
    patient_id = _get_current_patient_profile_id(current_user)
    supabase = get_supabase_client()

    try:
        response = (
            supabase.table("examinations")
            .select("*")
            .eq("patient_id", patient_id)
            .order("examination_date", desc=True)
            .execute()
        )
    except Exception as error:
        raise ExaminationServiceError(
            message=_read_error_message(error) or "Patient examinations could not be loaded.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        ) from error

    examinations = response.data or []
    examination_ids = [row["id"] for row in examinations]
    doctor_ids = list({row["doctor_id"] for row in examinations if row.get("doctor_id")})
    doctors = _doctor_profiles_by_id(doctor_ids)
    predictions = _latest_related_rows("ai_predictions", examination_ids, "created_at")
    reports = _latest_related_rows("pdf_reports", examination_ids, "generated_at")

    return [
        PatientExaminationHistoryItem(
            id=examination["id"],
            examination_date=examination["examination_date"],
            status=examination["status"],
            doctor_name=doctors.get(examination.get("doctor_id") or "", {}).get(
                "full_name"
            ),
            prediction_result=predictions.get(examination["id"], {}).get(
                "prediction_result"
            ),
            confidence_percentage=predictions.get(examination["id"], {}).get(
                "confidence_percentage"
            ),
            report_id=reports.get(examination["id"], {}).get("id"),
        )
        for examination in examinations
    ]


def get_current_patient_examination_detail(
    examination_id: str,
    current_user: CurrentUserResponse,
) -> PatientExaminationDetailResponse:
    patient_id = _get_current_patient_profile_id(current_user)
    supabase = get_supabase_client()

    try:
        response = (
            supabase.table("examinations")
            .select("*")
            .eq("id", examination_id)
            .eq("patient_id", patient_id)
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

    examination = response.data
    examination_ids = [examination_id]
    doctors = _doctor_profiles_by_id(
        [examination["doctor_id"]] if examination.get("doctor_id") else []
    )
    xray_image = _latest_related_rows("xray_images", examination_ids, "uploaded_at").get(
        examination_id
    )
    prediction = _latest_related_rows("ai_predictions", examination_ids, "created_at").get(
        examination_id
    )
    feedback = _latest_related_rows("doctor_feedbacks", examination_ids, "created_at").get(
        examination_id
    )
    report = _latest_related_rows("pdf_reports", examination_ids, "generated_at").get(
        examination_id
    )
    doctor = doctors.get(examination.get("doctor_id") or "")

    return PatientExaminationDetailResponse(
        id=examination["id"],
        patient_id=examination["patient_id"],
        doctor_id=examination.get("doctor_id"),
        created_by_user_id=examination["created_by_user_id"],
        examination_date=examination["examination_date"],
        status=examination["status"],
        doctor_note=examination.get("doctor_note"),
        doctor=PatientDoctorSummary(**doctor) if doctor else None,
        xray_image=PatientXraySummary(**xray_image) if xray_image else None,
        ai_prediction=PatientPredictionSummary(**prediction) if prediction else None,
        doctor_feedback=PatientFeedbackSummary(**feedback) if feedback else None,
        report=PatientReportSummary(**report) if report else None,
        disclaimer=MEDICAL_AI_DISCLAIMER,
    )


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
