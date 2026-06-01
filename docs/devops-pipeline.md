# DevOps Pipeline

## Current CI Setup

Radia includes two GitHub Actions workflows:

| Workflow | File | Purpose |
| --- | --- | --- |
| Backend CI | `.github/workflows/backend-ci.yml` | Install backend dependencies, compile FastAPI app, build backend Docker image. |
| Frontend CI | `.github/workflows/frontend-ci.yml` | Install frontend dependencies, run ESLint, build Vite production bundle. |

Both workflows run on pushes and pull requests to `dev` and `main`, and can be triggered manually.

## Backend CI Steps

1. Checkout repository.
2. Setup Python 3.11.
3. Install `backend/requirements.txt`.
4. Run `python -m compileall app`.
5. Build Docker image as `radia-backend:ci`.

## Frontend CI Steps

1. Checkout repository.
2. Setup Node.js.
3. Run `npm ci`.
4. Run `npm run lint`.
5. Run `npm run build`.

## Local Docker Check

```powershell
cd backend
docker build -t radia-backend:ci .
docker run --env-file .env -p 8000:8000 radia-backend:ci
```

## Supabase DevOps Notes

- SQL migrations live in `supabase/migrations/`.
- Bucket settings are documented in `supabase/config.toml`.
- Supabase `.temp` link files are ignored by git.
- Remote database changes should be represented as migration files when possible.
- Do not commit Supabase tokens, service keys, or signed URLs.

## Final Evidence Checklist

- GitHub `Actions -> Backend CI` green run.
- GitHub `Actions -> Frontend CI` green run.
- Backend CI detail showing compile and Docker build.
- Frontend CI detail showing lint and build.
- Workflow files visible in repository.
- Backend Dockerfile visible in repository.
- README and docs updated on `main`.

## Future Improvements

- Add backend API tests to CI.
- Add Playwright smoke tests.
- Add deployment job after secrets and hosting are finalized.
- Add branch protection requiring CI to pass before merging into `main`.
