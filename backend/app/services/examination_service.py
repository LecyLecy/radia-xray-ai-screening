from datetime import datetime, timezone

from fastapi import UploadFile, status
from postgrest.exceptions import APIError

from app.schemas.examination_schema import (
    CreateExaminationRequest,
    DoctorExaminationDetailResponse,
    DoctorExaminationSummary,
    DoctorFeedbackRequest,
    DoctorFeedbackResponse,
    ExaminationResponse,
    FinalDoctorReviewRequest,
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
    create_xray_signed_url,
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


def _public_examination_status(status_value: str | None, report: dict | None = None) -> str:
    if report or status_value in {"ready", "report_ready"}:
        return "ready"
    return "not_ready"


def _with_public_status(row: dict, report: dict | None = None) -> dict:
    return {
        **row,
        "status": _public_examination_status(row.get("status"), report),
    }


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


def search_patients(email: str) -> list[PatientProfileResponse]:
    supabase = get_supabase_client()
    normalized_email = email.strip()
    if not normalized_email:
        raise ExaminationServiceError(
            message="Email search query is required.",
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    try:
        response = (
            supabase.table("patient_profiles")
            .select("id,user_id,email,full_name,phone_number,age,gender,profile_picture_url")
            .ilike("email", f"%{normalized_email}%")
            .order("email")
            .limit(10)
            .execute()
        )
    except Exception as error:
        raise ExaminationServiceError(
            message=_read_error_message(error) or "Patients could not be searched.",
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


def get_patient_by_email(patient_email: str) -> PatientProfileResponse:
    supabase = get_supabase_client()
    normalized_email = patient_email.strip().lower()
    if not normalized_email:
        raise ExaminationServiceError(
            message="Patient email is required.",
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    try:
        response = (
            supabase.table("patient_profiles")
            .select("id,user_id,email,full_name,phone_number,age,gender,profile_picture_url")
            .ilike("email", normalized_email)
            .limit(1)
            .execute()
        )
    except Exception as error:
        raise ExaminationServiceError(
            message=_read_error_message(error) or "Patient could not be loaded.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        ) from error

    if not response.data:
        raise ExaminationServiceError(
            message="Registered patient email was not found.",
            status_code=status.HTTP_404_NOT_FOUND,
        )

    return PatientProfileResponse(**response.data[0])


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


def _get_examination_for_doctor_or_admin(
    examination_id: str,
    current_user: CurrentUserResponse,
) -> dict:
    supabase = get_supabase_client()

    try:
        query = supabase.table("examinations").select("*").eq("id", examination_id)
        if current_user.role == "doctor":
            doctor_id = _get_doctor_profile_id(current_user.user_id)
            if not doctor_id:
                raise ExaminationServiceError(
                    message="Doctor profile was not found.",
                    status_code=status.HTTP_404_NOT_FOUND,
                )
            query = query.eq("doctor_id", doctor_id)
        response = query.single().execute()
    except ExaminationServiceError:
        raise
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


def _patient_xray_summary(row: dict | None) -> PatientXraySummary | None:
    if not row:
        return None

    return PatientXraySummary(
        **row,
        image_download_url=create_xray_signed_url(row.get("image_url")),
    )


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


def _patient_profiles_by_id(patient_ids: list[str]) -> dict[str, dict]:
    if not patient_ids:
        return {}

    supabase = get_supabase_client()
    try:
        response = (
            supabase.table("patient_profiles")
            .select("id,user_id,email,full_name,phone_number,age,gender,profile_picture_url")
            .in_("id", patient_ids)
            .execute()
        )
    except Exception as error:
        raise ExaminationServiceError(
            message=_read_error_message(error) or "Patient profiles could not be loaded.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        ) from error

    return {row["id"]: row for row in response.data or []}


def list_doctor_examinations(
    current_user: CurrentUserResponse,
) -> list[DoctorExaminationSummary]:
    supabase = get_supabase_client()

    try:
        query = supabase.table("examinations").select("*")
        if current_user.role == "doctor":
            doctor_id = _get_doctor_profile_id(current_user.user_id)
            if not doctor_id:
                raise ExaminationServiceError(
                    message="Doctor profile was not found.",
                    status_code=status.HTTP_404_NOT_FOUND,
                )
            query = query.eq("doctor_id", doctor_id)
        response = query.order("examination_date", desc=True).execute()
    except ExaminationServiceError:
        raise
    except Exception as error:
        raise ExaminationServiceError(
            message=_read_error_message(error) or "Examinations could not be loaded.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        ) from error

    examinations = response.data or []
    examination_ids = [row["id"] for row in examinations]
    patient_ids = list({row["patient_id"] for row in examinations if row.get("patient_id")})
    patients = _patient_profiles_by_id(patient_ids)
    predictions = _latest_related_rows("ai_predictions", examination_ids, "created_at")
    reports = _latest_related_rows("pdf_reports", examination_ids, "generated_at")

    return [
        DoctorExaminationSummary(
            id=examination["id"],
            patient_id=examination["patient_id"],
            patient_name=patients.get(examination.get("patient_id") or "", {}).get(
                "full_name"
            ),
            patient_email=patients.get(examination.get("patient_id") or "", {}).get(
                "email"
            ),
            examination_date=examination["examination_date"],
            status=_public_examination_status(
                examination.get("status"),
                reports.get(examination["id"]),
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
    reports = _latest_related_rows("pdf_reports", examination_ids, "generated_at")

    return [
        PatientExaminationHistoryItem(
            id=examination["id"],
            examination_date=examination["examination_date"],
            status=_public_examination_status(
                examination.get("status"),
                reports.get(examination["id"]),
            ),
            doctor_name=doctors.get(examination.get("doctor_id") or "", {}).get(
                "full_name"
            ),
            final_diagnosis_result=(
                examination.get("final_diagnosis_result")
                if _public_examination_status(
                    examination.get("status"),
                    reports.get(examination["id"]),
                )
                == "ready"
                else None
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
    feedback = _latest_related_rows("doctor_feedbacks", examination_ids, "created_at").get(
        examination_id
    )
    report = _latest_related_rows("pdf_reports", examination_ids, "generated_at").get(
        examination_id
    )
    doctor = doctors.get(examination.get("doctor_id") or "")
    is_finalized = _public_examination_status(examination.get("status"), report) == "ready"

    return PatientExaminationDetailResponse(
        id=examination["id"],
        patient_id=examination["patient_id"],
        doctor_id=examination.get("doctor_id"),
        created_by_user_id=examination["created_by_user_id"],
        examination_date=examination["examination_date"],
        status=_public_examination_status(examination.get("status"), report),
        doctor_note=examination.get("doctor_note") if is_finalized else None,
        symptoms_description=examination.get("symptoms_description"),
        preliminary_solution=examination.get("preliminary_solution"),
        final_diagnosis_result=(
            examination.get("final_diagnosis_result") if is_finalized else None
        ),
        final_doctor_note=examination.get("final_doctor_note") if is_finalized else None,
        doctor=PatientDoctorSummary(**doctor) if doctor else None,
        xray_image=_patient_xray_summary(xray_image),
        ai_prediction=None,
        doctor_feedback=None,
        report=PatientReportSummary(**report) if report else None,
        disclaimer=MEDICAL_AI_DISCLAIMER,
    )


def get_doctor_examination_detail(
    examination_id: str,
    current_user: CurrentUserResponse,
) -> DoctorExaminationDetailResponse:
    examination = _get_examination_for_doctor_or_admin(examination_id, current_user)
    examination_ids = [examination_id]
    patient = _patient_profiles_by_id([examination["patient_id"]]).get(
        examination["patient_id"]
    )
    doctors = _doctor_profiles_by_id(
        [examination["doctor_id"]] if examination.get("doctor_id") else []
    )
    doctor = doctors.get(examination.get("doctor_id") or "")
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

    return DoctorExaminationDetailResponse(
        id=examination["id"],
        patient_id=examination["patient_id"],
        doctor_id=examination.get("doctor_id"),
        created_by_user_id=examination["created_by_user_id"],
        examination_date=examination["examination_date"],
        status=_public_examination_status(examination.get("status"), report),
        doctor_note=examination.get("doctor_note"),
        symptoms_description=examination.get("symptoms_description"),
        preliminary_solution=examination.get("preliminary_solution"),
        final_diagnosis_result=examination.get("final_diagnosis_result"),
        final_doctor_note=examination.get("final_doctor_note"),
        patient=PatientProfileResponse(**patient) if patient else None,
        doctor=PatientDoctorSummary(**doctor) if doctor else None,
        xray_image=_patient_xray_summary(xray_image),
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
        "status": "not_ready",
        "doctor_note": None,
        "symptoms_description": None,
        "preliminary_solution": None,
        "final_diagnosis_result": None,
        "final_doctor_note": None,
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

    return ExaminationResponse(**_with_public_status(response.data[0]))


async def start_doctor_examination(
    patient_email: str,
    symptoms_description: str,
    preliminary_solution: str,
    xray_image: UploadFile,
    current_user: CurrentUserResponse,
) -> StoredAIPredictionResponse:
    if current_user.role != "doctor":
        raise ExaminationServiceError(
            message="Only doctor users can start a patient examination.",
            status_code=status.HTTP_403_FORBIDDEN,
        )

    patient = get_patient_by_email(patient_email)
    doctor_id = _get_doctor_profile_id(current_user.user_id)
    if not doctor_id:
        raise ExaminationServiceError(
            message="Doctor profile was not found.",
            status_code=status.HTTP_404_NOT_FOUND,
        )

    cleaned_symptoms = symptoms_description.strip()
    cleaned_preliminary_solution = preliminary_solution.strip()
    if not cleaned_symptoms or not cleaned_preliminary_solution:
        raise ExaminationServiceError(
            message="Symptoms and preliminary solution are required.",
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    supabase = get_supabase_client()
    examination_date = datetime.now(timezone.utc)
    row = {
        "patient_id": patient.id,
        "doctor_id": doctor_id,
        "created_by_user_id": current_user.user_id,
        "examination_date": examination_date.isoformat(),
        "status": "not_ready",
        "doctor_note": None,
        "symptoms_description": cleaned_symptoms,
        "preliminary_solution": cleaned_preliminary_solution,
        "final_diagnosis_result": None,
        "final_doctor_note": None,
    }

    try:
        response = supabase.table("examinations").insert(row).execute()
    except Exception as error:
        raise ExaminationServiceError(
            message=_read_error_message(error) or "Examination could not be started.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        ) from error

    if not response.data:
        raise ExaminationServiceError(
            message="Examination could not be started.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return await create_stored_mock_prediction(
        examination_id=response.data[0]["id"],
        xray_image=xray_image,
        current_user=current_user,
    )


async def create_stored_mock_prediction(
    examination_id: str,
    xray_image: UploadFile,
    current_user: CurrentUserResponse,
) -> StoredAIPredictionResponse:
    _get_examination_for_doctor_or_admin(examination_id, current_user)

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
    current_user: CurrentUserResponse,
) -> ExaminationResponse:
    _get_examination_for_doctor_or_admin(examination_id, current_user)
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

    return ExaminationResponse(**_with_public_status(response.data[0]))


def save_doctor_feedback(
    examination_id: str,
    payload: DoctorFeedbackRequest,
    current_user: CurrentUserResponse,
) -> DoctorFeedbackResponse:
    examination = _get_examination_for_doctor_or_admin(examination_id, current_user)
    supabase = get_supabase_client()
    doctor_id = examination.get("doctor_id")

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
        supabase.table("examinations").update({"status": "not_ready"}).eq(
            "id", examination_id
        ).execute()
    except Exception as error:
        raise ExaminationServiceError(
            message=_read_error_message(error) or "Examination status could not be updated.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        ) from error

    return DoctorFeedbackResponse(**feedback_response.data[0])


def save_final_doctor_review(
    examination_id: str,
    payload: FinalDoctorReviewRequest,
    current_user: CurrentUserResponse,
) -> ExaminationResponse:
    examination = _get_examination_for_doctor_or_admin(examination_id, current_user)
    supabase = get_supabase_client()
    doctor_id = examination.get("doctor_id")

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

        if existing_response.data:
            supabase.table("doctor_feedbacks").update(feedback_row).eq(
                "id", existing_response.data[0]["id"]
            ).execute()
        else:
            supabase.table("doctor_feedbacks").insert(feedback_row).execute()

        response = (
            supabase.table("examinations")
            .update(
                {
                    "final_diagnosis_result": payload.final_diagnosis_result,
                    "final_doctor_note": payload.final_doctor_note,
                    "doctor_note": payload.final_doctor_note,
                    "status": "not_ready",
                }
            )
            .eq("id", examination_id)
            .execute()
        )
    except Exception as error:
        raise ExaminationServiceError(
            message=_read_error_message(error) or "Final review could not be saved.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        ) from error

    if not response.data:
        raise ExaminationServiceError(
            message="Final review could not be saved.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return ExaminationResponse(**_with_public_status(response.data[0]))
