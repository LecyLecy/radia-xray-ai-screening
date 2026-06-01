# Project Management

## Project Summary

Radia is a Software Engineering AOL project delivered as a final demo-ready MVP. The project follows a Modified Waterfall approach with AI feasibility validation and uses GitHub, Supabase, FastAPI, React, and documentation artifacts for evidence.

## Work Breakdown Structure

| Workstream | Deliverables |
| --- | --- |
| Documentation | Problem planning, SDLC, requirements, design, testing, risk/security/ethics, demo runbook. |
| Backend | Auth, role checks, patient/doctor/admin APIs, storage, AI prediction, report generation. |
| Frontend | English UI, login/register, patient portal, doctor workflow, admin management. |
| Database/Storage | Supabase schema, migrations, private buckets. |
| AI | Prediction wrapper, model path config, fallback handling. |
| PDF | Report generation, private upload, signed download. |
| DevOps | Backend CI, frontend CI, Docker build validation. |
| Finalization | Documentation cleanup, verification, stable `main` push. |

## Timeline

| Period | Focus | Output |
| --- | --- | --- |
| Planning | Problem, users, scope, SDLC selection | Project scope and SDLC docs |
| Requirements | FR/NFR/user stories/acceptance | Requirements document |
| Design | Architecture, data model, API, UI | Design and API docs |
| Implementation | Backend, frontend, Supabase, AI, PDF | Working MVP |
| Testing | Local checks, manual workflow, CI | Testing evidence |
| Finalization | Docs, README, stable branch | Final repository state |

## Milestones

| Milestone | Status |
| --- | --- |
| Repository and project structure created | Complete |
| Backend auth and Supabase integration | Complete |
| Frontend auth and role routing | Complete |
| Doctor scan workflow | Complete |
| AI prediction persistence | Complete |
| Patient history/detail | Complete |
| PDF report generation/download | Complete |
| Admin user management | Complete |
| English UI polish | Complete |
| Documentation finalization | Complete |

## Success Criteria

- Patient can register and log in.
- Doctor can complete scan workflow and final review.
- AI prediction returns Normal/Pneumonia with confidence to doctor/admin only.
- Patient can view only own final doctor-approved result.
- PDF report can be generated and downloaded.
- Admin can manage patient and medical staff accounts.
- CI and local verification pass.
- Final documentation is consistent with implementation.

## Tools

- GitHub for version control and CI.
- Supabase for auth, database, and storage.
- VS Code/Codex for implementation.
- Google Docs/Sheets can be used for final submission screenshots and tracking.
