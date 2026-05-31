alter table public.examinations
  add column if not exists symptoms_description text,
  add column if not exists preliminary_solution text,
  add column if not exists final_diagnosis_result text
    check (final_diagnosis_result in ('Normal', 'Pneumonia')),
  add column if not exists final_doctor_note text;
