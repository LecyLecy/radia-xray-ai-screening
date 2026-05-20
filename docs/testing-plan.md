
**# Testing Planning

# Tujuan

1. **	**Ensure patient can register login and access own reports
2. **	**Ensure doctor can create examination upload X Ray run AI prediction and generate report
3. **	**Ensure admin can manage system data
4. **	**Ensure role based access works correctly
5. **	**Ensure uploaded image is validated
6. **	**Ensure AI prediction result is stored and displayed
7. **	**Ensure PDF report is generated correctly
8. **	**Ensure patient privacy is protected

# Testing Scope

1. In Scope

   1. Authentication testing

      1. **	**Patient registration
      2. **	**Login
      3. **	**Logout
      4. **	**Role based redirect
      5. **	**Protected routes
   2. Patient portal testing
   3. **	**View profile
   4. **	**Update profile picture
   5. **	**View own examination history
   6. **	**View examination detail
   7. **	**Download own PDF report
   8. Doctor workspace testing
   9. **	**View patient list
   10. **	**View patient detail
   11. **	**Create examination
   12. **	**Upload X Ray
   13. **	**Run AI prediction
   14. **	**Add doctor note
   15. **	**Validate AI output
   16. **	**Generate PDF report
   17. Admin workspace testing
   18. **	**Manage patients
   19. **	**Manage doctors
   20. **	**Manage examinations
   21. **	**Upload X Ray
   22. **	**Run AI prediction
   23. **	**Generate report
   24. **	**Delete or edit records if enabled
   25. AI integration testing
   26. **	**Image preprocessing
   27. **	**Prediction result
   28. **	**Confidence score
   29. **	**Failed prediction handling
   30. PDF report testing
   31. **	**Patient information
   32. **	**Doctor information
   33. **	**Examination date
   34. **	**AI result
   35. **	**Doctor note
   36. **	**Medical disclaimer
   37. **	**Download access
   38. Security and access testing
   39. **	**Patient cannot access other patient data
   40. **	**Unauthenticated user cannot access protected pages
   41. **	**Admin and doctor role permissions work correctly
2. Out of Scope
3. Clinical accuracy validation
4. **	**No full medical validation of AI accuracy
5. Regulatory certification
6. **	**No official medical device certification
7. Large scale load testing
8. **	**No hospital scale performance testing
9. Automated retraining testing
10. **	**No automatic model retraining
11. Cross hospital integration testing
12. **	**No real hospital system integration
13. Mobile app testing
14. **	**No mobile native application testing

Testing Levels

1. Unit Testing

   1. **	**Test individual functions or modules
2. Integration Testing
3. **	**Test connection between frontend backend database storage AI and PDF generator
4. System Testing
5. **	**Test full application workflow from end to end
6. Acceptance Testing
7. **	**Test whether the system satisfies user needs and MVP success criteria

# Unit Testing Plan

1. **	**Authentication validation

   1. **	**	Check email format
   2. **	**	Check required password
   3. **	**	Check role value
2. **	**File validation
3. **	**	Check JPG JPEG PNG allowed
4. **	**	Reject unsupported format
5. **	**	Reject empty file
6. **	**Patient input validation
7. **	**	Check required full name
8. **	**	Check required email
9. **	**	Check phone number
10. **	**	Check age and gender
11. **	**AI service helper
12. **	**	Check image preprocessing function
13. **	**	Check prediction response format
14. **	**PDF helper
15. **	**	Check report data formatting
16. **	**	Check disclaimer text included
17. Contoh Test Case

| Test ID | Feature      | Scenario                 | Expected Result                         |
| ------- | ------------ | ------------------------ | --------------------------------------- |
| UT-01   | Registration | Empty email submitted    | System returns validation error         |
| UT-02   | Upload       | Upload PDF file as X-Ray | System rejects file                     |
| UT-03   | AI Helper    | AI returns prediction    | Response contains result and confidence |
| UT-04   | PDF Helper   | Generate report data     | Report includes required sections       |

# Integration Testing Plan

1. Frontend to Backend
2. **	**	Login form sends credentials to backend
3. **	**	Upload form sends image to backend
4. **	**	Report button requests PDF generation
5. **	**Backend to Database
6. **	**	User data saved correctly
7. **	**	Examination data saved correctly
8. **	**	AI result saved correctly
9. **	**	PDF report URL saved correctly
10. **	**Backend to Storage
11. **	**	X Ray image saved to storage
12. **	**	Profile picture saved to storage
13. **	**	PDF report saved to storage
14. **	**Backend to AI Service
15. **	**	Uploaded image sent to AI model
16. **	**	Prediction result returned to backend
17. **	**	Confidence score returned to backend
18. **	**Backend to PDF Generator
19. **	**	Examination data sent to PDF generator
20. **	**	PDF file generated successfully
21. Contoh test case

| Test ID | Integration      | Scenario                  | Expected Result                        |
| ------- | ---------------- | ------------------------- | -------------------------------------- |
| IT-01   | Frontend Backend | Doctor submits login form | Backend returns success and role       |
| IT-02   | Backend Database | Create examination record | Examination is stored in database      |
| IT-03   | Backend Storage  | Upload X-Ray image        | Image URL is returned and saved        |
| IT-04   | Backend AI       | Run prediction            | Prediction and confidence are returned |
| IT-05   | Backend PDF      | Generate report           | PDF URL is returned and stored         |

# System Testing Plan

1. **	**Patient registration workflow
2. **	**	Patient registers account
3. **	**	Patient logs in
4. **	**	Patient sees own profile
5. **	**Doctor examination workflow
6. **	**	Doctor logs in
7. **	**	Doctor selects patient
8. **	**	Doctor creates examination
9. **	**	Doctor uploads X Ray
10. **	**	Doctor runs AI prediction
11. **	**	Doctor adds note
12. **	**	Doctor generates report
13. **	**Patient report access workflow
14. **	**	Patient logs in
15. **	**	Patient opens examination history
16. **	**	Patient opens examination detail
17. **	**	Patient downloads PDF report
18. **	**Admin management workflow
19. **	**	Admin logs in
20. **	**	Admin views patients
21. **	**	Admin views doctors
22. **	**	Admin views examinations
23. **	**	Admin edits or manages data
24. **	**Access control workflow
25. **	**	Patient tries to access another patient report
26. **	**	System blocks access
27. Contoh Test Case

| Test ID | Workflow           | Scenario                                    | Expected Result                           |
| ------- | ------------------ | ------------------------------------------- | ----------------------------------------- |
| ST-01   | Patient Register   | New patient registers and logs in           | Patient dashboard opens                   |
| ST-02   | Doctor Examination | Doctor completes X-Ray examination workflow | Examination record and report are created |
| ST-03   | Patient Report     | Patient downloads own report                | PDF is downloaded successfully            |
| ST-04   | Access Control     | Patient accesses other patient record       | Access is denied                          |
| ST-05   | Admin Manage       | Admin edits patient data                    | Updated data is saved                     |

# Acceptance Testing Plan

1. Patient acceptance
2. **	**	Patient can register and login
3. **	**	Patient can view own history
4. **	**	Patient can download own report
5. **	**Doctor acceptance
6. **	**	Doctor can manage examination
7. **	**	Doctor can upload X Ray
8. **	**	Doctor can view AI prediction
9. **	**	Doctor can add note
10. **	**	Doctor can generate report
11. **	**Admin acceptance
12. **	**	Admin can manage patients doctors and examinations
13. **	**System acceptance
14. **	**	Core workflow works from examination creation to patient report download
15. **	**	AI is shown as second opinion not final diagnosis
16. **	**	Role based access protects patient data
17. Contoh Acceptance Checklist

| Criteria ID | Acceptance Criteria                           | Status     |
| ----------- | --------------------------------------------- | ---------- |
| AC-01       | Patient can register and log in               | Not Tested |
| AC-02       | Patient can only view own examination history | Not Tested |
| AC-03       | Doctor can upload X-Ray and receive AI result | Not Tested |
| AC-04       | Doctor can add note and generate PDF report   | Not Tested |
| AC-05       | PDF report contains disclaimer                | Not Tested |
| AC-06       | Admin can manage patient and doctor data      | Not Tested |

# Current Manual Verification Snapshot

These checks have been manually verified during backend MVP setup. They do not
replace the full test plan above, but they document the current working backend
foundation.

| Feature | Verified Behavior | Status |
| ------- | ----------------- | ------ |
| Supabase connection | `GET /supabase/test` returns connected response from `profiles` | Passed |
| Patient auth | Patient registration creates auth, `profiles`, and `patient_profiles` rows | Passed |
| Login | Login returns access token, refresh token, and role | Passed |
| Patient profile | `GET /patients/me` returns current patient profile with bearer token | Passed |
| Patient access control | Missing/malformed token is rejected for protected patient route | Passed |
| Doctor access control | Patient token is rejected from doctor endpoints with `403` | Passed |
| Doctor patient list | Doctor token can read `GET /doctor/patients` | Passed |
| Doctor patient detail | Doctor token can read `GET /doctor/patients/{patient_id}` | Passed |
| Examination creation | Doctor token can create `POST /doctor/examinations` | Passed |
| Backend syntax | `python -m compileall app` passes | Passed |

# Testing Log Format for Google Sheets

1. Testing Log

   1. Test ID
   2. Test Type
   3. Feature
   4. Test Scenario
   5. Expected Result
   6. Actual Result
   7. Status
   8. Tester
   9. Date
   10. Notes
2. Status yang dipakai
3. Not Tested
4. Passed
5. Failed
6. Blocked
7. Retest
8. Contoh

| Test ID | Test Type   | Feature         | Test Scenario                     | Expected Result                 | Actual Result | Status     |
| ------- | ----------- | --------------- | --------------------------------- | ------------------------------- | ------------- | ---------- |
| UT-01   | Unit        | File Validation | Upload PDF file as X-Ray          | File rejected                   | ``     | Not Tested |
| IT-04   | Integration | AI Prediction   | Run prediction after X-Ray upload | Prediction and confidence shown | ``     | Not Tested |
| ST-02   | System      | Doctor Workflow | Complete examination workflow     | Report generated                | ``     | Not Tested |
| AT-03   | Acceptance  | Patient Report  | Patient downloads own PDF         | PDF downloaded                  | ``     | Not Tested |

# Bug Log Format for Google Sheets

1. Bug Log

   1. Bug ID
   2. Date Found
   3. Feature
   4. Bug Description
   5. Severity
   6. Status
   7. Assigned To
   8. Resolution
   9. Date Closed
2. Severity
3. Critical
4. **	**System cannot continue
5. High
6. **	**Core feature broken
7. Medium
8. **	**Feature works partially
9. Low
10. **	**Minor UI or text issue
11. Status
12. Open
13. In Progress
14. Fixed
15. Retest
16. Closed
17. Won't Fix
18. Contoh

| Bug ID | Feature         | Bug Description                        | Severity | Status |
| ------ | --------------- | -------------------------------------- | -------- | ------ |
| BUG-01 | Upload X-Ray    | PNG upload fails even though allowed   | High     | Open   |
| BUG-02 | Patient History | Patient can see another patient report | Critical | Open   |
| BUG-03 | PDF Report      | Doctor note missing from PDF           | Medium   | Open   |

# Testing Priority

1. Must Test

   1. **	**Patient registration and login
   2. **	**Doctor login
   3. **	**Admin login
   4. **	**Role based access
   5. **	**Create examination
   6. **	**Upload X Ray
   7. **	**Run AI prediction
   8. **	**Save examination result
   9. **	**Generate PDF report
   10. **	**Patient download own report
2. Should Test
3. **	**Profile picture update
4. **	**Doctor feedback
5. **	**Examination status update
6. **	**Image validation
7. **	**Admin edit data
8. Could Test
9. **	**Grad CAM
10. **	**Responsive UI
11. **	**Cloud deployment stability

# Test Case Table Draft

| Test ID | Test Type   | Feature                 | Test Scenario                                                   | Expected Result                          | Status     |
| ------- | ----------- | ----------------------- | --------------------------------------------------------------- | ---------------------------------------- | ---------- |
| UT-01   | Unit        | Registration Validation | Submit empty required fields                                    | Validation error appears                 | Not Tested |
| UT-02   | Unit        | File Validation         | Upload unsupported file type                                    | File is rejected                         | Not Tested |
| UT-03   | Unit        | PDF Helper              | Generate report content                                         | Required report sections exist           | Not Tested |
| IT-01   | Integration | Login                   | Submit valid credentials                                        | User is redirected based on role         | Not Tested |
| IT-02   | Integration | Database                | Create patient profile                                          | Profile is saved in database             | Not Tested |
| IT-03   | Integration | Storage                 | Upload X-Ray image                                              | Image file is stored and URL is returned | Not Tested |
| IT-04   | Integration | AI Prediction           | Send uploaded image to AI service                               | Prediction and confidence are returned   | Not Tested |
| IT-05   | Integration | PDF Report              | Generate report from examination data                           | PDF file is generated and linked         | Not Tested |
| ST-01   | System      | Patient Flow            | Register login view profile                                     | Patient dashboard works                  | Not Tested |
| ST-02   | System      | Doctor Flow             | Create examination upload X-Ray run AI add note generate report | End-to-end doctor workflow works         | Not Tested |
| ST-03   | System      | Patient Report          | Patient opens history and downloads PDF                         | Patient can access own report            | Not Tested |
| ST-04   | System      | Access Control          | Patient attempts to access another patient record               | Access is denied                         | Not Tested |
| ST-05   | System      | Admin Flow              | Admin views and manages records                                 | Admin workflow works                     | Not Tested |
| AT-01   | Acceptance  | MVP Workflow            | Complete from doctor examination to patient report download     | MVP scenario succeeds                    | Not Tested |
| AT-02   | Acceptance  | Ethics                  | PDF and result page show AI disclaimer                          | AI is not presented as final diagnosis   | Not Tested |

**
