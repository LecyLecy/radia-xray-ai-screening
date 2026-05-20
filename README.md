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

## Project Status

Current MVP foundation progress:

- FastAPI backend scaffold is available.
- Supabase database schema and private storage buckets have been prepared.
- Backend Supabase connection test is available.
- Patient registration and login backend auth foundation is available.
- Current patient profile endpoint is available for authenticated patient dashboard data.
- Doctor/admin patient list, patient detail, and examination creation endpoints are available.
- Mock AI prediction endpoints are available so frontend upload/result pages can connect before the real model workflow is complete.
- Frontend login, register, and dashboard pages are in progress; auth UI integration with backend endpoints is still being connected.

Implemented backend endpoints include:

- `GET /health`
- `GET /supabase/test`
- `POST /auth/register/patient`
- `POST /auth/login`
- `GET /patients/me`
- `GET /doctor/patients`
- `GET /doctor/patients/{patient_id}`
- `POST /doctor/examinations`
- `POST /ai/predict/mock`
- `POST /doctor/examinations/{examination_id}/predict`

## Contributors
- Nicholas
- Saladin
- Oslando
- Davinus
