# Radia Team Roles and Collaboration

This file defines the working split for the current two-person Radia team. It
should help each person move independently while still sharing the contracts
needed for integration.

## Current Team Split

### Adin - Backend, Data, Workflow, Documentation

Adin owns:

- Supabase schema, relationships, storage buckets, and environment setup.
- FastAPI backend routes, services, schemas, validation, and API contracts.
- Authentication foundation, role/profile data, patient privacy rules, and
  backend authorization milestones.
- Examination workflow APIs, upload/storage integration, mock AI endpoint,
  report/PDF backend, and backend testing.
- Project documentation, README/setup notes, testing checklist, and Git hygiene.

Primary branch:

- `backend`

### Nicholas - Frontend, UI, AI Integration

Nicholas owns:

- React/Vite frontend pages, layouts, shared UI components, styling, and route
  structure.
- Public login/register pages, patient pages, doctor pages, admin pages, and
  frontend state/navigation.
- Frontend API integration using backend contracts supplied by Adin.
- AI model cleanup and inference wrapper, including preprocessing requirements,
  labels, confidence output, and optional Grad-CAM.
- UI testing and frontend bug fixes.

Primary branch:

- `frontend-ai`

## Shared Responsibilities

Shared work happens at integration points:

- Frontend calls backend APIs.
- Backend calls AI wrapper/model code.
- Backend stores patient, examination, AI, and report data.
- Frontend displays backend results and errors.
- Both test the full demo workflow before merging to stable branches.

No one should edit the other person's owned area for a major change without
communicating first.

## Current Backend Contracts Nicholas Can Use

The current frontend/backend API contract lives in
[`docs/api-contract.md`](api-contract.md).

Use that file as the source of truth for:

- endpoint URLs
- request and response shapes
- auth header format
- expected error status codes
- temporary/mock endpoint notes
- frontend integration notes

Whenever Adin changes a backend endpoint or response shape, he should update
`docs/api-contract.md` in the same feature branch before merging to `dev`.

## Auth Decision

For Radia MVP:

- Frontend calls FastAPI backend auth endpoints.
- Frontend does not call Supabase Auth or database tables directly.
- Patient can self-register through `POST /auth/register/patient`.
- Doctor accounts will be created by an admin workflow later.
- Admin accounts may be created manually in Supabase for MVP/demo setup.
- Supabase secret/service key is backend-only and must never be committed or
  exposed to frontend code.
- Full protected route and role enforcement is a separate backend milestone.
- The first protected endpoints are already available for `GET /patients/me`
  and doctor/admin patient/examination setup routes.

## File Ownership

Adin primarily edits:

```text
backend/app/routes
backend/app/services
backend/app/schemas
backend/app/models
backend/app/utils
backend/app/ai when wiring backend integration
backend/backend.md
docs
README.md
backend/.env.example
```

Nicholas primarily edits:

```text
frontend/src/components
frontend/src/pages
frontend/src/layouts
frontend/src/routes
frontend/src/services
frontend/src/assets
frontend/package.json
backend/app/ai when preparing model inference code
```

Shared/high-risk files:

```text
README.md
AGENTS.md
docs/technical-design.md
backend/app/main.py
backend/requirements.txt
frontend/package.json
frontend/src/services/*
```

Before editing shared/high-risk files, tell the other person what will change.

## Branch Workflow

Branches:

- `main`: stable final/demo branch only.
- `dev`: integration branch.
- `backend`: Adin backend/data/docs branch.
- `frontend-ai`: Nicholas frontend/AI branch.

Before starting daily work on a feature branch:

```powershell
git switch dev
git pull origin dev
git switch backend
git merge dev
```

For Nicholas, replace `backend` with `frontend-ai`.

After finishing a tested unit of work on `backend`:

```powershell
git status --short
git add <files>
git commit -m "feat: describe change"
git push origin backend
git switch dev
git pull origin dev
git merge backend
git push origin dev
git switch backend
```

Use the same pattern for `frontend-ai` into `dev`.

## Merge Rules

Merge to `dev` only when:

- The app or relevant subsystem can run.
- The feature was manually tested.
- No secrets, `.env`, virtual environments, `node_modules`, generated caches,
  uploads, reports, or model checkpoint files are staged.
- The change is scoped and has a clear commit message.

Merge `dev` to `main` only for stable demo-ready snapshots.

## AI Handoff Requirements

Nicholas should provide these before real AI integration:

- Model file path/name and expected framework.
- Python inference function, preferably:

```python
def predict_xray(image_path: str) -> dict:
    return {
        "prediction": "Pneumonia",
        "confidence": 0.82,
    }
```

- Preprocessing details: image size, color mode, normalization, input shape.
- Output labels and confidence calculation.
- Sample Normal and Pneumonia X-Ray images for testing.
- Required Python libraries and versions.

Until this is ready, backend uses mock AI endpoints so frontend integration is
not blocked.

## Current Priority

Current priority is end-to-end MVP flow in small milestones:

1. Frontend auth forms connect to backend auth endpoints.
2. Frontend patient dashboard/profile reads `GET /patients/me`.
3. Frontend doctor patient list/detail/examination form reads the doctor workflow endpoints.
4. X-Ray upload storage and mock AI result persistence.
5. Doctor note, AI feedback, and examination status updates.
6. PDF report generation.
7. Full local demo test and documentation cleanup.
