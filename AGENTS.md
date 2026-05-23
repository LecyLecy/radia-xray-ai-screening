# AGENTS.md

This file is a compact operating guide for AI coding agents working on Radia.
The full project source of truth is in `docs/`; use this file as the quick-start
summary before editing code.

## Project Summary

Radia is a web-based X-Ray examination management system with AI-assisted
pneumonia screening. It is an academic Software Engineering prototype for
structured clinical workflow support in resource-limited healthcare settings.

The AI feature is a second-opinion aid only. It must never be presented as an
automatic final diagnosis or a replacement for a doctor.

## Read These Docs First

Before making major feature, architecture, security, or workflow changes, read
the relevant files in `docs/`:

- `docs/problem-planning.md`: problem, scope, users, MVP boundaries.
- `docs/requirements.md`: stakeholders, roles, requirements, acceptance criteria.
- `docs/system-design.md`: workflow, actors, ERD/class/API design direction.
- `docs/technical-design.md`: stack, modules, storage, AI, PDF, deployment plan.
- `docs/risk-security-ethics.md`: privacy, role access, AI ethics, disclaimer.
- `docs/testing-plan.md`: required unit, integration, system, and acceptance tests.
- `docs/development-planning.md`: implementation order and coding conventions.
- `docs/ui-prompt.md`: frontend visual style and required UI components.

## Intended Stack

- Frontend: React, Vite, Tailwind CSS.
- Backend: FastAPI, Python.
- Database: Supabase PostgreSQL.
- Storage: Supabase Storage.
- AI: PyTorch model, DenseNet/CheXNet-style Normal/Pneumonia screening.
- Reports: PDF generation with ReportLab or WeasyPrint.
- Deployment target: Vercel for frontend, Render or Railway for backend.

## Main Roles

- Patient: register/login, view own profile, view own examination history,
  view own examination detail, download own PDF reports.
- Doctor: login, view patients, create examinations, upload X-Ray images, run
  AI screening, view confidence score and optional Grad-CAM, add notes, validate
  AI output, generate PDF reports.
- Admin: login, manage patients, doctors, examinations, uploads, AI results,
  and PDF reports.

Patients must only access their own records. Doctors and admins may access
patient examination workflows according to role rules.

## MVP Workflow

The core workflow is:

1. Patient registers an account.
2. Doctor or admin logs in.
3. Doctor/admin selects a patient.
4. Doctor/admin creates an examination record.
5. Doctor/admin uploads a chest X-Ray image.
6. Backend validates and stores the image.
7. AI returns `Normal` or `Pneumonia` with a confidence score.
8. Backend stores the prediction.
9. Doctor adds a note and validates the AI output as correct, incorrect, or uncertain.
10. System generates a PDF report with patient data, doctor data, AI result,
    doctor note, and medical disclaimer.
11. Patient logs in and downloads their own report.

## Architecture Rules

- Keep a layered client-server architecture.
- Frontend must call backend APIs; it must not access database, storage, or AI
  model directly.
- Backend routes handle HTTP request/response only.
- Backend services contain business logic.
- Backend schemas define request/response validation.
- AI code belongs in `backend/app/ai`.
- Report generation belongs in a dedicated report module/service.
- Storage logic should stay separate from route handlers.

## Backend Conventions

- Use snake_case for Python files, functions, and variables.
- Keep API endpoint names lowercase and consistent with the docs.
- Frontend calls backend auth APIs; it should not call Supabase Auth or tables
  directly for Radia MVP workflows.
- Patient registration is public. Doctor accounts are created by admin workflow.
  Admin accounts may be created manually for MVP/demo setup.
- Validate uploaded X-Ray files before storage or prediction.
- Accept only JPG, JPEG, and PNG for X-Ray uploads unless requirements change.
- Never store plaintext passwords.
- Never hardcode secrets, Supabase keys, JWT secrets, or model paths.
- Use environment variables based on `.env.example`.

## Frontend Conventions

- Use React components with PascalCase.
- Pages should focus on layout and screen composition.
- API calls should live in frontend service modules.
- Keep patient, doctor, and admin screens clearly separated.
- Follow `docs/ui-prompt.md`: professional medical dashboard, white background,
  blue primary color, gray neutrals, clear tables, forms, cards, and status badges.
- Avoid flashy landing-page styling, complex animation, and colorful gradients.

## Privacy, Security, And Ethics

- Treat patient data, X-Ray images, AI results, and PDF reports as sensitive.
- Enforce authentication for protected pages and backend endpoints.
- Enforce backend authorization, not just frontend route hiding.
- Patients cannot view other patients' data.
- PDF reports and uploaded files must not be public by default.
- Include the medical disclaimer on AI result views and PDF reports.
- Require doctor review/validation before a report is considered finalized.
- Keep Grad-CAM optional; do not block the MVP on it.
- Use a mock AI fallback only if model integration blocks the workflow, and
  document that fallback clearly.

## Testing Priorities

Prioritize tests and manual verification in this order:

1. Patient registration, login, logout, and protected route behavior.
2. Role-based access and patient privacy.
3. Doctor examination workflow from patient selection to report generation.
4. X-Ray upload validation and storage.
5. AI prediction response format: result and confidence score.
6. Doctor note and AI feedback persistence.
7. PDF generation with required sections and disclaimer.
8. Patient report download limited to own reports.
9. Admin management workflow.

Use the test cases and acceptance checklist in `docs/testing-plan.md` when
adding or changing features.

## Git And Collaboration

- Current planning expects `main` as stable demo code and feature branches for
  development work.
- Preserve unrelated user changes in the worktree.
- Do not commit `.env`, model files, uploads, generated reports, or local virtual
  environments.
- Keep commits scoped and use the documented prefixes when possible: `feat`,
  `fix`, `docs`, `test`, `refactor`, `chore`, or `style`.

## Current Repo Status Reminder

The implementation is now past the initial scaffold. The backend has health,
Supabase connection, patient registration/login, current patient profile,
doctor/admin patient list/detail, examination creation, and mock AI prediction
endpoints. The doctor workflow prediction endpoint now handles X-Ray upload
storage and AI result persistence against Supabase for MVP testing. Doctor note
and AI feedback persistence are also implemented and tested. PDF report
generation and signed report download are implemented for reviewed examinations.
The frontend has early auth and dashboard pages that are being wired to the
backend contracts. The next MVP order is patient examination history/report
access, then full workflow hardening.

Please stick to the plan of every .md in AGENTS.md and the docs' folder .md (other .md and requirements, u could change for every progress), dont change those .md unless there is something that are genuinely needed a change, like for example the plan on some side does not align with the plant of the other side, which means we need to actually change the base plan, or maybe u can change if if u want to add more information, but dont change the initial plan if not needed

terus setiap aku bilang commit & push, terserah kamu mau commit di branch current doang, atau mau commit ke dev juga, atau bahkan menurut mu bisa push ke main setelah testing2, liat aja yang di commit dan push itu udh ready ke dev atau main belum
