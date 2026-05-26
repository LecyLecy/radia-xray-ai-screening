# DevOps Pipeline Guide

This document explains the current DevOps evidence setup for the Radia AOL project and what should be maintained until final submission.

## Current Setup

Radia currently has a backend CI pipeline and Docker build validation.

- GitHub Actions workflow: `.github/workflows/backend-ci.yml`
- GitHub Environment: `backend-ci`
- Backend Dockerfile: `backend/Dockerfile`
- Workflow name: `Backend CI`

The workflow runs on pushes and pull requests to `backend`, `dev`, and `main`, and can also be run manually with `workflow_dispatch`.

## What The Pipeline Checks

The `Backend CI` workflow runs these steps:

1. Checkout repository.
2. Setup Python 3.11.
3. Install backend dependencies from `backend/requirements.txt`.
4. Compile the backend with `python -m compileall app`.
5. Build the backend Docker image with `docker build -t radia-backend:ci .`.

This is a CI validation pipeline. It proves the backend can install dependencies, compile, and build a Docker image. It does not deploy the application yet and does not push the image to Docker Hub.

## Docker Setup

The backend Dockerfile uses:

- base image: `python:3.11-slim`
- working directory: `/app`
- dependency install from `requirements.txt`
- app copy from `backend/app`
- exposed port: `8000`
- startup command: `uvicorn app.main:app --host 0.0.0.0 --port 8000`

Local Docker test command from the `backend` folder:

```powershell
docker build -t radia-backend:ci .
docker run --env-file .env -p 8000:8000 radia-backend:ci
```

Do not commit `.env`; it is only used locally or in deployment environment configuration.

## GitHub Environment

The GitHub Environment should be named:

```text
backend-ci
```

For AOL evidence, it is enough that the environment exists and is referenced by the workflow. If environment secrets or variables are added, screenshot only the secret names, never the secret values.

Possible future secrets if Docker Hub publishing is added:

```text
DOCKER_HUB_USER
DOCKER_HUB_ACCESS_TOKEN
```

Possible future variables:

```text
APP_ENV=ci
```

## Screenshot Evidence For Submission

Use these screenshots for the AOL DevOps pipeline evidence:

1. GitHub `Settings -> Environments -> backend-ci`.
2. GitHub `Actions -> Backend CI` successful green run.
3. Successful run detail showing the steps `Compile backend` and `Build backend Docker image`.
4. The workflow file `.github/workflows/backend-ci.yml`.
5. The Dockerfile `backend/Dockerfile`.

If an older workflow run is red, do not use it as the main evidence. Use the latest successful green run, or manually trigger a new run on the `backend` branch and screenshot the successful result.

## Future DevOps Tasks

Before final submission or deployment, decide whether to keep CI-only validation or extend the pipeline.

Minimum final setup:

- Keep `Backend CI` green on `backend`, `dev`, and `main`.
- Keep Docker build validation passing.
- Capture updated screenshots for the final report.

Optional next improvements:

- Add frontend CI with `npm install` and build/lint checks.
- Add Docker Hub login and image push after adding safe repository secrets.
- Add deployment steps for Render, Railway, or another backend host.
- Add branch protection requiring `Backend CI` to pass before merging to `main`.

## Safety Rules

- Never commit `.env` files.
- Never screenshot or publish secret values, access tokens, Supabase service keys, or signed download URLs.
- Keep production deployment credentials in GitHub Environment secrets only.
- Use the Docker Hub push step only after the team agrees on Docker Hub account ownership and token management.
