
**# Risk, Security, and Ethics

# Tujuan

1. Identify potential technical project security privacy and ethical risks
2. **	**Estimate the probability and impact of each risk
3. **	**Prepare mitigation strategies before implementation
4. **	**Document risk status in Google Sheets Risk Register
5. **	**Ensure Radia remains an academic prototype and clinical decision support system

# Risk Categories

1. Project Risk

   1. **	**Scope creep
   2. **	**Timeline delay
   3. **	**Uneven team contribution
   4. **	**Incomplete documentation
2. Technical Risk
3. **	**AI model integration failure
4. **	**Backend frontend integration issue
5. **	**Database setup issue
6. **	**File upload failure
7. **	**PDF generation failure
8. Security Risk
9. **	**Unauthorized access
10. **	**Patient data exposure
11. **	**Weak role based access
12. **	**Leaked API keys
13. Privacy Risk
14. **	**Patient sees another patient data
15. **	**Medical report exposed publicly
16. **	**Profile picture or X Ray file accessible without permission
17. Ethical Risk
18. **	**AI result treated as final diagnosis
19. **	**Overreliance on AI output
20. **	**False positive or false negative prediction
21. Deployment Risk
22. **	**Backend cannot run on free hosting
23. **	**AI model too heavy for deployment
24. **	**Demo app unavailable during presentation

Security Plan

1. Authentication

   1. **	**All protected pages require login
   2. **	**Patient doctor and admin must use registered credentials
   3. **	**Unauthenticated users are redirected to login page
2. Authorization
3. **	**Patient can only access own profile history and report
4. **	**Doctor can access patient examination workflow
5. **	**Admin can access all system management features
6. **	**Backend must check role before returning sensitive data
7. Data Protection
8. **	**Password must not be stored as plain text
9. **	**API keys must be stored in environment variables
10. **	**Uploaded files must be linked to correct examination record
11. **	**PDF reports must only be accessible by authorized users
12. File Upload Security
13. **	**Only JPG JPEG PNG are accepted for X Ray image
14. **	**File size should be limited
15. **	**Invalid files are rejected
16. **	**File name should be sanitized
17. Repository Security
18. **	**.env file is excluded from Git
19. **	**.env.example is provided for setup
20. **	**Secrets are not hardcoded
21. **	**GitHub repository should not contain private keys

# Privacy Plan

1. Patient Data Collected
   1. **	**Full name
   2. **	**Email
   3. **	**Phone number
   4. **	**Age
   5. **	**Gender
   6. **	**Profile picture
   7. **	**Examination history
   8. **	**X Ray image
   9. **	**AI prediction result
   10. **	**PDF report
2. Privacy Protection
3. **	**Patient can only view own examination records
4. **	**Doctor and admin access is role based
5. **	**Reports are not public by default
6. **	**X Ray images are not directly exposed to unauthorized users
7. **	**Patient identity data cannot be edited freely by patient after registration except profile picture

# AI Ethics Plan

1. AI Positioning
2. **	**AI is used as second opinion support
3. **	**AI is not final diagnosis
4. **	**Doctor remains responsible for final clinical decision
5. AI Output
6. **	**Normal or Pneumonia prediction
7. **	**Confidence score
8. **	**Grad CAM if feasible
9. Ethical Safeguards
10. **	**Show disclaimer on result page
11. **	**Show disclaimer on PDF report
12. **	**Require doctor note and validation before report is finalized
13. **	**Display confidence score to avoid blind trust
14. **	**Store doctor feedback for evaluation purpose

# Medical Disclaimer

**	**This AI assisted result is provided for clinical decision support only. It is not a final medical diagnosis and must not replace professional medical judgment. The final interpretation and clinical decision remain the responsibility of the examining doctor.

# Risk Mitigation Strategy

1. Scope Control
2. **	**Use MoSCoW prioritization
3. **	**Focus on MVP workflow first
4. **	**Keep Grad CAM optional
5. **	**Remove statistics dashboard from scope
6. Technical Control
7. **	**Validate AI model early
8. **	**Use simple PDF template first
9. **	**Use Supabase for database and storage
10. **	**Prepare mock AI fallback if needed
11. Security Control
12. **	**Apply authentication
13. **	**Apply role based access
14. **	**Protect backend endpoints
15. **	**Do not commit secrets
16. **	**Restrict patient data access
17. Ethics Control
18. **	**Add disclaimer
19. **	**Require doctor validation
20. **	**Use AI as second opinion
21. **	**Avoid automatic diagnosis claim
22. Demo Control
23. **	**Prepare demo accounts
24. **	**Prepare sample data
25. **	**Prepare local backup
26. **	**Prepare screenshots or video backup if needed

**
