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
3. Set `CORS_ALLOW_ORIGINS` to the allowed frontend origins, separated by commas.
4. Do not commit `backend/.env`, virtual environments, generated caches, uploads, reports, or model checkpoints.
5. Start the backend from the `backend` folder:

```powershell
.\.venv\Scripts\activate
uvicorn app.main:app --reload
```

## Docker Setup

The backend has a Dockerfile at `backend/Dockerfile`.

From the `backend` folder:

```powershell
docker build -t radia-backend:ci .
docker run --env-file .env -p 8000:8000 radia-backend:ci
```

The Docker image starts FastAPI with Uvicorn on port `8000`. Do not copy or commit `.env` values into the Dockerfile.

## CI Pipeline

The backend CI pipeline is defined at `.github/workflows/backend-ci.yml` and uses the GitHub Environment `backend-ci`.

The workflow validates:

- Python 3.11 dependency installation.
- Backend compile check with `python -m compileall app`.
- Backend Docker image build with `docker build -t radia-backend:ci .`.

For AOL DevOps evidence, use screenshots of the `backend-ci` environment, the successful `Backend CI` run, the workflow file, and the Dockerfile. More details are documented in `docs/devops-pipeline.md`.

## Supabase CLI Setup

Supabase CLI project configuration is tracked at `supabase/config.toml`.
Future database schema changes should be added as SQL migration files under
`supabase/migrations/`, and local/demo seed data should go in
`supabase/seed.sql`.

The storage bucket limits for `profile-pictures`, `xray-images`,
`gradcam-results`, and `pdf-reports` are declared in `supabase/config.toml` so
the expected file size and MIME type rules are visible in code.

## Current MVP Endpoints

- `GET /health` checks whether the API is running.
- `GET /supabase/test` verifies backend connectivity to the `profiles` table. This is a development-only test endpoint.
- `POST /auth/register/patient` creates a Supabase Auth user, a `profiles` row, and a `patient_profiles` row.
- `POST /auth/login` signs in a user and returns session tokens with the role from `profiles`.
- `GET /users/me/profile` returns a read-only profile summary for patient, doctor, and admin navbar menus.
- `GET /patients/me` returns the current authenticated patient's profile.
- `PATCH /patients/me` updates patient profile fields for backend compatibility; this edit UI is hidden in the MVP.
- `POST /patients/me/profile-picture` uploads a JPG/PNG/WEBP profile picture up to 2 MB for backend compatibility; this edit UI is hidden in the MVP.
- `GET /doctor/patients` lists patient profiles for authenticated doctor/admin users.
- `GET /doctor/patients/search` searches registered patient profiles by email before starting a scan workflow.
- `GET /doctor/patients/{patient_id}` returns one patient profile by `patient_profiles.id`.
- `GET /doctor/examinations` returns the current doctor's examination queue; admin users can see all rows.
- `GET /doctor/examinations/{examination_id}` returns one doctor-owned examination detail with patient, scan, AI support, feedback, and report metadata.
- `POST /doctor/examinations/start` accepts `patient_email`, `symptoms_description`, `preliminary_solution`, and `xray_image` as multipart form data, creates a doctor-owned examination, uploads the X-Ray, runs the configured DenseNet121 AI model, and stores the prediction.
- `PATCH /doctor/examinations/{examination_id}/final-review` saves the doctor's final diagnosis, final patient-facing note, and AI feedback, then marks the examination `reviewed`.
- `POST /doctor/examinations` creates an examination row for a selected patient. This legacy endpoint remains for compatibility.
- `PATCH /doctor/examinations/{examination_id}/note` saves the doctor's clinical note. This legacy endpoint remains for compatibility.
- `PATCH /doctor/examinations/{examination_id}/feedback` saves AI validation feedback and marks the examination reviewed. This legacy endpoint remains for compatibility.
- `POST /ai/predict/mock` accepts a JPG/JPEG/PNG X-Ray file and returns a Normal/Pneumonia prediction. The route name is legacy; it uses the real model when `AI_MODEL_PATH` is available.
- `POST /doctor/examinations/{examination_id}/predict` stores a JPG/JPEG/PNG X-Ray image up to 10 MB, saves image metadata, runs AI prediction, and saves the prediction.
- `POST /doctor/examinations/{examination_id}/report` generates a reviewed examination PDF and saves it in Supabase Storage.
- `GET /reports/{report_id}/download` returns a temporary signed URL for a private PDF report.
- `GET /patients/me/examinations` returns the current patient's own examination history.
- `GET /patients/me/examinations/{examination_id}` returns the current patient's owned examination detail. Pending patients see doctor/date/status/scan/symptoms/preliminary solution only; reviewed patients see the doctor's final diagnosis and final note. AI result and confidence are doctor-only decision support.
- `GET /admin/doctors` lists medical staff accounts for authenticated admin users.
- `GET /admin/patients/search` searches existing patient accounts by email for authenticated admin users.
- `POST /admin/doctors/promote` promotes an existing patient account to medical staff by updating `profiles.role` and creating/updating `doctor_profiles`.

## Current Limitations

- Admin accounts are still created manually in Supabase for MVP testing.
- The frontend uses one shared sign-in page for patient, doctor, and admin users. Public registration creates patient accounts only.
- Medical staff accounts are created by registering as patient first, then having an admin promote that existing account from the `Medical Staff` screen.
- Patient, doctor, and admin profiles are displayed from the navbar profile menu and are read-only in the current MVP.
- Real AI model inference uses a DenseNet121 checkpoint from `AI_MODEL_PATH`; if the model cannot be loaded, the service falls back to the deterministic mock prediction and marks the response with `is_mock=true`.
- Admin CRUD endpoints and admin UI are future work unless the final demo explicitly requires them.
- Current DevOps setup validates backend compile, frontend lint/build, and backend Docker build only; it does not deploy or push Docker images yet.
