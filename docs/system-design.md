
**# System Design

# Tujuan

Di phase ini kita mulai mengubah requirement Radia menjadi blueprint teknis: sistemnya punya halaman apa, alurnya bagaimana, data apa yang disimpan, role-nya berinteraksi dengan fitur apa, dan diagram apa saja yang perlu dibuat.

1. Siapa saja aktor dalam sistem?
2. Aktor bisa melakukan apa?
3. Alur utama sistem dari login sampai PDF report bagaimana?
4. Data apa saja yang perlu disimpan?
5. Komponen utama sistem apa saja?
6. Bagaimana frontend, backend, database, AI model, dan PDF generator saling terhubung?

# Design Deliverables

1. Use Case Diagram
2. Activity Diagram
3. Sequence Diagram
4. Class Diagram
5. ERD / Database Design
6. Architecture Diagram
7. UI Wireframe / Page Structure

# Actors dalam Sistem

1. Patient

   1. Register
   2. Login
   3. View own profile
   4. Edit profile picture
   5. View own examination history
   6. View own examination detail
   7. Download own PDF report
2. Doctor
3. Login
4. Start new scan for registered patient by email
5. View own examinations
6. Create doctor-owned examination record
7. Upload X-Ray image
8. Run AI-assisted pneumonia screening
9. View prediction result and confidence score as decision support
10. Add final doctor note
11. Validate AI result
12. Generate PDF report
13. View patient examination history
14. Admin
15. Login
16. Manage patients
17. Manage doctors
18. Manage examinations
19. Upload X-Ray image
20. Run AI prediction
21. Add/edit/delete records
22. Generate/download PDF reports

# Use Case Diagram Design

1. Aktor
   1. Patient

      1. Register Account
      2. Login
      3. View Profile
      4. Update Profile Picture
      5. View Examination History
      6. View Examination Detail
      7. Download PDF Report
   2. Doctor
   3. Login
   4. Start New Scan
   5. View My Examinations
   6. Create Doctor-Owned Examination Record
   7. Upload X-Ray
   8. Run AI Screening
   9. View AI Result
   10. Add Final Doctor Note
   11. Validate AI Prediction
   12. Generate PDF Report
   13. View Patient Examination History
   14. Admin
   15. Login
   16. Manage Patient Data
   17. Manage Doctor Data
   18. Manage Examination Records
   19. Upload X-Ray
   20. Run AI Screening
   21. Generate PDF Report
   22. Download PDF Report
   23. Relasi include/extend yang bisa dipakai
   24. Run AI Screening includes Upload X-Ray
   25. Generate PDF Report includes Save Final Doctor Review
   26. Doctor View Examination Detail includes View AI Result
   27. Download PDF Report includes View Examination Detail
   28. Validate AI Prediction extends View AI Result

# Activity Diagram Design

Start

↓

User logs in

↓

System checks user role

↓

Doctor searches registered patient by email

↓

Doctor creates doctor-owned examination record

↓

Doctor/Admin uploads X-Ray image

↓

System validates file format

↓

If invalid:

    show error message

    return to upload form

If valid:

    save image

    send image to AI inference

↓

AI returns prediction result and confidence score

↓

System displays result

↓

Doctor/Admin saves final diagnosis and final doctor note

↓

Doctor/Admin validates AI result

↓

System saves final review and AI feedback

↓

System generates PDF report

↓

Patient logs in

↓

Patient opens examination history

↓

Patient downloads PDF report

↓

End

* Swimlane Activity Diagram
  * Patient | Doctor/Admin | Radia System | AI Model | Database/PDF Generator

# Sequence Diagram Design

1. Lifelines / Objects
   1. Doctor/Admin
   2. Frontend
   3. Backend API
   4. Database
   5. Storage
   6. AI Model Service
   7. PDF Generator
   8. Patient
2. Sequence Flow

| No | Actor / Source   | Target           | Action / Message                 |
| -- | ---------------- | ---------------- | -------------------------------- |
| 1  | Doctor/Admin     | Frontend         | Login                            |
| 2  | Frontend         | Backend API      | Send credentials                 |
| 3  | Backend API      | Database         | Validate user                    |
| 4  | Database         | Backend API      | Return user role                 |
| 5  | Backend API      | Frontend         | Login success                    |
| 6  | Doctor/Admin     | Frontend         | Create examination               |
| 7  | Frontend         | Backend API      | Submit examination data          |
| 8  | Backend API      | Database         | Save examination record          |
| 9  | Database         | Backend API      | Return examination ID            |
| 10 | Doctor/Admin     | Frontend         | Upload X-Ray                     |
| 11 | Frontend         | Backend API      | Send image file                  |
| 12 | Backend API      | Storage          | Save image                       |
| 13 | Storage          | Backend API      | Return image URL                 |
| 14 | Backend API      | AI Model Service | Send image for prediction        |
| 15 | AI Model Service | Backend API      | Return prediction and confidence |
| 16 | Backend API      | Database         | Save prediction result           |
| 17 | Backend API      | Frontend         | Return result                    |
| 18 | Doctor/Admin     | Frontend         | Add note and validate AI result  |
| 19 | Frontend         | Backend API      | Submit note and validation       |
| 20 | Backend API      | Database         | Update examination record        |
| 21 | Doctor/Admin     | Frontend         | Generate PDF                     |
| 22 | Frontend         | Backend API      | Request PDF generation           |
| 23 | Backend API      | PDF Generator    | Generate report                  |
| 24 | PDF Generator    | Storage          | Save PDF                         |
| 25 | Storage          | Backend API      | Return PDF URL                   |
| 26 | Backend API      | Frontend         | Show download link               |
| 27 | Patient          | Frontend         | Open examination history         |
| 28 | Frontend         | Backend API      | Request own reports              |
| 29 | Backend API      | Database         | Get patient examination records  |
| 30 | Database         | Backend API      | Return records                   |
| 31 | Backend API      | Frontend         | Show history and PDF link        |

# Class Diagram Design

1. Main Classes

   1. User
   2. PatientProfile
   3. DoctorProfile
   4. AdminProfile
   5. Examination
   6. XRayImage
   7. AIPrediction
   8. DoctorFeedback
   9. PDFReport
2. Class Details
3. User
4. - userId
5. - email
6. - passwordHash
7. - role
8. - createdAt
9. + login()
10. + logout()
11. PatientProfile
12. - patientId
13. - userId
14. - fullName
15. - phoneNumber
16. - age
17. - gender
18. - profilePictureUrl
19. + updateProfilePicture()
20. + viewExaminationHistory()
21. DoctorProfile
22. - doctorId
23. - userId
24. - fullName
25. - phoneNumber
26. - age
27. - gender
28. - profilePictureUrl
29. - licenseNumber
30. - specialization
31. + createExamination()
32. + addDoctorNote()
33. + validatePrediction()
34. AdminProfile
35. - adminId
36. - userId
37. - fullName
38. + manageUsers()
39. + manageExaminations()
40. Examination
41. - examinationId
42. - patientId
43. - doctorId
44. - examinationDate
45. - status
46. - doctorNote
47. - createdBy
48. + createRecord()
49. + updateStatus()
50. + addNote()
51. XRayImage
52. - imageId
53. - examinationId
54. - imageUrl
55. - fileName
56. - fileType
57. - uploadedAt
58. + validateFormat()
59. + uploadImage()
60. AIPrediction
61. - predictionId
62. - examinationId
63. - result
64. - confidenceScore
65. - gradcamUrl
66. - createdAt
67. + runPrediction()
68. + storePrediction()
69. DoctorFeedback
70. - feedbackId
71. - examinationId
72. - doctorId
73. - feedbackStatus
74. - feedbackNote
75. - createdAt
76. + submitFeedback()
77. PDFReport
78. - reportId
79. - examinationId
80. - reportUrl
81. - generatedAt
82. + generateReport()
83. + downloadReport()
84. Relationships
85. User 1 --- 0..1 PatientProfile
86. User 1 --- 0..1 DoctorProfile
87. User 1 --- 0..1 AdminProfile
88. PatientProfile 1 --- many Examination
89. DoctorProfile 1 --- many Examination
90. Examination 1 --- 1 XRayImage
91. Examination 1 --- 0..1 AIPrediction
92. Examination 1 --- 0..1 DoctorFeedback
93. Examination 1 --- 0..1 PDFReport

# ERD / Database Design

1. Tables

   1. users
   2. patient_profiles
   3. doctor_profiles
   4. admin_profiles
   5. examinations
   6. xray_images
   7. ai_predictions
   8. doctor_feedbacks
   9. Pdf_reports
2. Table Draft
3. Users
4. id
5. email
6. password_hash
7. role
8. created_at
9. Updated_at
10. Role
11. patient
12. doctor
13. Admin
14. patient_profiles
15. id
16. user_id
17. full_name
18. phone_number
19. age
20. gender
21. profile_picture_url
22. created_at
23. Updated_at
24. Doctor_profiles
25. id
26. user_id
27. full_name
28. phone_number
29. age
30. gender
31. profile_picture_url
32. license_number
33. specialization
34. created_at
35. Updated_at
36. admin_profiles
37. id
38. user_id
39. full_name
40. created_at
41. Updated_at
42. examinations**	**
43. id
44. patient_id
45. doctor_id
46. created_by_user_id
47. examination_date
48. status
49. doctor_note
50. created_at
51. Updated_at
52. Status
53. pending_review
54. reviewed
55. Report_ready
56. xray_images
57. id
58. examination_id
59. image_url
60. file_name
61. file_type
62. uploaded_by_user_id
63. Uploaded_at
64. ai_predictions
65. id
66. examination_id
67. prediction_result
68. confidence_score
69. gradcam_url
70. model_name
71. Created_at
72. prediction_result
73. normal
74. Pneumonia
75. doctor_feedbacks
76. id
77. examination_id
78. doctor_id
79. feedback_status
80. feedback_note
81. Created_at
82. feedback_status
83. correct
84. incorrect
85. Uncertain
86. pdf_reports
87. id
88. examination_id
89. report_url
90. generated_by_user_id
91. Generated_at

# Architecture Diagram Design

1. Layer Type

   1. Layered Client-Server Architecture
2. Components
3. Client Layer
4. Patient Web Portal
5. Doctor Workspace
6. Admin Workspace
7. Application Layer
8. Authentication Module
9. Profile Management Module
10. Examination Management Module
11. AI Prediction Module
12. Report Generation Module
13. Data Layer
14. Relational Database
15. X-Ray Image Storage
16. PDF Report Storage
17. AI Layer
18. Pneumonia Screening Model
19. Image Preprocessing
20. Prediction and Confidence Output
21. Reporting Layer
22. PDF Report Generator
23. Component Flow
24. User Browser

↓

2. Frontend Web App

↓

3. Backend API

↓

4. Database / Storage / AI Model / PDF Generator

UI Wireframe / Page Structure

1. Public Pages

   1. Landing Page
   2. Login Page
   3. Patient Register Page
2. Patient Pages
3. Patient Examination History
4. Examination Detail
5. PDF Report Download Page
6. Shared Navbar Profile Menu
7. Doctor Pages
8. Doctor Dashboard
9. Patient List
10. Patient Detail
11. Create Examination
12. Upload X-Ray
13. Examination Result
15. Examination History
16. Generate Report
17. Admin Pages
18. Admin Dashboard
19. Manage Patients
20. Manage Doctors
21. Manage Examinations
22. Examination Detail
23. Generate Report

# Main System Workflow

1. Patient registers account

↓

2. Doctor/Admin logs in

↓

3. Doctor/Admin selects patient

↓

4. Doctor/Admin creates examination

↓

5. Doctor/Admin uploads X-Ray

↓

6. System validates image

↓

7. AI model predicts Normal/Pneumonia

↓

8. System stores result

↓

9. Doctor adds note and validates AI result

↓

10. System generates PDF report with final doctor result

↓

11. Patient logs in

↓

12. Patient downloads PDF report

# Design Principles untuk Radia

1. Seperation of Concerns

   1. Authentication, patient profile, examination, AI prediction, and PDF report are separated into different modules.
2. Modularity
3. Each feature is implemented as a separate module to make development, testing, and maintenance easier.
4. Information Hiding
5. AI model processing details are hidden behind an inference API. Doctor/admin screens receive prediction result and confidence score for decision support; patient screens receive only pending summary and final doctor result.
6. Low Coupling
7. Frontend does not directly access the database or AI model. It communicates through backend API.
8. High Cohesion
9. Each module focuses on one responsibility, such as user authentication, examination management, or report generation.

**
