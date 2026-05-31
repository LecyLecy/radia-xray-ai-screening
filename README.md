# Radia

Radia is a web-based X-Ray examination management system with AI-assisted pneumonia screening.

This repository is prepared for the Software Engineering AOL project and Git version control practical assignment.

## Main Modules

- Frontend web application
- Backend API
- AI inference service
- Database and storage integration
- PDF report generation
- Project documentation
- Backend CI pipeline and Docker image build

## Project Status

Current MVP foundation progress:

- FastAPI backend scaffold is available.
- Supabase database schema and private storage buckets have been prepared.
- Backend Supabase connection test is available.
- Patient registration and login backend auth foundation is available.
- Frontend auth uses one shared sign-in page for patient, doctor, and admin users. Public registration creates patient users only.
- Shared read-only profile menu data is available for authenticated users.
- Doctor/admin patient list, examination summary, examination workflow, X-Ray upload storage, mock AI persistence, doctor review, PDF report generation, and signed report download are available.
- Admin medical staff listing and patient-to-medical-staff promotion are available.
- Patient-owned examination history/detail report access endpoints are available.
- Backend CI is available through GitHub Actions and builds the backend Docker image for validation.
- Frontend login, register, patient history/detail, doctor dashboard/workflow, shared profile menu, and admin medical staff pages are connected to backend endpoints.

Implemented backend endpoints include:

- `GET /health`
- `GET /supabase/test`
- `POST /auth/register/patient`
- `POST /auth/login`
- `GET /users/me/profile`
- `GET /patients/me`
- `GET /patients/me/examinations`
- `GET /patients/me/examinations/{examination_id}`
- `GET /doctor/patients`
- `GET /doctor/patients/search`
- `GET /doctor/patients/{patient_id}`
- `GET /doctor/examinations`
- `POST /doctor/examinations`
- `PATCH /doctor/examinations/{examination_id}/note`
- `PATCH /doctor/examinations/{examination_id}/feedback`
- `POST /ai/predict/mock`
- `POST /doctor/examinations/{examination_id}/predict`
- `POST /doctor/examinations/{examination_id}/report`
- `GET /reports/{report_id}/download`
- `GET /admin/doctors`
- `GET /admin/patients/search`
- `POST /admin/doctors/promote`

## DevOps Pipeline

The repository has a basic backend DevOps setup for AOL evidence:

- GitHub Actions workflow: `.github/workflows/backend-ci.yml`
- GitHub Environment: `backend-ci`
- Backend Dockerfile: `backend/Dockerfile`
- Frontend CI workflow: `.github/workflows/frontend-ci.yml`
- Supabase CLI config: `supabase/config.toml`
- DevOps guide: `docs/devops-pipeline.md`

The `Backend CI` workflow runs on pushes and pull requests to `dev` and `main`. It installs backend dependencies, compiles the FastAPI backend, and builds the backend Docker image with the tag `radia-backend:ci`.
The `Frontend CI` workflow installs frontend dependencies, runs lint, and builds the Vite app.

For AOL screenshots, capture:

- Settings -> Environments -> `backend-ci`
- Actions -> `Backend CI` successful green run
- Successful run details showing `Compile backend` and `Build backend Docker image`
- Actions -> `Frontend CI` successful green run
- Successful run details showing `Lint frontend` and `Build frontend`
- `.github/workflows/backend-ci.yml`
- `.github/workflows/frontend-ci.yml`
- `backend/Dockerfile`

Supabase CLI setup is tracked for future database migrations and storage bucket
configuration. Remote database changes should be made through migration files
under `supabase/migrations/` after local review/testing.

Do not include secret values, access tokens, or signed download URLs in public screenshots or submitted documentation.

## Contributors

- Nicholas
- Saladin Zhalifunnas Ahfar
- Oslando Fristian Sipayung
- Davinus Libran
