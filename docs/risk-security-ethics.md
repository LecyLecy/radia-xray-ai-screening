# Risk, Security, and Ethics

## Risk Register

| Risk | Probability | Impact | Mitigation | Status |
| --- | --- | --- | --- | --- |
| Supabase schema cache lags after migration. | Medium | High | Add migration and backend fallback for missing final review columns. | Mitigated |
| AI model unavailable locally or in hosting. | Medium | Medium | Deterministic mock fallback with `is_mock=true`. | Mitigated |
| Patient sees another patient's data. | Low | Critical | Backend token-derived patient filtering and report authorization. | Mitigated |
| Patient sees AI confidence as diagnosis. | Low | High | Patient endpoints/UI hide AI prediction metadata. | Mitigated |
| Secret key leaked. | Low | Critical | `.env` ignored; service key backend-only; docs warn against screenshots. | Mitigated |
| Unsupported file upload. | Medium | Medium | Backend validates MIME type and file size. | Mitigated |
| PDF generation fails during demo. | Medium | High | Local verification and report regeneration path. | Mitigated |
| Free hosting cannot run AI model. | Medium | Medium | Local demo remains supported; fallback prediction available. | Accepted |

## Security Controls

- Protected endpoints require bearer tokens.
- Backend reads role from `profiles`.
- Patient endpoints derive the current patient from the token.
- Doctor endpoints restrict doctors to their own examination queue/detail where applicable.
- Admin endpoints require admin role.
- X-Ray images and PDF reports are private storage objects.
- Signed URLs are generated only after authorization.
- File upload accepts only configured MIME types and size limits.
- Supabase service key is never used in frontend code.

## Privacy Controls

Patient data includes name, email, phone, age, gender, profile picture, X-Ray image, examination history, final doctor result, and report. Privacy is protected by:

- Backend ownership checks.
- Private storage.
- Signed report downloads.
- Patient-only filtering.
- No public storage URLs in UI.
- No AI confidence shown to patient users.

## AI Ethics

Radia is clinical decision support only.

Medical disclaimer:

```text
This AI assisted result is provided for clinical decision support only. It is not a final medical diagnosis and must not replace professional medical judgment. The final interpretation and clinical decision remain the responsibility of the examining doctor.
```

Ethical safeguards:

- Doctor must finalize diagnosis and note.
- AI output is not automatically patient-facing.
- PDF includes a disclaimer.
- Doctor feedback is stored for future evaluation.
- The app avoids claiming regulatory or clinical certification.

## Repository Safety Rules

- Never commit `.env`, keys, tokens, signed URLs, private screenshots, model checkpoints, uploaded images, or generated reports.
- Do not expose Supabase service-role key in README or docs.
- Use redacted screenshots for final evidence.
- Keep migrations reviewed before applying to remote database.
