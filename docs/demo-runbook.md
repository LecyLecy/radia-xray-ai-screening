# Demo Runbook

Use this checklist to prepare a repeatable Radia MVP demo without exposing
secrets.

## Required Local Services

1. Start backend from `backend`:

```powershell
.\.venv\Scripts\activate
uvicorn app.main:app --reload
```

2. Start frontend from `frontend`:

```powershell
npm install
npm run dev
```

3. Confirm the frontend uses the backend URL:

```text
VITE_API_BASE_URL=http://127.0.0.1:8000
```

For deployed frontend testing, confirm the backend `CORS_ALLOW_ORIGINS` includes
the Vercel production URL.

## Required Supabase Demo Data

Create or confirm these records in Supabase before the demo:

- Use the same frontend sign-in page for patient, doctor, and admin accounts.
- Public registration creates patient accounts only.
- Doctor/medical staff users start as registered patient accounts.
- Admin users are created manually for the MVP. Medical staff users are
  promoted from existing patient accounts in the admin `Medical Staff` screen.
- One patient user created through the frontend register page or backend
  `POST /auth/register/patient`.
- Private storage buckets:
  - `xray-images`
  - `pdf-reports`
  - `profile-pictures`
  - `gradcam-results`

Do not publish passwords, service-role keys, bearer tokens, or signed download
URLs in screenshots.

## Demo Flow

1. Login as doctor.
2. Open Start New Scan.
3. Enter the registered patient email.
4. Fill symptoms/keluhan and preliminary solution.
5. Upload a JPG or PNG X-Ray image under 10 MB.
6. Submit to create the examination, upload the scan, and run mock AI.
7. Confirm the app redirects to the doctor examination detail.
8. Open My Examinations and confirm the scan is in the doctor's own queue.
9. Login as the patient.
10. Open Examination History and the detail page.
11. Confirm the pending page shows doctor/date/status/scan/symptoms/preliminary solution only, with no AI result or confidence.
12. Login as doctor again.
13. Open the examination detail, choose final diagnosis, fill final doctor note, and save final review with AI feedback.
14. Generate and open the PDF report.
15. Login as patient again.
16. Confirm the patient detail now shows the final diagnosis, final doctor note, and PDF download when the report is ready.

Optional admin check:

1. Login as admin.
2. Open Medical Staff.
3. Search an existing patient email.
4. Fill license number and specialization.
5. Promote the patient to medical staff.
6. Logout and login as that same user again.
7. Confirm the user lands in the medical staff workspace and appears in the medical staff table.

## Expected Evidence

- Doctor UI shows AI result/confidence as decision support, final diagnosis,
  final note, feedback, and report ready state.
- Patient UI never shows AI result or confidence. Pending patients only see the
  temporary summary; reviewed patients see the doctor's final diagnosis and
  final note.
- Supabase `xray_images`, `ai_predictions`, `doctor_feedbacks`, and
  `pdf_reports` tables contain rows for the examination.
- Supabase Storage contains the X-Ray image and PDF report object.
- Patient UI can download the PDF report through the signed URL endpoint.
- GitHub `Backend CI` and `Frontend CI` latest runs are green.
