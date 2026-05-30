# Radia API Contract

This file is the shared contract between backend and frontend work. Update it
whenever a backend endpoint, request body, response body, or error behavior
changes.

## Base URLs

```text
Backend local: http://127.0.0.1:8000
Frontend local: http://localhost:5173
```

Frontend must call the FastAPI backend. It must not call Supabase Auth,
Supabase database tables, Supabase Storage, or the AI model directly.

## Shared Rules

- Use JSON request bodies unless an endpoint explicitly says `multipart/form-data`.
- Authenticated endpoints use:

```text
Authorization: Bearer <access_token>
```

- Do not store or expose `SUPABASE_SECRET_KEY` in frontend code.
- Patient privacy must be enforced by backend endpoints, not only frontend route
  hiding.
- Current gender enum values are `male` and `female`.
- Current user role values are `patient`, `doctor`, and `admin`.
- Current AI prediction values are `Normal` and `Pneumonia`.

## Health

### `GET /health`

Checks whether the API is running.

Success response:

```json
{
  "status": "ok"
}
```

## Auth

### `POST /auth/register/patient`

Creates a patient user in Supabase Auth, creates a `profiles` row with role
`patient`, and creates a `patient_profiles` row.

Request:

```json
{
  "email": "patient@example.com",
  "password": "Secret123",
  "full_name": "Patient Name",
  "phone_number": "08123456789",
  "age": 30,
  "gender": "male",
  "profile_picture_url": "auth_user_uuid/20260531120000_uuid_profile.png",
  "profile_picture_download_url": "https://..."
}
```

Required fields:

```text
email
password
full_name
```

Optional fields:

```text
phone_number
age
gender
profile_picture_url
```

Success response:

```json
{
  "user_id": "uuid",
  "email": "patient@example.com",
  "role": "patient"
}
```

Expected errors:

- `422`: missing or invalid required field.
- `400`: duplicate email or Supabase auth creation failed.
- `500`: auth user was created but profile data could not be saved.

Frontend notes:

- On success, redirect patient to login.
- Do not expect tokens from register response.
- Login separately after registration.

### `POST /auth/login`

Signs in a user and returns Supabase session tokens plus the role stored in
`profiles`.

Request:

```json
{
  "email": "patient@example.com",
  "password": "Secret123"
}
```

Success response:

```json
{
  "access_token": "jwt",
  "refresh_token": "token",
  "token_type": "bearer",
  "user": {
    "user_id": "uuid",
    "email": "patient@example.com",
    "role": "patient"
  }
}
```

Expected errors:

- `422`: missing email or password.
- `401`: invalid email or password.
- `500`: user role could not be loaded.

Frontend notes:

- Store `access_token`, `refresh_token`, `user.user_id`, and `user.role`.
- Redirect by returned role:
  - `patient` -> `/patient/dashboard`
  - `doctor` -> `/doctor/dashboard`
  - `admin` -> admin route when admin UI exists.

## Patient

### `GET /patients/me`

Returns the current logged-in patient's profile.

Headers:

```text
Authorization: Bearer <access_token>
```

Success response:

```json
{
  "id": "patient_profile_uuid",
  "user_id": "uuid",
  "email": "patient@example.com",
  "full_name": "Patient Name",
  "phone_number": "08123456789",
  "age": 30,
  "gender": "male",
  "profile_picture_url": null
}
```

Expected errors:

- `401`: missing, malformed, or invalid bearer token.
- `403`: authenticated user is not a patient.
- `404`: profile row is missing.

Frontend notes:

- Use this endpoint for patient dashboard/profile header data.
- Do not pass patient id from frontend for the current user's own profile.
- `profile_picture_url` is a private storage object path.
- `profile_picture_download_url` is a temporary signed URL and may be `null`.

### `PATCH /patients/me`

Updates the current logged-in patient's editable profile fields. Email remains
read-only because it belongs to the Supabase Auth identity.

Headers:

```text
Authorization: Bearer <access_token>
Content-Type: application/json
```

Request:

```json
{
  "full_name": "Patient Name",
  "phone_number": "08123456789",
  "age": 30,
  "gender": "male"
}
```

Success response uses the same shape as `GET /patients/me`.

Expected errors:

- `401`: missing, malformed, or invalid bearer token.
- `403`: authenticated user is not a patient.
- `404`: patient profile row is missing.
- `422`: missing or invalid editable field.
- `500`: profile data could not be updated.

### `POST /patients/me/profile-picture`

Uploads the current logged-in patient's profile picture to the private
`profile-pictures` Supabase Storage bucket and saves the object path in
`patient_profiles.profile_picture_url`.

Request:

```text
Content-Type: multipart/form-data
field: profile_picture
allowed file types: JPG, PNG, WEBP
maximum file size: 2 MB
```

Success response uses the same shape as `GET /patients/me`.

Expected errors:

- `400`: unsupported file type or empty upload.
- `401`: missing, malformed, or invalid bearer token.
- `403`: authenticated user is not a patient.
- `413`: file exceeds the 2 MB upload limit.
- `422`: missing `profile_picture` form field.
- `500`: profile picture could not be uploaded or saved.

### `GET /patients/me/examinations`

Returns the current logged-in patient's own examination history. The backend
resolves the patient profile from the bearer token and filters by that patient
profile id.

Headers:

```text
Authorization: Bearer <access_token>
```

Success response:

```json
[
  {
    "id": "examination_uuid",
    "examination_date": "2026-05-23T07:54:03Z",
    "status": "report_ready",
    "doctor_name": "Doctor Name",
    "prediction_result": "Pneumonia",
    "confidence_percentage": 82,
    "report_id": "report_uuid"
  }
]
```

Nullable fields:

```text
doctor_name
prediction_result
confidence_percentage
report_id
```

Expected errors:

- `401`: missing, malformed, or invalid bearer token.
- `403`: authenticated user is not a patient.
- `404`: patient profile row is missing.
- `500`: examination history or related summary data could not be loaded.

Frontend notes:

- Use this endpoint for the patient examination history page.
- `report_id` is present when a PDF report row exists for that examination.
- Patients cannot request another patient's history by passing an id.

### `GET /patients/me/examinations/{examination_id}`

Returns one examination detail only if it belongs to the current logged-in
patient. Related X-Ray, AI prediction, doctor feedback, and PDF report sections
return `null` when they do not exist yet.

Headers:

```text
Authorization: Bearer <access_token>
```

Success response:

```json
{
  "id": "examination_uuid",
  "patient_id": "patient_profile_uuid",
  "doctor_id": "doctor_profile_uuid",
  "created_by_user_id": "auth_user_uuid",
  "examination_date": "2026-05-23T07:54:03Z",
  "status": "report_ready",
  "doctor_note": "Doctor clinical note.",
  "doctor": {
    "id": "doctor_profile_uuid",
    "full_name": "Doctor Name",
    "email": "doctor@example.com",
    "specialization": "Radiology"
  },
  "xray_image": {
    "id": "xray_image_uuid",
    "image_url": "examination_uuid/20260523120000_uuid_xray.png",
    "file_name": "xray.png",
    "file_type": "image/png",
    "uploaded_at": "2026-05-23T07:54:03Z"
  },
  "ai_prediction": {
    "id": "ai_prediction_uuid",
    "prediction_result": "Pneumonia",
    "confidence_score": 0.82,
    "confidence_percentage": 82,
    "gradcam_url": null,
    "model_name": "radia-mock-ai-v1",
    "created_at": "2026-05-23T07:54:03Z"
  },
  "doctor_feedback": {
    "id": "feedback_uuid",
    "feedback_status": "correct",
    "feedback_note": "AI result matches clinical review.",
    "created_at": "2026-05-23T07:54:03Z"
  },
  "report": {
    "id": "report_uuid",
    "report_url": "reports/examination_uuid/20260523120000_radia_report.pdf",
    "generated_at": "2026-05-23T07:54:03Z"
  },
  "disclaimer": "This AI assisted result is provided for clinical decision support only..."
}
```

Nullable sections:

```text
doctor
xray_image
ai_prediction
doctor_feedback
report
```

Expected errors:

- `401`: missing, malformed, or invalid bearer token.
- `403`: authenticated user is not a patient.
- `404`: patient profile is missing, examination does not exist, or examination belongs to another patient.
- `500`: related examination detail data could not be loaded.

Frontend notes:

- Use `report.id` with `GET /reports/{report_id}/download` to open or download
  the private PDF through a signed URL.
- `xray_image.image_url` and `report.report_url` are private storage object
  paths, not public URLs.
- Always show the `disclaimer` near AI result details.

## Doctor Workflow

These endpoints are for doctor/admin workflow screens. They require an
authenticated user with role `doctor` or `admin` in the `profiles` table.

### `GET /doctor/patients`

Returns patient profile rows for doctor patient list screens.

Headers:

```text
Authorization: Bearer <access_token>
```

Success response:

```json
[
  {
    "id": "patient_profile_uuid",
    "user_id": "auth_user_uuid",
    "email": "patient@example.com",
    "full_name": "Patient Name",
    "phone_number": "08123456789",
    "age": 30,
    "gender": "male",
    "profile_picture_url": null
  }
]
```

Expected errors:

- `401`: missing, malformed, or invalid bearer token.
- `403`: authenticated user is not doctor/admin.
- `500`: patient list could not be loaded.

### `GET /doctor/patients/{patient_id}`

Returns one patient profile by `patient_profiles.id`.

Headers:

```text
Authorization: Bearer <access_token>
```

Success response:

```json
{
  "id": "patient_profile_uuid",
  "user_id": "auth_user_uuid",
  "email": "patient@example.com",
  "full_name": "Patient Name",
  "phone_number": "08123456789",
  "age": 30,
  "gender": "male",
  "profile_picture_url": null
}
```

Expected errors:

- `401`: missing, malformed, or invalid bearer token.
- `403`: authenticated user is not doctor/admin.
- `404`: patient was not found.

### `GET /doctor/examinations`

Returns recent examination summary rows for doctor/admin dashboard screens.

Headers:

```text
Authorization: Bearer <access_token>
```

Success response:

```json
[
  {
    "id": "examination_uuid",
    "patient_id": "patient_profile_uuid",
    "patient_name": "Patient Name",
    "examination_date": "2026-05-23T07:54:03Z",
    "status": "report_ready",
    "prediction_result": "Normal",
    "confidence_percentage": 74,
    "report_id": "report_uuid"
  }
]
```

Nullable fields:

```text
patient_name
prediction_result
confidence_percentage
report_id
```

Expected errors:

- `401`: missing, malformed, or invalid bearer token.
- `403`: authenticated user is not doctor/admin.
- `500`: examination summary data could not be loaded.

### `POST /doctor/examinations`

Creates a new examination record for a patient.

Headers:

```text
Authorization: Bearer <access_token>
Content-Type: application/json
```

Request:

```json
{
  "patient_id": "patient_profile_uuid",
  "examination_date": "2026-05-21T10:00:00Z"
}
```

`examination_date` is optional. If omitted, backend uses the current time.

Success response:

```json
{
  "id": "examination_uuid",
  "patient_id": "patient_profile_uuid",
  "doctor_id": "doctor_profile_uuid_or_null",
  "created_by_user_id": "auth_user_uuid",
  "examination_date": "2026-05-21T10:00:00Z",
  "status": "pending_review",
  "doctor_note": null
}
```

Expected errors:

- `401`: missing, malformed, or invalid bearer token.
- `403`: authenticated user is not doctor/admin.
- `404`: patient was not found.
- `500`: examination could not be created.

### `PATCH /doctor/examinations/{examination_id}/note`

Saves the doctor's clinical note on an examination.

Headers:

```text
Authorization: Bearer <access_token>
Content-Type: application/json
```

Request:

```json
{
  "doctor_note": "Patient shows mild respiratory symptoms. Recommend follow-up."
}
```

Success response:

```json
{
  "id": "examination_uuid",
  "patient_id": "patient_profile_uuid",
  "doctor_id": "doctor_profile_uuid_or_null",
  "created_by_user_id": "auth_user_uuid",
  "examination_date": "2026-05-21T10:00:00Z",
  "status": "pending_review",
  "doctor_note": "Patient shows mild respiratory symptoms. Recommend follow-up."
}
```

Expected errors:

- `401`: missing, malformed, or invalid bearer token.
- `403`: authenticated user is not doctor/admin.
- `404`: examination was not found.
- `422`: missing or empty `doctor_note`.
- `500`: doctor note could not be saved.

### `PATCH /doctor/examinations/{examination_id}/feedback`

Saves or updates the doctor's validation of the AI result. Saving feedback marks
the examination status as `reviewed`.

Headers:

```text
Authorization: Bearer <access_token>
Content-Type: application/json
```

Request:

```json
{
  "feedback_status": "correct",
  "feedback_note": "AI result matches clinical review."
}
```

Allowed `feedback_status` values:

```text
correct
incorrect
uncertain
```

Success response:

```json
{
  "id": "feedback_uuid",
  "examination_id": "examination_uuid",
  "doctor_id": "doctor_profile_uuid_or_null",
  "feedback_status": "correct",
  "feedback_note": "AI result matches clinical review."
}
```

Expected errors:

- `401`: missing, malformed, or invalid bearer token.
- `403`: authenticated user is not doctor/admin.
- `404`: examination was not found.
- `422`: missing or invalid `feedback_status`.
- `500`: doctor feedback could not be saved.

### `POST /doctor/examinations/{examination_id}/report`

Generates or regenerates a PDF report for a reviewed examination. The backend
stores the generated PDF in the private `pdf-reports` Supabase Storage bucket,
saves report metadata in `pdf_reports`, and marks the examination as
`report_ready`.

Headers:

```text
Authorization: Bearer <access_token>
```

Success response:

```json
{
  "id": "report_uuid",
  "examination_id": "examination_uuid",
  "report_url": "reports/examination_uuid/20260523120000_radia_report.pdf",
  "generated_by_user_id": "auth_user_uuid"
}
```

Expected errors:

- `400`: doctor note, doctor feedback, AI prediction, or related required report data is missing.
- `401`: missing, malformed, or invalid bearer token.
- `403`: authenticated user is not doctor/admin.
- `404`: examination was not found.
- `500`: PDF could not be generated, uploaded, or saved.

Frontend notes:

- Reports are regenerated by updating the existing `pdf_reports` row for the
  examination when one already exists.
- `report_url` is a private Supabase Storage object path, not a public URL.

## Reports

### `GET /reports/{report_id}/download`

Returns a temporary signed download URL for a private PDF report.

Headers:

```text
Authorization: Bearer <access_token>
```

Success response:

```json
{
  "report_id": "report_uuid",
  "report_url": "reports/examination_uuid/20260523120000_radia_report.pdf",
  "download_url": "https://..."
}
```

Expected errors:

- `401`: missing, malformed, or invalid bearer token.
- `403`: patient user is trying to access another patient's report, or role is not allowed.
- `404`: report or examination was not found.
- `500`: signed download URL could not be created.

Frontend notes:

- The signed URL is temporary and should be used immediately for download/open.
- Doctors/admins may download examination reports. Patients may only download
  their own reports.

## AI Mock

### `POST /ai/predict/mock`

Temporary mock endpoint so frontend upload/result pages can work before the
real model workflow is ready.

Request:

```text
Content-Type: multipart/form-data
field: xray_image
allowed file types: JPG, JPEG, PNG
maximum file size: 10 MB
```

Success response:

```json
{
  "examination_id": null,
  "prediction_result": "Normal",
  "confidence_score": 0.74,
  "confidence_percentage": 74,
  "model_name": "radia-mock-ai-v1",
  "is_mock": true,
  "disclaimer": "This AI assisted result is provided for clinical decision support only..."
}
```

Expected errors:

- `400`: unsupported file type.
- `413`: file exceeds the 10 MB upload limit.
- `422`: missing `xray_image` form field.

Frontend notes:

- Show the disclaimer with the AI result.
- Display `is_mock` clearly in development/testing if useful.
- This endpoint does not store images or predictions in Supabase yet.

### `POST /doctor/examinations/{examination_id}/predict`

Workflow-shaped mock prediction endpoint for doctor examination screens. This
endpoint validates and stores the X-Ray image in Supabase Storage, saves image
metadata in `xray_images`, saves the mock AI result in `ai_predictions`, and
returns the stored IDs.

Request:

```text
Content-Type: multipart/form-data
field: xray_image
path param: examination_id
allowed file types: JPG, JPEG, PNG
maximum file size: 10 MB
```

Success response:

```json
{
  "examination_id": "examination_uuid",
  "xray_image_id": "xray_image_uuid",
  "ai_prediction_id": "ai_prediction_uuid",
  "image_url": "examination_uuid/20260523120000_uuid_xray.png",
  "prediction_result": "Pneumonia",
  "confidence_score": 0.82,
  "confidence_percentage": 82,
  "model_name": "radia-mock-ai-v1",
  "is_mock": true,
  "disclaimer": "This AI assisted result is provided for clinical decision support only..."
}
```

Expected errors:

- `400`: unsupported file type or empty upload.
- `401`: missing, malformed, or invalid bearer token.
- `403`: authenticated user is not doctor/admin.
- `404`: examination was not found.
- `413`: file exceeds the 10 MB upload limit.
- `422`: missing `xray_image` form field.

Frontend notes:

- `image_url` is the private Supabase Storage object path, not a public file URL.
- Show the disclaimer with the AI result.

Manual testing notes:

- Doctor/admin test users must exist in Supabase Auth, `profiles`, and
  `doctor_profiles`; login role lookup reads `profiles.role`.
- Supabase enum `prediction_result` must allow `Normal` and `Pneumonia`.
- If upload succeeds but prediction persistence fails, the test can leave an
  `xray_images` row and storage object for that examination. Delete those test
  artifacts or use a fresh examination before retrying.
- `ai_predictions.confidence_percentage` is required when that database column
  is configured as non-null.

## Temporary Development Endpoint

### `GET /supabase/test`

Checks whether the backend can connect to Supabase and query `profiles`.

Success response:

```json
{
  "status": "connected",
  "table": "profiles",
  "data": []
}
```

This endpoint is for development only. It should be removed or protected before
demo/security hardening.

## Current Limitations

- Doctor/admin creation endpoints are not implemented yet.
- Admin CRUD endpoints and admin UI are not implemented yet.
- Real AI model inference and Grad-CAM remain future work; current stored predictions are mock AI results.
