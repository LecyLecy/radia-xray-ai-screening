# Radia Backend

This folder contains the FastAPI backend application for Radia.

Planned stack:
FastAPI
Python
Supabase PostgreSQL
Supabase Storage
PyTorch AI model
PDF report generator

## Local Setup

1. Create `backend/.env` from `backend/.env.example`.
2. Fill Supabase URL and keys in `backend/.env`.
3. Do not commit `backend/.env`, virtual environments, generated caches, uploads, reports, or model checkpoints.
4. Start the backend from the `backend` folder:

```powershell
.\.venv\Scripts\activate
uvicorn app.main:app --reload
```

## Current MVP Endpoints

- `GET /health` checks whether the API is running.
- `GET /supabase/test` verifies backend connectivity to the `profiles` table. This is a development-only test endpoint.
- `POST /auth/register/patient` creates a Supabase Auth user, a `profiles` row, and a `patient_profiles` row.
- `POST /auth/login` signs in a user and returns session tokens with the role from `profiles`.
- `GET /patients/me` returns the current authenticated patient's profile.
- `GET /doctor/patients` lists patient profiles for authenticated doctor/admin users.
- `GET /doctor/patients/{patient_id}` returns one patient profile by `patient_profiles.id`.
- `POST /doctor/examinations` creates an examination row for a selected patient.
- `PATCH /doctor/examinations/{examination_id}/note` saves the doctor's clinical note.
- `PATCH /doctor/examinations/{examination_id}/feedback` saves AI validation feedback and marks the examination reviewed.
- `POST /ai/predict/mock` accepts a JPG/JPEG/PNG X-Ray file and returns a mock Normal/Pneumonia prediction.
- `POST /doctor/examinations/{examination_id}/predict` stores a JPG/JPEG/PNG X-Ray image up to 10 MB, saves image metadata, runs mock AI prediction, and saves the prediction.
- `POST /doctor/examinations/{examination_id}/report` generates a reviewed examination PDF and saves it in Supabase Storage.
- `GET /reports/{report_id}/download` returns a temporary signed URL for a private PDF report.
- `GET /patients/me/examinations` returns the current patient's own examination history.
- `GET /patients/me/examinations/{examination_id}` returns the current patient's owned examination detail with related AI/report metadata.

## Current Limitations

- Frontend auth forms are still being connected to backend auth endpoints.
- Doctor/admin accounts are still created manually in Supabase for MVP testing.
- Patient history frontend integration is still planned on the frontend branch.
- Real AI model inference is still planned; the workflow endpoint currently persists mock AI predictions.
