# Demo Runbook

## Local Services

Start backend:

```powershell
cd E:\Projects\radia-xray-ai-screening\backend
.\.venv\Scripts\activate
python -m uvicorn app.main:app --reload
```

Start frontend:

```powershell
cd E:\Projects\radia-xray-ai-screening\frontend
npm run dev
```

Open:

```text
http://localhost:5173
```

## Supabase Pre-Demo Checklist

- `profiles`, `patient_profiles`, `doctor_profiles`, `admin_profiles`, `examinations`, `xray_images`, `ai_predictions`, `doctor_feedbacks`, and `pdf_reports` exist.
- Latest migrations in `supabase/migrations/` are applied.
- Storage buckets exist:
  - `profile-pictures`
  - `xray-images`
  - `pdf-reports`
- Demo patient exists or can register from frontend.
- Demo doctor exists or can be promoted from a patient account by admin.
- Demo admin exists.
- No secret values or signed URLs are shown in screenshots.

## Main Demo Flow

1. Login as patient or register a new patient.
2. Logout.
3. Login as doctor.
4. Open Start New Scan.
5. Enter the registered patient email.
6. Fill Symptoms / Complaints.
7. Fill Preliminary Solution.
8. Upload a JPG or PNG chest X-Ray under 10 MB.
9. Click Create Scan and Run AI.
10. Confirm doctor detail shows AI result and confidence.
11. Logout and login as patient.
12. Open Examination History and detail.
13. Confirm pending detail shows scan, symptoms, preliminary solution, and no AI confidence.
14. Logout and login as doctor.
15. Open My Examinations and select the pending examination.
16. Choose final diagnosis.
17. Fill final doctor note.
18. Choose AI feedback.
19. Save final review and create/download PDF.
20. Logout and login as patient.
21. Open the same examination.
22. Confirm status is ready, final diagnosis and final doctor note are visible, preliminary solution is no longer the final patient guidance, and PDF can be downloaded.

## Optional Admin Flow

1. Login as admin.
2. Open User Directory.
3. Create/edit patient or medical staff as needed.
4. Open Add Medical Staff.
5. Search a registered patient email.
6. Fill license number and specialization.
7. Promote to medical staff.
8. Logout and login as that user.
9. Confirm access to doctor workspace.

## Expected Evidence

- Doctor sees AI prediction and confidence.
- Patient never sees AI confidence.
- Final report is downloadable.
- Supabase tables contain examination, X-Ray, AI prediction, feedback, and report rows.
- Storage contains X-Ray and PDF objects.
- GitHub Actions backend/frontend CI runs are green.

## Demo Safety

- Do not show `.env`.
- Do not show Supabase service key.
- Do not show bearer tokens.
- Do not publish signed URLs.
- Use dummy patient data and sample X-Ray images.
