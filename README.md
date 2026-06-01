# Radia X-Ray AI Screening

Radia is a web-based chest X-Ray examination management system with AI-assisted pneumonia screening. It helps medical staff create examination records, upload X-Ray images, receive AI decision support, finalize doctor reviews, generate PDF reports, and let patients download their own final reports.

This repository contains the final Software Engineering AOL project source code, documentation, database migration files, and CI pipeline setup.

## Features

- Shared login for patient, medical staff, and admin users.
- Patient self-registration with name, email, phone number, date of birth derived age, and gender.
- Patient portal for profile management, examination history, final diagnosis, final doctor note, and PDF report download.
- Doctor workspace for starting a new scan by registered patient email, uploading JPG/PNG X-Ray images, running AI prediction, reviewing AI confidence, saving final review, downloading PDF reports, and deleting owned examinations.
- Admin workspace for managing patient and medical staff accounts and promoting registered patients into medical staff.
- Private Supabase Storage for profile pictures, X-Ray images, and PDF reports.
- PDF report generation with patient data, doctor data, final diagnosis, final doctor note, and medical disclaimer.
- Backend schema-cache fallback for final review metadata while Supabase PostgREST schema refreshes.
- CI validation for backend compile/Docker build and frontend lint/build.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite, Tailwind CSS, Axios, React Router |
| Backend | FastAPI, Python 3.11, Supabase Python client |
| Database | Supabase PostgreSQL |
| Storage | Supabase Storage |
| AI | PyTorch/Torchvision DenseNet-style pneumonia classifier with deterministic fallback |
| PDF | ReportLab |
| CI | GitHub Actions |
| Container | Docker for backend validation |

## Repository Structure

```text
.
|-- backend/                 FastAPI app, AI wrapper, services, schemas, routes
|-- frontend/                React/Vite web app
|-- docs/                    Final SDLC, requirements, design, testing, and demo docs
|-- supabase/                Supabase config and SQL migrations
|-- .github/workflows/       Backend and frontend CI workflows
|-- README.md
```

## Local Setup

### Backend

```powershell
cd E:\Projects\radia-xray-ai-screening\backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python -m uvicorn app.main:app --reload
```

Fill `backend/.env` with local Supabase credentials. Never commit real secrets.

Required backend environment variables:

```text
SUPABASE_URL=
SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
CORS_ALLOW_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
DATABASE_URL=
STORAGE_BUCKET_XRAY=xray-images
STORAGE_BUCKET_REPORT=pdf-reports
STORAGE_BUCKET_PROFILE=profile-pictures
MAX_XRAY_UPLOAD_BYTES=10485760
MAX_PROFILE_PICTURE_BYTES=2097152
AI_MODEL_PATH=model/model.pth.tar
AI_PNEUMONIA_THRESHOLD=0.5
```

### Frontend

```powershell
cd E:\Projects\radia-xray-ai-screening\frontend
npm install
npm run dev
```

Optional frontend environment variable:

```text
VITE_API_BASE_URL=http://127.0.0.1:8000
```

## Database and Storage

Supabase migration files are stored in `supabase/migrations/`. The finalized workflow expects:

- Tables: `profiles`, `patient_profiles`, `doctor_profiles`, `admin_profiles`, `examinations`, `xray_images`, `ai_predictions`, `doctor_feedbacks`, `pdf_reports`.
- Storage buckets: `profile-pictures`, `xray-images`, `pdf-reports`.
- Prediction values: `Normal`, `Pneumonia`.
- Feedback values: `correct`, `incorrect`, `uncertain`.
- Examination status values: `not_ready`, `ready`.

Apply migrations through Supabase CLI or SQL editor before demo if the remote schema is not current.

## Main API Endpoints

- `POST /auth/register/patient`
- `POST /auth/login`
- `GET /users/me/profile`
- `GET /patients/me`
- `PATCH /patients/me`
- `POST /patients/me/profile-picture`
- `GET /patients/me/examinations`
- `GET /patients/me/examinations/{examination_id}`
- `GET /doctor/examinations`
- `POST /doctor/examinations/start`
- `GET /doctor/examinations/{examination_id}`
- `PATCH /doctor/examinations/{examination_id}/final-review`
- `POST /doctor/examinations/{examination_id}/report`
- `DELETE /doctor/examinations/{examination_id}`
- `GET /reports/{report_id}/download`
- Admin doctor/patient CRUD and patient-to-medical-staff promotion endpoints.

See [docs/api-contract.md](docs/api-contract.md) for the detailed contract.

## Verification

Backend:

```powershell
cd backend
python -m compileall app
```

Frontend:

```powershell
cd frontend
npm run lint
npm run build
```

CI:

- `Backend CI` compiles the backend and builds the backend Docker image.
- `Frontend CI` lints and builds the Vite app.

## Demo Flow

1. Patient registers an account.
2. Doctor logs in and starts a new scan using the registered patient email.
3. Doctor enters symptoms and preliminary solution.
4. Doctor uploads a JPG/PNG chest X-Ray.
5. AI prediction is stored and shown only to doctor/admin users.
6. Doctor saves final diagnosis, final doctor note, and AI feedback.
7. PDF report is generated and downloadable.
8. Patient logs in and sees final diagnosis, final doctor note, and PDF download without AI confidence details.

See [docs/demo-runbook.md](docs/demo-runbook.md) for the full checklist.

## Security and Ethics

- AI output is decision support only, not a final medical diagnosis.
- Patient users cannot see AI confidence or other patients' data.
- Private files are accessed through signed URLs.
- Supabase service keys stay backend-only.
- Do not commit `.env`, tokens, signed URLs, model checkpoints, uploaded files, or generated artifacts.

## Known Limitations

- This is an academic prototype, not a certified medical device.
- Grad-CAM is kept as future work.
- AI can fall back to deterministic mock output if the configured model is unavailable.
- Deployment is optional; the app can be demonstrated locally with Supabase.

## Contributors

- Nicholas
- Saladin Zhalifunnas Ahfar
- Oslando Fristian Sipayung
- Davinus Libran
