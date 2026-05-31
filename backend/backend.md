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
- `GET /patients/me` returns the current authenticated patient's profile.
- `PATCH /patients/me` updates the current authenticated patient's editable profile fields.
- `POST /patients/me/profile-picture` uploads a JPG/PNG/WEBP profile picture up to 2 MB and saves the private storage path.
- `GET /doctor/patients` lists patient profiles for authenticated doctor/admin users.
- `GET /doctor/patients/{patient_id}` returns one patient profile by `patient_profiles.id`.
- `GET /doctor/examinations` returns recent examination summary rows for doctor/admin dashboards.
- `POST /doctor/examinations` creates an examination row for a selected patient.
- `PATCH /doctor/examinations/{examination_id}/note` saves the doctor's clinical note.
- `PATCH /doctor/examinations/{examination_id}/feedback` saves AI validation feedback and marks the examination reviewed.
- `POST /ai/predict/mock` accepts a JPG/JPEG/PNG X-Ray file and returns a mock Normal/Pneumonia prediction.
- `POST /doctor/examinations/{examination_id}/predict` stores a JPG/JPEG/PNG X-Ray image up to 10 MB, saves image metadata, runs mock AI prediction, and saves the prediction.
- `POST /doctor/examinations/{examination_id}/report` generates a reviewed examination PDF and saves it in Supabase Storage.
- `GET /reports/{report_id}/download` returns a temporary signed URL for a private PDF report.
- `GET /patients/me/examinations` returns the current patient's own examination history.
- `GET /patients/me/examinations/{examination_id}` returns the current patient's owned examination detail with related AI/report metadata.
- `GET /admin/doctors` lists medical staff accounts for authenticated admin users.
- `POST /admin/doctors` creates a Supabase Auth doctor user, `profiles` row, and `doctor_profiles` row for authenticated admin users.

## Current Limitations

- Admin accounts are still created manually in Supabase for MVP testing.
- The frontend uses one shared sign-in page for patient, doctor, and admin users. Public registration creates patient accounts only.
- Medical staff accounts can be created from the admin UI.
- Real AI model inference is still planned; the workflow endpoint currently persists mock AI predictions.
- Admin CRUD endpoints and admin UI are future work unless the final demo explicitly requires them.
- Current DevOps setup validates backend compile, frontend lint/build, and backend Docker build only; it does not deploy or push Docker images yet.
