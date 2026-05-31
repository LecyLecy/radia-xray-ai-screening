
**# Requirements Engineering

# Tujuan

Tujuan phase ini adalah mendefinisikan apa yang harus dilakukan sistem Radia, siapa stakeholder-nya, fitur mana yang wajib, fitur mana yang opsional, dan bagaimana kita tahu suatu fitur dianggap selesai.

# Requirements Engineering Scope

1. Stakeholder Identification
2. User Role Definition
3. Functional Requirements
4. Non-Functional Requirements
5. User Stories
6. Acceptance Criteria
7. MoSCoW Prioritization
8. Requirement Traceability Matrix

# Stakeholder Identification

1. Primary Stakeholders

| Stakeholder      | Description                                                         | Main Interest                                                 |
| ---------------- | ------------------------------------------------------------------- | ------------------------------------------------------------- |
| Patient          | User who receives X-Ray examination and accesses examination report | Can view own history, pending summary, final doctor result, and download PDF report |
| Doctor           | Medical user who performs/reviews examination                       | Can start scans, upload X-Ray, review AI support, add final note, validate result |
| Admin            | Operational user who manages system data                            | Can manage users, patients, doctors, and examination records  |
| Development Team | Team building Radia                                                 | Build, test, document, and maintain the system                |

2. Secondary Stakeholders

| Stakeholder          | Description                                    | Main Interest                                         |
| -------------------- | ---------------------------------------------- | ----------------------------------------------------- |
| Lecturer / Evaluator | Assesses the software engineering project      | Clear SDLC, requirements, design, testing, risk, demo |
| Healthcare Facility  | Hypothetical clinic/puskesmas using the system | More structured X-Ray examination workflow            |
| Future Maintainer    | Person/team maintaining the app after demo     | Clear code, documentation, modular design             |

# User Role Definition

1. Patient

   1. Patient adalah user eksternal yang bisa register sendiri dan melihat hasil pemeriksaannya.
   2. Patient Dapat
      1. Register account
      2. Login
      3. View own profile
      4. Edit profile picture
      5. View own examination history
      6. View own examination detail
      7. Download own PDF report
   3. Patient tidak dapat
   4. Upload X-Ray
   5. Run AI prediction
   6. Edit medical result
   7. Add doctor note
   8. Validate AI result
   9. View other patients’ data
2. Doctor
3. Doctor adalah user internal yang melakukan pemeriksaan dan validasi klinis.
4. Doctor Dapat
5. Login
6. Start new scan for a registered patient by email
7. View own examination queue
8. Create examination record
9. Upload X-Ray
10. Run AI-assisted pneumonia screening
11. View AI prediction result and confidence score as decision support
12. View Grad-CAM if available
13. Add final doctor note
14. Validate AI result
15. Generate PDF report
16. View patient examination history
17. Admin
18. Admin adalah user internal dengan akses penuh untuk kebutuhan operasional.
19. Admin Dapat
20. Login
21. Manage patients
22. Manage doctors
23. Manage examinations
24. Upload X-Ray
25. Run AI prediction
26. Add/edit records
27. Generate/download PDF reports
28. Delete records if needed

# Functional Requirements

1. Authentication & Role Access

![]()

2. Patient Profile & Portal

![]()

3. Doctor Workspace

![]()

4. Admin Workspace

![]()

5. Examination & AI Processing

![]()

6. PDF Report

![]()

# User Stories

* User Story Format
  * As a [role], I want [function], so that [value].

1. Patient User Stories

![]()

2. Doctor User Stories

![]()

3. Admin User Stories

![]()

# Acceptance Criteria

| User Story             | Acceptance Criteria                                                                                                    |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| US-01 Patient Register | Patient can submit registration form with valid data; account is created; patient can log in after registration.       |
| US-05 View History     | Patient can see only their own examination records; no other patient records are visible.                              |
| US-10 Upload X-Ray     | Doctor can upload JPG/PNG image; invalid file format is rejected; uploaded image is linked to the correct examination. |
| US-11 View AI Result   | System displays Normal/Pneumonia result and confidence score to doctor/admin only after prediction.                    |
| US-13 Doctor Note      | Doctor can add and save final clinical note; final note appears in patient detail and PDF report after review.         |
| US-15 Generate PDF     | PDF includes patient data, doctor data, examination date, final diagnosis, final doctor note, and disclaimer.          |
| US-17 Manage Doctor    | Admin can search registered patient accounts, promote them to doctor role, and view medical staff accounts.            |
| US-20 Generate Reports | Admin can generate/download reports for examination records.                                                           |

# MoSCoW Prioritization

1. Must Have

   1. Patient registration and login
   2. Doctor/admin login
   3. Role-based access control
   4. Patient profile
   5. Doctor profile
   6. Patient examination history
   7. Create examination record
   8. Upload X-Ray image
   9. AI prediction result: Normal/Pneumonia
   10. Confidence score
   11. Final doctor note
   12. PDF report generation
   13. Patient PDF download
2. Should Have
3. Profile picture upload
4. AI feedback: correct / incorrect / uncertain
5. Admin full access to manage data
6. Examination status: pending review / reviewed / report ready
7. Image format validation
8. Could Have
9. Grad-CAM visualization
10. Search patient by name/email
11. Admin promotes patient accounts into doctor accounts
12. PDF storage in cloud storage
13. Better UI polish
14. Won’t Have
15. Automatic final diagnosis
16. Real hospital integration
17. Appointment scheduling
18. Real-time queue system
19. Payment/insurance system
20. Medicine recommendation
21. Automatic model retraining
22. Complex statistics dashboard
23. Mobile app

# Requirement Traceability Matrix Draft

| Req ID | Requirement Summary       | Related Role | Related Feature    | Test Type           |
| ------ | ------------------------- | ------------ | ------------------ | ------------------- |
| FR-01  | Patient registration      | Patient      | Register Page      | System, Acceptance  |
| FR-02  | Login                     | All roles    | Login Page         | Unit, System        |
| FR-03  | Role-based redirect       | All roles    | Auth Routing       | Integration, System |
| FR-04  | Restrict patient access   | Patient      | Access Control     | Security, System    |
| FR-08  | Patient view history      | Patient      | Patient Portal     | System, Acceptance  |
| FR-10  | Patient download PDF      | Patient      | PDF Download       | System, Acceptance  |
| FR-13  | Doctor create examination | Doctor       | Examination Form   | Integration, System |
| FR-14  | Upload X-Ray              | Doctor       | Upload Feature     | Integration, System |
| FR-15  | Run AI screening          | Doctor       | AI Prediction      | Integration         |
| FR-16  | Display prediction        | Doctor/Admin | Result Page        | System              |
| FR-19  | Add final doctor note     | Doctor       | Examination Detail | System              |
| FR-20  | Validate AI output        | Doctor       | AI Feedback        | System              |
| FR-23  | Admin manage patient      | Admin        | Admin Workspace    | System              |
| FR-24  | Admin manage doctor       | Admin        | Admin Workspace    | System              |
| FR-37  | Generate PDF report       | Doctor/Admin | Report Generator   | Integration, System |
| NFR-01 | Authentication required   | All roles    | Auth System        | Security            |
| NFR-03 | Patient privacy           | Patient      | Access Control     | Security            |
| NFR-13 | AI as second opinion      | All roles    | Result Page/Report | Acceptance          |

**
