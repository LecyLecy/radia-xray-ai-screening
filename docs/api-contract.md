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
- Public registration is patient-only. Doctor/medical staff accounts are
  provisioned through admin/manual setup, and admin accounts are created
  manually for the MVP.

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
- Use one shared sign-in form for all roles. Do not ask the user to choose
  patient, medical staff, or admin before login.
- Redirect by returned role:
  - `patient` -> `/patient/history`
  - `doctor` -> `/doctor/dashboard`
  - `admin` -> `/doctor/dashboard`, with admin-only medical staff menu access.

## Users

### `GET /users/me/profile`

Returns a read-only profile summary for the authenticated user. This endpoint
feeds the top-right profile menu for patient, doctor, and admin users.

Headers:

```text
Authorization: Bearer <access_token>
```

Success response:

```json
{
  "user_id": "auth_user_uuid",
  "email": "user@example.com",
  "role": "doctor",
  "full_name": "Doctor Name",
  "phone_number": "08123456789",
  "age": 35,
  "gender": "male",
  "profile_picture_url": "auth_user_uuid/path.png",
  "profile_picture_download_url": "https://...",
  "license_number": "DOC-001",
  "specialization": "Radiology"
}
```

Expected errors:

- `401`: missing, malformed, or invalid bearer token.
- `404`: profile role is missing or invalid.

Frontend notes:

- Use this for the shared navbar profile menu.
- The app displays profiles as read-only for all roles in the current MVP.
- Admin users use a default avatar even if no admin profile picture exists.

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

- Use this endpoint for patient-owned profile data when needed.
- Do not pass patient id from frontend for the current user's own profile.
- `profile_picture_url` is a private storage object path.
- `profile_picture_download_url` is a temporary signed URL and may be `null`.

### `PATCH /patients/me`

Updates the current logged-in patient's editable profile fields. Email remains
read-only because it belongs to the Supabase Auth identity.

Current frontend note: patient profile editing is not exposed in the UI while
the MVP uses read-only shared profile menus. This endpoint remains available
for backend compatibility.

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

Current frontend note: profile picture editing is not exposed in the UI while
the MVP uses read-only shared profile menus. Existing stored patient pictures
may still be displayed.

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
    "final_diagnosis_result": "Pneumonia",
    "report_id": "report_uuid"
  }
]
```

Nullable fields:

```text
doctor_name
final_diagnosis_result
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
patient. Patients never receive AI result or confidence. While status is
`pending_review`, patients see doctor/date/status/scan/symptoms/preliminary
solution only. After status is `reviewed` or `report_ready`, patients also see
the doctor's final diagnosis and final note.

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
  "symptoms_description": "Persistent cough and fever.",
  "preliminary_solution": "Rest, hydration, and await final radiologist review.",
  "final_diagnosis_result": "Pneumonia",
  "final_doctor_note": "Final instruction for patient.",
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
  "ai_prediction": null,
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
- Do not render AI result or confidence in patient UI. AI metadata is reserved
  for doctor decision support.

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

### `GET /doctor/patients/search`

Searches registered patient profiles by email so doctor/admin users can find a
newly registered patient before starting a scan workflow.

Headers:

```text
Authorization: Bearer <access_token>
```

Query parameters:

```text
email=patient@example.com
```

Success response uses the same row shape as `GET /doctor/patients`.

Expected errors:

- `400`: email query is empty.
- `401`: missing, malformed, or invalid bearer token.
- `403`: authenticated user is not doctor/admin.
- `422`: missing `email` query parameter.
- `500`: patient search could not be loaded.

Frontend notes:

- If no row matches, tell the doctor the patient must register first.
- After selecting a patient, use `POST /doctor/examinations` or the existing
  screening flow to create the examination before uploading the scan.

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

Returns examination summary rows for doctor/admin dashboard screens. Doctor
users only receive examinations where `doctor_id` matches their own doctor
profile. Admin users can see all examinations.

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
    "patient_email": "patient@example.com",
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
patient_email
prediction_result
confidence_percentage
report_id
```

Expected errors:

- `401`: missing, malformed, or invalid bearer token.
- `403`: authenticated user is not doctor/admin.
- `500`: examination summary data could not be loaded.

### `POST /doctor/examinations/start`

Starts the doctor-owned examination flow in one request. The patient must
already be registered. The backend finds `patient_profiles` by email, creates
an examination owned by the logged-in doctor, uploads the X-Ray to
`xray-images`, runs AI prediction, stores `xray_images` and
`ai_predictions`, and leaves the examination status as `pending_review`.

Headers:

```text
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

Form fields:

```text
patient_email=patient@example.com
symptoms_description=Persistent cough and fever.
preliminary_solution=Rest, hydration, and await final radiologist review.
xray_image=@scan.png
```

Success response:

```json
{
  "examination_id": "examination_uuid",
  "prediction_result": "Pneumonia",
  "confidence_score": 0.82,
  "confidence_percentage": 82,
  "model_name": "chexnet-densenet121-pneumonia",
  "is_mock": false,
  "disclaimer": "AI result is for decision support only...",
  "xray_image_id": "xray_image_uuid",
  "ai_prediction_id": "ai_prediction_uuid",
  "image_url": "examination_uuid/20260601010000_scan.png"
}
```

Expected errors:

- `400`: required form values are empty or file type is not JPG/PNG.
- `401`: missing, malformed, or invalid bearer token.
- `403`: authenticated user is not a doctor.
- `404`: patient email or doctor profile was not found.
- `413`: X-Ray image is larger than 10 MB.
- `500`: examination, image metadata, upload, or prediction could not be saved.

### `GET /doctor/examinations/{examination_id}`

Returns one examination detail for doctor review. Doctor users can only read
their own examinations; admin users can read all examinations.

Headers:

```text
Authorization: Bearer <access_token>
```

Success response includes patient info, symptoms, preliminary solution, scan
metadata, AI result/confidence, final review fields, feedback, and report
metadata.

Expected errors:

- `401`: missing, malformed, or invalid bearer token.
- `403`: authenticated user is not doctor/admin, or a doctor is accessing another doctor's examination.
- `404`: examination was not found.

### `PATCH /doctor/examinations/{examination_id}/final-review`

Saves the doctor's final patient-facing diagnosis and note, stores AI feedback,
and marks the examination as `reviewed`.

Headers:

```text
Authorization: Bearer <access_token>
Content-Type: application/json
```

Request:

```json
{
  "final_diagnosis_result": "Pneumonia",
  "final_doctor_note": "Final instruction for patient.",
  "feedback_status": "correct",
  "feedback_note": "AI result was clinically aligned."
}
```

Allowed values:

```text
final_diagnosis_result: Normal, Pneumonia
feedback_status: correct, incorrect, uncertain
```

Success response:

```json
{
  "id": "examination_uuid",
  "patient_id": "patient_profile_uuid",
  "doctor_id": "doctor_profile_uuid",
  "created_by_user_id": "auth_user_uuid",
  "examination_date": "2026-06-01T01:00:00Z",
  "status": "reviewed",
  "doctor_note": "Final instruction for patient.",
  "symptoms_description": "Persistent cough and fever.",
  "preliminary_solution": "Rest, hydration, and await final radiologist review.",
  "final_diagnosis_result": "Pneumonia",
  "final_doctor_note": "Final instruction for patient."
}
```

Expected errors:

- `401`: missing, malformed, or invalid bearer token.
- `403`: authenticated user is not doctor/admin, or a doctor is reviewing another doctor's examination.
- `404`: examination was not found.
- `422`: missing or invalid final diagnosis, final note, or feedback status.
- `500`: final review could not be saved.

### `POST /doctor/examinations`

Legacy compatibility endpoint. Creates a new examination record for a patient
without upload or AI prediction. Prefer `POST /doctor/examinations/start` for
the current doctor-owned examination flow.

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

## AI Prediction

### `POST /ai/predict/mock`

Legacy mock-named endpoint for standalone upload/result testing. It uses the
configured real model when `AI_MODEL_PATH` is available. If the model cannot be
loaded, the backend falls back to deterministic mock output and returns
`is_mock=true`.

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
  "model_name": "chexnet-densenet121-pneumonia",
  "is_mock": false,
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
- This endpoint does not store images or predictions in Supabase.

### `POST /doctor/examinations/{examination_id}/predict`

Workflow-shaped prediction endpoint for doctor examination screens. This
endpoint validates and stores the X-Ray image in Supabase Storage, saves image
metadata in `xray_images`, saves the AI result in `ai_predictions`, and
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
  "model_name": "chexnet-densenet121-pneumonia",
  "is_mock": false,
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

- Admin medical staff listing and patient-to-doctor promotion are implemented.
- Other admin CRUD endpoints are not implemented yet.

## Admin Workflow

These endpoints require an authenticated user with role `admin`.

### `GET /admin/doctors`

Returns medical staff profile rows for the admin medical staff screen.

Headers:

```text
Authorization: Bearer <access_token>
```

Success response:

```json
[
  {
    "id": "doctor_profile_uuid",
    "user_id": "auth_user_uuid",
    "email": "doctor@example.com",
    "full_name": "Doctor Name",
    "phone_number": "08123456789",
    "age": 35,
    "gender": "male",
    "profile_picture_url": null,
    "license_number": "DOC-001",
    "specialization": "Radiology"
  }
]
```

Expected errors:

- `401`: missing or invalid bearer token.
- `403`: authenticated user is not admin.
- `500`: doctor profiles could not be loaded.

### `GET /admin/patients/search`

Searches patient profiles by email so an admin can promote an existing patient
account into medical staff. The user must already have registered as a patient.

Headers:

```text
Authorization: Bearer <access_token>
```

Query parameters:

```text
email=patient@example.com
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
    "profile_picture_url": "auth_user_uuid/path.png",
    "profile_picture_download_url": "https://..."
  }
]
```

Expected errors:

- `400`: email query is empty.
- `401`: missing or invalid bearer token.
- `403`: authenticated user is not admin.
- `422`: missing `email` query parameter.
- `500`: patient profiles could not be searched.

### `POST /admin/doctors/promote`

Promotes an existing patient account to medical staff. This updates
`profiles.role` from `patient` to `doctor`, creates or updates the matching
`doctor_profiles` row, and copies basic profile fields from `patient_profiles`.
The original patient profile row is kept for historical identity/data.

Headers:

```text
Authorization: Bearer <access_token>
Content-Type: application/json
```

Request:

```json
{
  "patient_id": "patient_profile_uuid",
  "license_number": "DOC-001",
  "specialization": "Radiology"
}
```

Required fields:

```text
patient_id
```

Success response:

```json
{
  "id": "doctor_profile_uuid",
  "user_id": "auth_user_uuid",
  "email": "doctor@example.com",
  "full_name": "Doctor Name",
  "phone_number": "08123456789",
  "age": 35,
  "gender": "male",
  "profile_picture_url": "auth_user_uuid/path.png",
  "license_number": "DOC-001",
  "specialization": "Radiology"
}
```

Expected errors:

- `400`: selected user is not promotable.
- `401`: missing or invalid bearer token.
- `403`: authenticated user is not admin.
- `422`: missing or invalid request field.
- `500`: role/profile rows could not be updated.

Grad-CAM remains future work. Stored predictions use the configured DenseNet121
model when available, with deterministic mock fallback marked by `is_mock=true`.
