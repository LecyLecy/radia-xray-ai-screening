# Requirements

## Stakeholders

| Stakeholder | Interest |
| --- | --- |
| Patient | View own pending/final examinations and download final PDF reports. |
| Doctor / Medical Staff | Create and review X-Ray examinations with AI decision support. |
| Admin | Manage user accounts and medical staff promotion. |
| Development Team | Build, test, document, and maintain the system. |
| Lecturer / Evaluator | Assess SDLC completeness and working demo evidence. |

## Functional Requirements

| ID | Requirement | Status |
| --- | --- | --- |
| FR-01 | Patient can register an account. | Implemented |
| FR-02 | All roles can log in from one shared login form. | Implemented |
| FR-03 | App redirects users by role after login. | Implemented |
| FR-04 | Patient can view and edit own profile data. | Implemented |
| FR-05 | Patient can upload a profile picture. | Implemented |
| FR-06 | Doctor/admin can view registered patients. | Implemented |
| FR-07 | Doctor can start a scan by patient email. | Implemented |
| FR-08 | Doctor can enter symptoms and preliminary solution. | Implemented |
| FR-09 | Doctor can upload JPG/PNG X-Ray files up to 10 MB. | Implemented |
| FR-10 | System stores X-Ray file metadata and private storage path. | Implemented |
| FR-11 | System runs AI prediction and stores result/confidence. | Implemented |
| FR-12 | Doctor can view AI result and confidence as decision support. | Implemented |
| FR-13 | Patient cannot view AI result or confidence. | Implemented |
| FR-14 | Doctor can save final diagnosis, final note, and AI feedback. | Implemented |
| FR-15 | System marks examination as ready after finalization/report flow. | Implemented |
| FR-16 | System generates PDF reports. | Implemented |
| FR-17 | Patient can download own report through signed URL. | Implemented |
| FR-18 | Admin can manage patient accounts. | Implemented |
| FR-19 | Admin can manage medical staff accounts. | Implemented |
| FR-20 | Admin can promote registered patients to medical staff. | Implemented |
| FR-21 | Doctor/admin can delete examinations when authorized. | Implemented |
| FR-22 | Grad-CAM visualization. | Future work |
| FR-23 | Admin examination CRUD page. | Future work |

## Non-Functional Requirements

| ID | Requirement | Implementation |
| --- | --- | --- |
| NFR-01 | Authentication required for protected data. | Bearer token validation in backend. |
| NFR-02 | Role-based authorization. | Backend role checks for patient, doctor, and admin workflows. |
| NFR-03 | Patient privacy. | Patient endpoints resolve identity from token and filter own records only. |
| NFR-04 | Secret protection. | Supabase service key is backend-only and `.env` is ignored. |
| NFR-05 | File validation. | Backend validates file type and size before storage. |
| NFR-06 | Private file access. | Reports and images use private storage and signed URLs. |
| NFR-07 | Usability. | English clinical dashboard UI with consistent cards, tables, forms, and badges. |
| NFR-08 | Maintainability. | Routes, services, schemas, AI, storage, and report logic are separated. |
| NFR-09 | CI validation. | Backend compile/Docker build and frontend lint/build workflows. |
| NFR-10 | Ethical AI use. | AI is described as decision support and final decision belongs to doctor. |

## User Stories

| ID | Story |
| --- | --- |
| US-01 | As a patient, I want to register so I can access my examination history. |
| US-02 | As a patient, I want to see only my own reports so my data stays private. |
| US-03 | As a doctor, I want to start a scan by patient email so I can work with registered patients. |
| US-04 | As a doctor, I want AI decision support so I can compare the model output with my clinical review. |
| US-05 | As a doctor, I want to finalize diagnosis and notes so the patient receives doctor-approved information. |
| US-06 | As an admin, I want to manage users so the system can be prepared for demo/operations. |

## Acceptance Criteria

| ID | Acceptance Criteria |
| --- | --- |
| AC-01 | Patient registration creates an auth user, profile row, and patient profile row. |
| AC-02 | Login returns tokens and role, and the frontend redirects correctly. |
| AC-03 | Doctor can start a scan with patient email, symptoms, preliminary solution, and X-Ray upload. |
| AC-04 | Invalid X-Ray file types or oversized files are rejected. |
| AC-05 | Doctor sees AI result and confidence after scan creation. |
| AC-06 | Patient pending detail shows scan, symptoms, and preliminary solution but not AI metadata. |
| AC-07 | Doctor finalization saves final diagnosis, final note, and feedback. |
| AC-08 | Ready patient detail shows final diagnosis and final doctor note. |
| AC-09 | PDF report contains patient data, doctor data, final diagnosis, final note, and disclaimer. |
| AC-10 | Patient can download only their own PDF report. |

## MoSCoW Priority

### Must Have

- Authentication and role access.
- Patient registration/profile/history.
- Doctor scan workflow.
- X-Ray upload and validation.
- AI prediction result and confidence.
- Final doctor review.
- PDF generation and patient download.
- Patient privacy.

### Should Have

- Profile picture upload.
- AI feedback.
- Admin patient/doctor management.
- Examination deletion.
- Schema-cache fallback for demo resilience.

### Could Have

- Grad-CAM visualization.
- Expanded dashboard analytics.
- Automated API test suite.
- Cloud backend deployment.

### Won't Have

- Automatic final diagnosis.
- Hospital system integration.
- Appointment scheduling.
- Payments/insurance.
- Model retraining.
