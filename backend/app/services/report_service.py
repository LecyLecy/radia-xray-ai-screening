from datetime import datetime, timezone
from io import BytesIO

from fastapi import status
from postgrest.exceptions import APIError
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer

from app.config import STORAGE_BUCKET_REPORT
from app.schemas.report_schema import ReportDownloadResponse, ReportResponse
from app.schemas.user_schema import CurrentUserResponse
from app.services.ai_service import MEDICAL_AI_DISCLAIMER
from app.services.supabase_service import get_supabase_client


class ReportServiceError(Exception):
    def __init__(self, message: str, status_code: int) -> None:
        self.message = message
        self.status_code = status_code
        super().__init__(message)


def _read_error_message(error: Exception) -> str:
    if isinstance(error, APIError):
        return error.message
    return str(error)


def _single_or_not_found(response_data, message: str) -> dict:
    if not response_data:
        raise ReportServiceError(message=message, status_code=status.HTTP_404_NOT_FOUND)
    if isinstance(response_data, list):
        return response_data[0]
    return response_data


def _get_single(table_name: str, row_id: str, message: str) -> dict:
    supabase = get_supabase_client()
    try:
        response = supabase.table(table_name).select("*").eq("id", row_id).single().execute()
    except Exception as error:
        raise ReportServiceError(
            message=message,
            status_code=status.HTTP_404_NOT_FOUND,
        ) from error

    return _single_or_not_found(response.data, message)


def _get_latest(table_name: str, column_name: str, value: str, order_column: str) -> dict:
    supabase = get_supabase_client()
    try:
        response = (
            supabase.table(table_name)
            .select("*")
            .eq(column_name, value)
            .order(order_column, desc=True)
            .limit(1)
            .execute()
        )
    except Exception as error:
        raise ReportServiceError(
            message=_read_error_message(error) or f"{table_name} could not be loaded.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        ) from error

    if not response.data:
        raise ReportServiceError(
            message=f"Required {table_name} data was not found for this examination.",
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    return response.data[0]


def _get_patient_profile(patient_id: str) -> dict:
    return _get_single("patient_profiles", patient_id, "Patient profile was not found.")


def _get_doctor_profile(examination: dict, current_user: CurrentUserResponse) -> dict | None:
    supabase = get_supabase_client()
    doctor_id = examination.get("doctor_id")

    try:
        if doctor_id:
            response = (
                supabase.table("doctor_profiles")
                .select("*")
                .eq("id", doctor_id)
                .limit(1)
                .execute()
            )
        elif current_user.role == "doctor":
            response = (
                supabase.table("doctor_profiles")
                .select("*")
                .eq("user_id", current_user.user_id)
                .limit(1)
                .execute()
            )
        else:
            return None
    except Exception as error:
        raise ReportServiceError(
            message=_read_error_message(error) or "Doctor profile could not be loaded.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        ) from error

    return response.data[0] if response.data else None


def _require_doctor_owns_examination(
    examination: dict,
    current_user: CurrentUserResponse,
) -> None:
    if current_user.role != "doctor":
        return

    supabase = get_supabase_client()
    try:
        response = (
            supabase.table("doctor_profiles")
            .select("id")
            .eq("user_id", current_user.user_id)
            .limit(1)
            .execute()
        )
    except Exception as error:
        raise ReportServiceError(
            message=_read_error_message(error) or "Doctor profile could not be loaded.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        ) from error

    doctor_id = response.data[0]["id"] if response.data else None
    if not doctor_id or doctor_id != examination.get("doctor_id"):
        raise ReportServiceError(
            message="Doctor users can only generate reports for their own examinations.",
            status_code=status.HTTP_403_FORBIDDEN,
        )


def _require_review_ready(examination: dict, feedback: dict) -> None:
    if not (examination.get("final_doctor_note") or examination.get("doctor_note") or "").strip():
        raise ReportServiceError(
            message="Final doctor note is required before generating a report.",
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    if not examination.get("final_diagnosis_result"):
        raise ReportServiceError(
            message="Final diagnosis is required before generating a report.",
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    if not feedback:
        raise ReportServiceError(
            message="Doctor feedback is required before generating a report.",
            status_code=status.HTTP_400_BAD_REQUEST,
        )


def _line(label: str, value) -> str:
    rendered_value = value if value not in {None, ""} else "-"
    return f"<b>{label}:</b> {rendered_value}"


def _build_report_pdf(
    examination: dict,
    patient: dict,
    doctor: dict | None,
    xray_image: dict,
) -> bytes:
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, title="Radia X-Ray Examination Report")
    styles = getSampleStyleSheet()
    story = []

    def add_heading(text: str) -> None:
        story.append(Spacer(1, 10))
        story.append(Paragraph(text, styles["Heading2"]))

    def add_line(label: str, value) -> None:
        story.append(Paragraph(_line(label, value), styles["BodyText"]))

    story.append(Paragraph("Radia X-Ray Examination Report", styles["Title"]))
    story.append(
        Paragraph(
            "AI-assisted screening report for clinical decision support.",
            styles["BodyText"],
        )
    )

    add_heading("Patient Information")
    add_line("Full Name", patient.get("full_name"))
    add_line("Email", patient.get("email"))
    add_line("Phone Number", patient.get("phone_number"))
    add_line("Age", patient.get("age"))
    add_line("Gender", patient.get("gender"))

    add_heading("Doctor Information")
    add_line("Full Name", doctor.get("full_name") if doctor else None)
    add_line("Email", doctor.get("email") if doctor else None)
    add_line("Phone Number", doctor.get("phone_number") if doctor else None)
    add_line("Specialization", doctor.get("specialization") if doctor else None)
    add_line("License Number", doctor.get("license_number") if doctor else None)

    add_heading("Examination Information")
    add_line("Examination Date", examination.get("examination_date"))
    report_status = (
        "ready" if examination.get("status") in {"ready", "report_ready"} else "not_ready"
    )
    add_line("Status", report_status)
    add_line("X-Ray File", xray_image.get("file_name"))
    add_line("X-Ray Storage Path", xray_image.get("image_url"))

    add_heading("Doctor Review")
    add_line("Final Diagnosis", examination.get("final_diagnosis_result"))
    add_line(
        "Final Doctor Note",
        examination.get("final_doctor_note") or examination.get("doctor_note"),
    )

    add_heading("Medical Disclaimer")
    story.append(Paragraph(MEDICAL_AI_DISCLAIMER, styles["BodyText"]))

    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()


def _upload_report_pdf(examination_id: str, pdf_bytes: bytes) -> str:
    supabase = get_supabase_client()
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
    object_path = f"reports/{examination_id}/{timestamp}_radia_report.pdf"

    try:
        supabase.storage.from_(STORAGE_BUCKET_REPORT).upload(
            path=object_path,
            file=pdf_bytes,
            file_options={
                "content-type": "application/pdf",
                "upsert": "true",
            },
        )
    except Exception as error:
        raise ReportServiceError(
            message=_read_error_message(error) or "PDF report could not be uploaded.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        ) from error

    return object_path


def generate_examination_report(
    examination_id: str,
    current_user: CurrentUserResponse,
) -> ReportResponse:
    supabase = get_supabase_client()
    examination = _get_single("examinations", examination_id, "Examination was not found.")
    _require_doctor_owns_examination(examination, current_user)
    patient = _get_patient_profile(examination["patient_id"])
    doctor = _get_doctor_profile(examination, current_user)
    xray_image = _get_latest("xray_images", "examination_id", examination_id, "uploaded_at")
    prediction = _get_latest("ai_predictions", "examination_id", examination_id, "created_at")
    feedback = _get_latest("doctor_feedbacks", "examination_id", examination_id, "created_at")
    _require_review_ready(examination, feedback)

    pdf_bytes = _build_report_pdf(
        examination=examination,
        patient=patient,
        doctor=doctor,
        xray_image=xray_image,
    )
    report_url = _upload_report_pdf(examination_id, pdf_bytes)

    report_row = {
        "examination_id": examination_id,
        "report_url": report_url,
        "generated_by_user_id": current_user.user_id,
    }

    try:
        existing_report = (
            supabase.table("pdf_reports")
            .select("id")
            .eq("examination_id", examination_id)
            .limit(1)
            .execute()
        )

        if existing_report.data:
            report_response = (
                supabase.table("pdf_reports")
                .update(report_row)
                .eq("id", existing_report.data[0]["id"])
                .execute()
            )
        else:
            report_response = supabase.table("pdf_reports").insert(report_row).execute()
    except Exception as error:
        raise ReportServiceError(
            message=_read_error_message(error) or "PDF report metadata could not be saved.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        ) from error

    if not report_response.data:
        raise ReportServiceError(
            message="PDF report metadata could not be saved.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    try:
        supabase.table("examinations").update({"status": "ready"}).eq(
            "id", examination_id
        ).execute()
    except Exception as error:
        raise ReportServiceError(
            message=_read_error_message(error) or "Examination status could not be updated.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        ) from error

    return ReportResponse(**report_response.data[0])


def _create_signed_report_url(report_url: str) -> str:
    supabase = get_supabase_client()

    try:
        signed_response = supabase.storage.from_(STORAGE_BUCKET_REPORT).create_signed_url(
            report_url,
            60 * 10,
        )
    except Exception as error:
        raise ReportServiceError(
            message=_read_error_message(error) or "Report download URL could not be created.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        ) from error

    if isinstance(signed_response, dict):
        signed_url = signed_response.get("signedURL") or signed_response.get("signed_url")
    else:
        signed_url = getattr(signed_response, "signed_url", None) or getattr(
            signed_response, "signedURL", None
        )

    if not signed_url:
        raise ReportServiceError(
            message="Report download URL could not be created.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return signed_url


def get_report_download(
    report_id: str,
    current_user: CurrentUserResponse,
) -> ReportDownloadResponse:
    supabase = get_supabase_client()
    report = _get_single("pdf_reports", report_id, "PDF report was not found.")
    examination = _get_single(
        "examinations",
        report["examination_id"],
        "Examination was not found.",
    )

    if current_user.role == "patient":
        try:
            patient_response = (
                supabase.table("patient_profiles")
                .select("id")
                .eq("user_id", current_user.user_id)
                .limit(1)
                .execute()
            )
        except Exception as error:
            raise ReportServiceError(
                message=_read_error_message(error) or "Patient profile could not be loaded.",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            ) from error

        patient_id = patient_response.data[0]["id"] if patient_response.data else None
        if patient_id != examination.get("patient_id"):
            raise ReportServiceError(
                message="Patient users can only download their own reports.",
                status_code=status.HTTP_403_FORBIDDEN,
            )
    elif current_user.role not in {"doctor", "admin"}:
        raise ReportServiceError(
            message="User role is not allowed to download this report.",
            status_code=status.HTTP_403_FORBIDDEN,
        )

    return ReportDownloadResponse(
        report_id=report["id"],
        report_url=report["report_url"],
        download_url=_create_signed_report_url(report["report_url"]),
    )
