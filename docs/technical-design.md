
**# Architecture and Technical Design

# Tujuan

1. Tech stack apa yang dipakai?
2. Arsitektur sistemnya seperti apa?
3. Database dan storage pakai apa?
4. AI model masuk ke sistem lewat cara apa?
5. PDF report dibuat di mana?
6. Struktur repository bagaimana supaya gampang di-pull dan dijalankan?
7. Deployment nanti arahnya ke mana?

# Technical Direction

* Web Based Application
* Layered Client Server Architecture
* Frontend Web Interface
* Backend API
* Database
* Storage
* AI Inference Service
* PDF Report Generator

# Tech Stack

* Frontend

  * React
  * Vite
  * Tailwind CSS
* Backend
* FastAPI
* Python
* Database
* Supabase PostgreSQL
* Storage
* Supabase Storage
* AI Model
* PyTorch Model
* DenseNet or CheXNet Based Model
* PDF Generator
* ReportLab or WeasyPrint
* Version Control
* GitHub
* Project Management
* Google Docs
* Google Sheets
* Deployment
* Vercel
* Render or Railway

# System Architecture

* Client Layer

  * Patient Portal
  * Doctor Workspace
  * Admin Workspace
* Frontend Layer
* React Web Application
* Role Based Routing
* Form Validation
* Upload Interface
* Backend API Layer
* Authentication Module
* Profile Module
* Examination Module
* AI Prediction Module
* Report Module
* Data Layer
* Supabase PostgreSQL
* Supabase Storage
* AI Layer
* Image Preprocessing
* Pneumonia Screening Model
* Prediction Output
* Grad CAM Optional
* Reporting Layer
* PDF Report Generator
* Alur
* Patient Doctor Admin
* Frontend Web App
* Backend API
* Database Storage AI Model PDF Generator

# Module Architecture

* Auth Module

  * User login
  * User role checking
  * Session or token validation
  * Patient self-registration through backend API
  * Doctor accounts created by admin workflow
  * Admin accounts created manually for MVP/demo setup
* Profile Module
* Patient profile
* Doctor profile
* Admin account
* Examination Module
* Create examination
* Upload X Ray
* Save examination result
* View history
* AI Module
* Preprocess image
* Run prediction
* Return result and confidence
* Feedback Module
* Save doctor validation
* Save correct incorrect uncertain status
* Report Module
* Generate PDF
* Save report URL
* Allow authorized download
* Storage Module
* Save X Ray image
* Save profile picture
* Save PDF report

# Authentication Implementation Strategy

* Frontend calls FastAPI backend auth endpoints; it does not call Supabase Auth
  or database tables directly.
* Backend uses Supabase Auth to create and authenticate users.
* Patient registration is public and creates auth user, `profiles`, and
  `patient_profiles` rows.
* Doctor accounts are created by admin workflow, not by public registration.
* Admin accounts may be created manually in Supabase for MVP/demo setup.
* Supabase secret/service key is backend-only and must never be exposed in
  frontend code, screenshots, README examples, or committed files.
* The first protected-route layer is implemented for current patient profile
  lookup and doctor/admin patient/examination setup routes.
* More complete role-based authorization is still needed for upload, AI result,
  feedback, report, and admin management workflows.

# Database Strategy (Supabase PostgreSQL)

* Tabel utama
  * users
  * patient_profiles
  * doctor_profiles
  * admin_profiles
  * examinations
  * xray_images
  * ai_predictions
  * doctor_feedbacks
  * Pdf_reports
* Relasi utama
* users to patient_profiles
* users to doctor_profiles
* users to admin_profiles
* patient_profiles to examinations
* doctor_profiles to examinations
* examinations to xray_images
* examinations to ai_predictions
* examinations to doctor_feedbacks
* examinations to pdf_reports

# Storage Strategy

1. Untuk simpan

* Profile Pictures
* Patient profile picture
* Doctor profile picture
* X Ray Images
* Uploaded chest X Ray image
* AI Output
* Grad CAM image if available
* PDF Reports
* Generated examination report

2. Bucket
   1. profile-pictures
   2. xray-images
   3. gradcam-results
   4. Pdf-reports

3. Supabase bucket settings

| Bucket | File size limit | Allowed MIME types |
| ------ | --------------- | ------------------ |
| profile-pictures | 2 MB | image/jpeg, image/png, image/webp |
| xray-images | 10 MB | image/jpeg, image/png |
| gradcam-results | 10 MB | image/jpeg, image/png |
| pdf-reports | 10 MB | application/pdf |

Uploaded X-Ray files must follow the `xray-images` bucket limits: JPG/JPEG or
PNG only, maximum 10 MB. Backend validation should reject files outside these
limits before storage.

For MVP testing, doctor accounts are promoted from existing patient accounts by
an admin. The user first registers as patient, then admin updates `profiles.role`
to `doctor` through the backend promotion endpoint and creates/updates the
matching `doctor_profiles` row. The AI prediction enum in Supabase must accept
`Normal` and `Pneumonia`, matching the backend API response contract.

# AI Integration Strategy

1. Alur

   1. Doctor uploads X Ray
   2. Backend receives image
   3. Backend saves image to storage
   4. Backend preprocesses image
   5. Backend sends image to AI model
   6. AI model returns prediction
   7. Backend saves prediction to database
   8. Frontend displays result
2. Output
3. Minimal
4. Prediction Result
5. Normal or Pneumonia
6. Confidence Score
7. Example 82 percent
8. Optional
9. Grad CAM Image
10. Visual explanation of model focus area

# PDF Report Strategy

1. Isi PDF Report
   1. Report Title
   2. Radia X Ray Examination Report
   3. Patient Information
   4. Full name
   5. Email
   6. Phone number
   7. Age
   8. Gender
   9. Doctor Information
   10. Doctor name
   11. Doctor email
   12. Doctor phone number
   13. Specialization
   14. License number
   15. Examination Information
   16. Examination date
   17. Examination status
   18. AI Result
   19. Prediction result
   20. Confidence score
   21. Doctor Review
   22. Doctor note
   23. AI feedback status
   24. Disclaimer
   25. AI output is not a final medical diagnosis
   26. Final decision remains under doctor responsibility

# API Design Draft (Might change)

1. Endpoints
   1. Auth

      1. POST /auth/register/patient
      2. POST /auth/login
      3. POST /auth/logout
   2. Patient
   3. POST /patients/register
   4. GET /patients/me
   5. GET /users/me/profile
   6. GET /patients/me/examinations
   7. GET /patients/me/examinations/{id}
   8. Doctor
   9. GET /doctor/patients
   10. GET /doctor/patients/search
   11. GET /doctor/patients/{id}
   12. POST /doctor/examinations
   13. POST /doctor/examinations/{id}/upload-xray
   14. POST /doctor/examinations/{id}/predict
   15. PATCH /doctor/examinations/{id}/note
   16. PATCH /doctor/examinations/{id}/feedback
   17. POST /doctor/examinations/{id}/report
   18. Admin
   19. GET /admin/patients
   20. POST /admin/patients
   21. PATCH /admin/patients/{id}
   22. GET /admin/doctors
   23. GET /admin/patients/search
   24. POST /admin/doctors/promote
   25. PATCH /admin/doctors/{id}
   26. GET /admin/examinations
   27. PATCH /admin/examinations/{id}
   28. DELETE /admin/examinations/{id}
   29. Report
   30. GET /reports/{id}/download

2. Temporary / Development Endpoints
   1. GET /supabase/test
      1. Development-only endpoint to verify backend Supabase connectivity.
      2. Should be removed or protected before demo/security hardening.
   2. POST /ai/predict/mock
      1. Temporary mock AI endpoint for frontend upload/result integration.
      2. Accepts JPG, JPEG, and PNG files and returns Normal/Pneumonia with confidence score.
      3. Does not store images or predictions in Supabase yet.

3. Current Implemented API Subset
   1. GET /health
   2. GET /supabase/test
   3. POST /auth/register/patient
   4. POST /auth/login
   5. GET /patients/me
   6. GET /doctor/patients
   7. GET /doctor/patients/search
   8. GET /doctor/patients/{patient_id}
   9. POST /doctor/examinations
   10. POST /ai/predict/mock
   11. POST /doctor/examinations/{examination_id}/predict

# Repository Structure

1. radia
2. Frontend

   1. Src
   2. Components
   3. pages
   4. layouts
   5. services
   6. hooks
   7. utils
   8. Assets
   9. package.json
3. Backend
4. app
5. main.py
6. routes
7. services
8. models
9. schemas
10. utils
11. ai
12. Reports
13. requirements.txt
14. README.md
15. docs
16. problem-planning.md
17. sdlc-planning.md
18. requirements.md
19. system-design.md
20. testing-plan.md
21. risk-security-ethics.md
22. .env.example
23. .gitignore

# Environment Setup Strategy

1. env. Example
   1. SUPABASE_URL
   2. SUPABASE_PUBLISHABLE_KEY
   3. SUPABASE_SECRET_KEY
   4. DATABASE_URL
   5. STORAGE_BUCKET_XRAY
   6. STORAGE_BUCKET_REPORT
   7. JWT_SECRET
   8. AI_MODEL_PATH
2. README Minimal
3. Project overview
4. Tech stack
5. Folder structure
6. Frontend setup
7. Backend setup
8. Environment variables
9. How to run locally
10. Demo accounts
11. Known limitations

# Ideal Deployment Direction

1. Frontend

   1. Vercel
2. Backend
3. Render or Railway
4. Database
5. Supabase PostgreSQL
6. Storage
7. Supabase Storage
8. Repository
9. GitHub

# Technical Risks

1. Risks
   1. AI model too heavy for free deployment
   2. Grad CAM integration takes too much time
   3. Supabase role access configuration is confusing
   4. PDF layout becomes inconsistent
   5. File upload fails due to size or format
   6. Frontend backend integration takes longer than expected
2. Mitigasi
3. Use local AI inference for demo if needed
4. Make Grad CAM optional
5. Start with simple role checking before complex rules
6. Use simple PDF layout first
7. Limit upload to JPG JPEG PNG
8. Implement core workflow before UI polish

**
