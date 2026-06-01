# System Design

## Actors

- Patient
- Doctor / Medical Staff
- Admin
- Radia Backend
- Supabase Auth, Database, and Storage
- AI Prediction Module
- PDF Report Generator

## High-Level Architecture

```text
Browser
  -> React/Vite frontend
  -> FastAPI backend
  -> Supabase Auth / PostgreSQL / Storage
  -> AI prediction module
  -> ReportLab PDF generator
```

The frontend never calls Supabase directly. All protected actions go through the FastAPI backend, which validates bearer tokens, checks user roles, and controls private data access.

## Main Workflows

### Patient Registration and Login

1. Patient submits registration form.
2. Backend creates Supabase Auth user.
3. Backend creates `profiles` and `patient_profiles` rows.
4. Patient logs in.
5. Backend returns access token, refresh token, and role.
6. Frontend redirects patient to examination history.

### Doctor Scan Workflow

1. Doctor logs in.
2. Doctor opens Start New Scan.
3. Doctor enters registered patient email, symptoms, and preliminary solution.
4. Doctor uploads JPG/PNG X-Ray.
5. Backend validates file.
6. Backend creates examination row.
7. Backend uploads X-Ray to private storage.
8. Backend runs AI prediction.
9. Backend stores image and prediction metadata.
10. Doctor reviews AI result and confidence.
11. Doctor saves final diagnosis, final note, and AI feedback.
12. Backend generates or updates PDF report.
13. Examination becomes ready for patient.

### Patient Report Workflow

1. Patient logs in.
2. Patient opens examination history.
3. Patient opens examination detail.
4. If status is `not_ready`, patient sees symptoms and preliminary solution only.
5. If status is `ready`, patient sees final diagnosis, final doctor note, and PDF download.
6. Patient downloads report through signed URL endpoint.

### Admin Workflow

1. Admin logs in.
2. Admin manages patients and medical staff from the directory.
3. Admin can promote an existing patient to medical staff.
4. Admin can access doctor workflow screens for operational support.

## Data Model

| Entity | Purpose |
| --- | --- |
| `profiles` | Auth user role mapping. |
| `patient_profiles` | Patient identity and profile picture path. |
| `doctor_profiles` | Medical staff identity, license number, specialization. |
| `admin_profiles` | Admin identity. |
| `examinations` | Patient/doctor examination record and status. |
| `xray_images` | X-Ray metadata and private storage path. |
| `ai_predictions` | AI result, confidence, model name, mock flag. |
| `doctor_feedbacks` | Doctor validation of AI result and final review fallback metadata. |
| `pdf_reports` | PDF report private storage path and generation metadata. |

## Status Model

| Status | Meaning |
| --- | --- |
| `not_ready` | Examination is pending doctor finalization or report generation. |
| `ready` | Final doctor review and report are ready for patient. |

## Privacy Design

- Patient endpoints derive patient identity from the bearer token.
- Patient endpoints never accept arbitrary patient IDs for own history/detail.
- Patient detail intentionally hides AI prediction and confidence.
- X-Ray and PDF files are private storage objects.
- Signed URLs are temporary and generated only after authorization.

## UI Structure

| Area | Pages |
| --- | --- |
| Public | Login, Register |
| Patient | Examination History, Examination Detail, Profile |
| Doctor | Dashboard, Start New Scan, My Examinations, Examination Detail |
| Admin | User Directory, Add Medical Staff, doctor workflow access |

## Design Principles

- Separation of concerns between routes, services, schemas, AI, storage, and reporting.
- Backend-enforced access control.
- AI as second opinion only.
- Patient-facing pages show doctor-approved final information only.
- Consistent English clinical dashboard UI.
