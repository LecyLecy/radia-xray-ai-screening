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
  "profile_picture_url": null
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

## AI Mock

### `POST /ai/predict/mock`

Temporary mock endpoint so frontend upload/result pages can work before the
real model workflow is ready.

Request:

```text
Content-Type: multipart/form-data
field: xray_image
allowed file types: JPG, JPEG, PNG
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
- `422`: missing `xray_image` form field.

Frontend notes:

- Show the disclaimer with the AI result.
- Display `is_mock` clearly in development/testing if useful.
- This endpoint does not store images or predictions in Supabase yet.

### `POST /doctor/examinations/{examination_id}/predict`

Workflow-shaped mock prediction endpoint for doctor examination screens.

Request:

```text
Content-Type: multipart/form-data
field: xray_image
path param: examination_id
```

Response shape is the same as `POST /ai/predict/mock`, but `examination_id`
will match the path parameter.

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
- Full role-based authorization beyond the current patient and doctor/admin
  checks is not implemented yet.
- Upload storage and AI prediction persistence are not implemented yet.
- PDF report generation is not implemented yet.
