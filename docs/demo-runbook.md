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
- One doctor user in Supabase Auth.
- Matching doctor row in `profiles` with role `doctor`.
- Matching row in `doctor_profiles`.
- Admin users are created manually for the MVP. Medical staff users can be
  created from the admin `Medical Staff` screen.
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
2. Open Patient Registry.
3. Select the demo patient.
4. Upload a JPG or PNG X-Ray image under 10 MB.
5. Run AI classification.
6. Save doctor note and AI feedback.
7. Generate and open the PDF report.
8. Login as the patient.
9. Open Examination History.
10. Open the examination detail and download the PDF report.

Optional admin check:

1. Login as admin.
2. Open Medical Staff.
3. Create a doctor account.
4. Confirm the new user appears in the medical staff table and can sign in.

## Expected Evidence

- Doctor UI shows AI result, confidence, doctor note, feedback, and report
  ready state.
- Supabase `xray_images`, `ai_predictions`, `doctor_feedbacks`, and
  `pdf_reports` tables contain rows for the examination.
- Supabase Storage contains the X-Ray image and PDF report object.
- Patient UI can download the PDF report through the signed URL endpoint.
- GitHub `Backend CI` and `Frontend CI` latest runs are green.
