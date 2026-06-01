# API Contract

Base local backend URL:

```text
http://127.0.0.1:8000
```

Authenticated endpoints require:

```text
Authorization: Bearer <access_token>
```

Frontend must call FastAPI only. It must not call Supabase Auth, database tables, storage, or the AI model directly.

## Shared Values

```text
roles: patient, doctor, admin
gender: male, female
prediction_result: Normal, Pneumonia
feedback_status: correct, incorrect, uncertain
examination_status: not_ready, ready
```

## Health

### `GET /health`

Returns:

```json
{ "status": "ok" }
```

## Auth

### `POST /auth/register/patient`

Request:

```json
{
  "email": "patient@example.com",
  "password": "Secret123",
  "full_name": "Patient Name",
  "phone_number": "08123456789",
  "age": 20,
  "gender": "female"
}
```

Response:

```json
{
  "user_id": "uuid",
  "email": "patient@example.com",
  "role": "patient"
}
```

### `POST /auth/login`

Request:

```json
{
  "email": "user@example.com",
  "password": "Secret123"
}
```

Response:

```json
{
  "access_token": "jwt",
  "refresh_token": "token",
  "token_type": "bearer",
  "user": {
    "user_id": "uuid",
    "email": "user@example.com",
    "role": "doctor"
  }
}
```

## Users and Patients

### `GET /users/me/profile`

Returns shared navbar profile data for the logged-in user.

### `GET /patients/me`

Returns current patient profile.

### `PATCH /patients/me`

Updates current patient profile fields:

```json
{
  "full_name": "Patient Name",
  "phone_number": "08123456789",
  "age": 20,
  "gender": "female"
}
```

### `POST /patients/me/profile-picture`

Multipart field:

```text
profile_picture
```

Allowed: JPG, PNG, WEBP up to 2 MB.

### `GET /patients/me/examinations`

Returns only the current patient's examination history:

```json
[
  {
    "id": "examination_uuid",
    "examination_date": "2026-06-01T06:05:24Z",
    "status": "ready",
    "doctor_name": "Doctor",
    "final_diagnosis_result": "Normal",
    "report_id": "report_uuid"
  }
]
```

### `GET /patients/me/examinations/{examination_id}`

Returns detail only if the examination belongs to the current patient. AI prediction and confidence are intentionally returned as `null` for patient responses.

Pending response highlights:

- `status: not_ready`
- symptoms and preliminary solution may be visible
- final diagnosis and final note may be null
- AI metadata hidden

Ready response highlights:

- `status: ready`
- final diagnosis visible
- final doctor note visible
- report metadata visible
- AI metadata hidden

## Doctor Workflow

All doctor endpoints require role `doctor` or `admin`.

### `GET /doctor/patients`

Returns registered patient profile rows.

### `GET /doctor/patients/search?email=patient@example.com`

Searches patients by email.

### `GET /doctor/patients/{patient_id}`

Returns one patient profile.

### `GET /doctor/examinations`

Returns examination summary rows. Doctors see their own queue; admins can see all.

### `POST /doctor/examinations/start`

Starts the current one-step scan flow.

Content type:

```text
multipart/form-data
```

Fields:

```text
patient_email=patient@example.com
symptoms_description=Persistent cough and fever.
preliminary_solution=Rest and await final doctor review.
xray_image=@scan.png
```

Response:

```json
{
  "examination_id": "examination_uuid",
  "prediction_result": "Normal",
  "confidence_score": 0.74,
  "confidence_percentage": 74,
  "model_name": "chexnet-densenet121-pneumonia",
  "is_mock": false,
  "disclaimer": "This AI assisted result is provided for clinical decision support only...",
  "xray_image_id": "xray_image_uuid",
  "ai_prediction_id": "ai_prediction_uuid",
  "image_url": "private/storage/path.png"
}
```

### `GET /doctor/examinations/{examination_id}`

Returns full doctor review detail, including patient, scan, AI result, final review fields, feedback, and report.

### `PATCH /doctor/examinations/{examination_id}/final-review`

Request:

```json
{
  "final_diagnosis_result": "Normal",
  "final_doctor_note": "Final instruction for patient.",
  "feedback_status": "correct",
  "feedback_note": "AI result matched the review."
}
```

Response uses the examination response shape and includes final fields.

### `POST /doctor/examinations/{examination_id}/report`

Generates or regenerates a PDF report and marks the examination as `ready`.

### `DELETE /doctor/examinations/{examination_id}`

Deletes the examination and related metadata/storage objects when authorized.

### Legacy Compatibility

- `POST /doctor/examinations`
- `POST /doctor/examinations/{examination_id}/predict`
- `PATCH /doctor/examinations/{examination_id}/note`
- `PATCH /doctor/examinations/{examination_id}/feedback`

These remain available for older screens or manual testing. The recommended flow is `POST /doctor/examinations/start` followed by final review and report generation.

## Reports

### `GET /reports/{report_id}/download`

Returns a temporary signed download URL after authorization.

```json
{
  "report_id": "report_uuid",
  "report_url": "private/report/path.pdf",
  "download_url": "https://signed-url"
}
```

Patients can only download their own reports. Doctors/admins can download reports they are authorized to access.

## Admin

All admin endpoints require role `admin`.

- `GET /admin/doctors`
- `POST /admin/doctors`
- `PATCH /admin/doctors/{doctor_id}`
- `DELETE /admin/doctors/{doctor_id}`
- `GET /admin/patients`
- `POST /admin/patients`
- `PATCH /admin/patients/{patient_id}`
- `DELETE /admin/patients/{patient_id}`
- `GET /admin/patients/search?email=patient@example.com`
- `POST /admin/doctors/promote`

Patient-to-medical-staff promotion keeps the patient profile for historical identity and creates/updates the matching doctor profile.

## Development Endpoints

### `POST /ai/predict/mock`

Standalone upload endpoint for AI testing. It uses the configured model when available and deterministic fallback otherwise.

### `GET /supabase/test`

Connectivity check for development. Do not expose secret values in screenshots.

## Common Error Statuses

- `400`: invalid request value, empty email, unsupported file.
- `401`: missing or invalid bearer token.
- `403`: role or ownership check failed.
- `404`: profile, examination, or report was not found.
- `413`: uploaded file exceeds configured size.
- `422`: request validation failed.
- `500`: storage, database, AI, or PDF operation failed.
