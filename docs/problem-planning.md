# Problem Planning

## Project Theme

Health technology / clinical workflow support.

## Problem Statement

Healthcare facilities with limited radiology resources can experience delays in chest X-Ray screening because every result still needs clinical interpretation by qualified medical staff. When the number of available staff is limited, documentation can become inconsistent, initial screening may be delayed, and patients may not receive structured reports quickly.

Radia addresses this problem as a web-based X-Ray examination management system with AI-assisted pneumonia screening. The AI output is used only as decision support. The final diagnosis, final note, and patient-facing report remain under doctor responsibility.

## Target Users

| User | Main Need |
| --- | --- |
| Patient | Register, view own examination history, read final doctor result, and download own PDF report. |
| Doctor / Medical Staff | Start scans, upload X-Ray images, view AI support, finalize review, generate reports, and delete own examination records when needed. |
| Admin | Manage patient and medical staff accounts and promote registered patients into medical staff. |
| Evaluator / Lecturer | Review clear SDLC evidence, requirements, design, testing, and demo flow. |

## Goals

- Structure the chest X-Ray examination workflow.
- Store patient, examination, X-Ray, AI result, doctor feedback, and report data consistently.
- Help doctors review AI-assisted Normal/Pneumonia predictions and confidence scores.
- Prevent patients from seeing AI confidence or internal decision-support details.
- Generate private PDF reports for finalized examinations.
- Provide documentation and CI evidence for final project submission.

## MVP Scope

### In Scope

- Role-based authentication for patient, doctor, and admin.
- Patient registration and profile management.
- Doctor-owned scan workflow by registered patient email.
- X-Ray upload validation for JPG/PNG files up to 10 MB.
- AI-assisted pneumonia prediction with confidence score for doctor/admin.
- Symptoms and preliminary solution while the examination is pending.
- Final doctor diagnosis and final doctor note.
- AI feedback status: `correct`, `incorrect`, `uncertain`.
- PDF report generation and signed download access.
- Patient-owned history and detail access.
- Admin patient and medical staff management.
- Doctor examination deletion with related metadata cleanup.

### Out of Scope

- Automatic final medical diagnosis.
- Replacement of doctors or radiologists.
- Real hospital information system integration.
- Appointment scheduling and real-time hospital queueing.
- Payment, insurance, pharmacy, or medication recommendation.
- Automatic model retraining.
- Regulatory medical-device certification.
- Native mobile application.

## Role Permission Matrix

| Feature | Patient | Doctor | Admin |
| --- | --- | --- | --- |
| Register own account | Yes | No | No |
| Login | Yes | Yes | Yes |
| View own profile | Yes | Yes | Basic |
| Edit patient profile | Own profile only | No | Yes |
| View own examination history | Yes | No | No |
| View assigned examination queue | No | Yes | All |
| Start X-Ray scan | No | Yes | Yes |
| Upload X-Ray | No | Yes | Yes |
| Run AI prediction | No | Yes | Yes |
| View AI confidence | No | Yes | Yes |
| Save final review | No | Yes | Yes |
| Generate/download patient report | Own report only | Yes | Yes |
| Promote patient to medical staff | No | No | Yes |
| Delete examination | No | Own permitted records | Yes |

## Success Definition

Radia is considered complete for the final project when the doctor can complete a scan from registered patient email to PDF report, and the patient can log in afterward to view only the final doctor-approved result and download the PDF.
