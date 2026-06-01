# Development Planning

## Final Development Strategy

Radia was built as a layered monorepo:

1. Backend foundation: FastAPI, Supabase client, auth, schemas, role checks.
2. Frontend foundation: Vite, routes, protected layout, shared UI components.
3. Core workflow: patient registration, doctor scan creation, X-Ray upload, AI prediction, final review, PDF report.
4. Admin support: patient and medical staff management.
5. Privacy polish: patient-owned history/detail and hidden AI metadata.
6. Demo hardening: schema-cache fallback, deletion, English UI, image preview constraints, CI checks, documentation cleanup.

## Implemented Work

| Area | Final State |
| --- | --- |
| Auth | Patient registration, shared login, role-based redirects. |
| Patient | Profile, profile picture, history, detail, PDF download. |
| Doctor | Dashboard, start scan, own examination queue, final review, PDF download, deletion. |
| Admin | Patient/medical staff CRUD and patient promotion. |
| AI | Stored prediction workflow with fallback if model unavailable. |
| Storage | Private X-Ray, profile picture, and report objects. |
| PDF | Report generation and signed download endpoint. |
| CI | Backend compile/Docker build and frontend lint/build. |

## Current Branch Workflow

- `dev`: active integration branch.
- `main`: stable final/demo branch.
- Finalized changes should be tested on `dev`, committed, merged to `main`, and pushed.

## Coding Conventions

- Python files use `snake_case`.
- React components use `PascalCase`.
- React variables/functions use `camelCase`.
- Backend routes stay thin and call service-layer functions.
- Frontend pages handle layout; frontend services handle API calls.
- Secrets stay in `.env` only.
- Comments are added only for non-obvious logic.

## Local Development Commands

Backend:

```powershell
cd backend
.\.venv\Scripts\activate
python -m uvicorn app.main:app --reload
python -m compileall app
```

Frontend:

```powershell
cd frontend
npm install
npm run dev
npm run lint
npm run build
```

## Final Risk Controls Implemented

- Deterministic AI fallback when PyTorch/model setup is unavailable.
- Backend file validation for uploads.
- Private storage and signed downloads.
- Patient AI metadata hiding.
- Doctor-owned queue filtering.
- Supabase schema-cache fallback for final review metadata.
- CI verification before pushing final branch.

## Future Development

- Add automated backend API tests.
- Add Playwright browser smoke tests.
- Add Grad-CAM visualization.
- Add deployment pipeline.
- Add admin examination management page.
- Add audit logs for medical record changes.
