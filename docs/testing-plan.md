# Testing Plan

## Testing Objectives

- Confirm patient registration, login, profile, history, detail, and report download.
- Confirm doctor scan workflow from patient email to final PDF report.
- Confirm admin user management and promotion workflow.
- Confirm role-based access and patient privacy.
- Confirm upload validation for file type and size.
- Confirm frontend and backend build checks pass.

## Test Levels

| Level | Scope |
| --- | --- |
| Unit | File validation, payload validation, helper formatting, AI fallback helpers. |
| Integration | Frontend API calls, backend Supabase reads/writes, storage upload, PDF upload. |
| System | End-to-end doctor scan and patient report workflow. |
| Acceptance | Demo scenario succeeds and matches requirements. |

## Manual System Test Cases

| ID | Scenario | Expected Result | Status |
| --- | --- | --- | --- |
| ST-01 | Register a new patient. | Account is created and can log in. | Ready for final demo |
| ST-02 | Login as patient. | User lands in patient history. | Ready for final demo |
| ST-03 | Login as doctor. | User lands in doctor dashboard. | Ready for final demo |
| ST-04 | Start new scan using registered patient email. | Examination, image, and AI prediction are created. | Ready for final demo |
| ST-05 | Upload unsupported X-Ray file. | Backend/frontend rejects the file. | Ready for final demo |
| ST-06 | Open patient detail before finalization. | Patient sees pending scan summary without AI confidence. | Ready for final demo |
| ST-07 | Save final doctor review. | Final diagnosis, final note, and feedback are saved. | Ready for final demo |
| ST-08 | Generate/download PDF. | Report row exists and signed URL opens PDF. | Ready for final demo |
| ST-09 | Open patient detail after finalization. | Patient sees final diagnosis, final note, and report download. | Ready for final demo |
| ST-10 | Delete examination as doctor/admin. | Examination and related metadata are removed. | Ready for final demo |
| ST-11 | Promote patient to medical staff as admin. | User role becomes doctor and can access doctor workspace after re-login. | Ready for final demo |

## Security and Privacy Tests

| ID | Scenario | Expected Result |
| --- | --- | --- |
| SEC-01 | Request protected endpoint with no token. | `401` returned. |
| SEC-02 | Patient requests another patient's examination. | `404` or access denial returned. |
| SEC-03 | Patient detail response includes AI prediction. | Response should keep AI metadata hidden/null. |
| SEC-04 | Signed report URL requested by unrelated patient. | Access denied. |
| SEC-05 | Supabase service key appears in frontend bundle. | Must not appear. |

## Automated Verification Commands

Backend:

```powershell
cd backend
python -m compileall app
```

Frontend:

```powershell
cd frontend
npm run lint
npm run build
```

CI:

- `Backend CI` on GitHub Actions.
- `Frontend CI` on GitHub Actions.

## Latest Local Verification Snapshot

| Check | Command | Expected |
| --- | --- | --- |
| Backend syntax | `python -m compileall app` | Pass |
| Frontend lint | `npm run lint` | Pass |
| Frontend production build | `npm run build` | Pass |

## Defect Log Format

| Bug ID | Date | Feature | Description | Severity | Status | Resolution |
| --- | --- | --- | --- | --- | --- | --- |
| BUG-001 | 2026-06-01 | Schema cache | Missing new examination columns in PostgREST schema cache. | High | Fixed/worked around | Added migration and backend fallback. |
| BUG-002 | 2026-06-01 | Patient final result | Patient detail did not show final diagnosis after finalization. | High | Fixed | Derived final diagnosis from stored final review metadata/report flow. |
| BUG-003 | 2026-06-01 | UI language | Mixed Indonesian/English UI. | Medium | Fixed | Converted user-facing frontend text to English. |

## Acceptance Checklist

- Patient data is scoped to the logged-in patient.
- Doctor can complete examination workflow.
- Patient can download final report.
- AI confidence is shown only to doctor/admin users.
- Final PDF includes disclaimer.
- UI is in English.
- CI/local build checks pass.
