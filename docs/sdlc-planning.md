# SDLC Planning

## Selected SDLC Model

Radia uses a Modified Waterfall model with early AI feasibility validation.

This model fits the project because Radia needs formal documentation, clear requirements, structured design, implementation, testing, and final submission evidence. The AI feasibility check is placed early so the team can verify whether the selected model can load, process chest X-Ray images, and return usable prediction output before the rest of the workflow depends on it.

## SDLC Phases

| Phase | Final Deliverable |
| --- | --- |
| Planning | Problem statement, target users, scope boundary, project objective. |
| Requirements | Functional requirements, non-functional requirements, user stories, acceptance criteria, MoSCoW priority. |
| System Design | Architecture, data model, main workflows, API contract, UI structure. |
| Implementation | FastAPI backend, React frontend, Supabase integration, AI wrapper, PDF generator. |
| Testing and Integration | Local compile/lint/build, manual workflow tests, CI pipeline. |
| Deployment / Demo | Local demo runbook, Supabase data checklist, GitHub Actions evidence. |
| Maintenance Planning | Known limitations, future improvements, security rules. |

## Early AI Feasibility Result

| Check | Result |
| --- | --- |
| Accept X-Ray image input | Supported through multipart upload. |
| Validate JPG/PNG format and size | Implemented in backend storage service. |
| Load configured AI model | Supported when PyTorch model path is available. |
| Fallback when model/dependencies are unavailable | Deterministic mock output with `is_mock=true`. |
| Return prediction values | `Normal` or `Pneumonia`. |
| Return confidence | `confidence_score` and `confidence_percentage`. |
| Grad-CAM | Future work. |

## Final Phase Mapping

1. Planning defined Radia as an academic clinical decision-support prototype.
2. Requirements prioritized the doctor scan workflow, patient report access, and role-based privacy.
3. Design separated frontend UI, backend API, Supabase data/storage, AI inference, and PDF generation.
4. Implementation completed auth, profiles, doctor scan workflow, AI persistence, final review, report generation, patient history/detail, admin management, and deletion.
5. Testing validates backend compile, frontend lint/build, and core manual demo workflow.
6. Finalization updates documentation and pushes the stable result to `main`.

## Maintenance Plan

- Keep secrets in environment variables only.
- Keep migrations in `supabase/migrations/`.
- Keep `dev` for integration work and `main` for stable demo snapshots.
- Add automated API tests in future work.
- Keep AI output clearly labeled as support only.
