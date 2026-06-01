# Technical Design

## Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite 8, React Router, Axios, Tailwind CSS |
| Backend | FastAPI, Python 3.11 |
| Auth | Supabase Auth |
| Database | Supabase PostgreSQL |
| Storage | Supabase Storage |
| AI | PyTorch, Torchvision, DenseNet-style pneumonia classifier |
| PDF | ReportLab |
| CI | GitHub Actions |
| Container | Docker backend image validation |

## Backend Modules

| Module | Responsibility |
| --- | --- |
| `routes` | HTTP endpoints and dependency injection. |
| `schemas` | Pydantic request/response contracts. |
| `services/auth_service.py` | Registration and login through Supabase Auth. |
| `services/user_service.py` | Current profile, role lookup, profile updates. |
| `services/examination_service.py` | Patient lookup, examination workflow, final review, deletion. |
| `services/storage_service.py` | File validation, upload, signed URL, delete helpers. |
| `services/ai_service.py` | AI prediction wrapper and deterministic fallback. |
| `services/report_service.py` | PDF data loading, generation, upload, report metadata. |
| `ai` | Model loading, preprocessing, prediction, optional Grad-CAM placeholder. |

## Frontend Modules

| Module | Responsibility |
| --- | --- |
| `components` | Shared UI primitives: Button, Card, FormInput, Table, Navbar, Sidebar, StatusBadge. |
| `layouts` | Protected dashboard layout. |
| `routes` | Role-protected route tree. |
| `services` | Axios API wrapper and endpoint functions. |
| `pages/public` | Login and patient registration. |
| `pages/patient` | Patient profile/history/detail. |
| `pages/doctor` | Dashboard, scan workflow, examination detail. |
| `pages/admin` | User directory and medical staff promotion. |

## Database and Storage

Expected storage buckets:

| Bucket | Public | Limit | MIME Types |
| --- | --- | --- | --- |
| `profile-pictures` | No | 2 MB | JPG, PNG, WEBP |
| `xray-images` | No | 10 MB | JPG, PNG |
| `pdf-reports` | No | 10 MB | PDF |

Migration files:

- `20260601010000_doctor_owned_examination_flow.sql`
- `20260601020000_reload_postgrest_schema.sql`

The backend includes defensive handling for Supabase PostgREST schema-cache delays. If new final review columns are temporarily missing from schema cache, final review metadata is stored in encoded doctor feedback notes so the demo workflow can still complete.

## AI Strategy

1. Validate uploaded image.
2. Store X-Ray object in private Supabase Storage.
3. Preprocess image for model input.
4. Run configured PyTorch model when available.
5. Return `Normal` or `Pneumonia` and confidence score.
6. Fall back to deterministic mock prediction if model dependencies or checkpoint are unavailable.
7. Mark fallback responses with `is_mock=true`.

## PDF Strategy

PDF reports include:

- Report title.
- Patient information.
- Doctor information.
- Examination date.
- Final diagnosis.
- Final doctor note.
- Medical disclaimer.

Internal storage object paths and AI confidence are not shown to patients in the UI.

## Local Commands

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
npm run dev
npm run lint
npm run build
```

## Deployment Direction

- Frontend can be deployed to Vercel.
- Backend can be deployed to Render, Railway, or another Python host.
- Supabase remains the managed auth/database/storage layer.
- Local demo remains supported and is acceptable for final evidence if deployment is not used.
