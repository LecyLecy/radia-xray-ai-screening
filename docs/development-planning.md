**# Development Planning

# Development Strategy

1. Build the foundation first

   1. **	**Project structure
   2. **	**Environment setup
   3. **	**Database setup
   4. **	**Authentication setup
2. Build role based access
3. **	**Patient
4. **	**Doctor
5. **	**Admin
6. Build core workflow
7. **	**Patient registration
8. **	**Examination creation
9. **	**X Ray upload
10. **	**AI prediction
11. **	**Doctor note
12. **	**PDF report
13. Build support features
14. **	**Patient history
15. **	**Doctor feedback
16. **	**Profile picture
17. Build testing and demo polish
18. **	**Test core workflow
19. **	**Fix bugs
20. **	**Prepare demo accounts

# Development Order

1. Project Setup

   1. **	**Create GitHub repository
   2. **	**Create frontend folder
   3. **	**Create backend folder
   4. **	**Create docs folder
   5. **	**Create .env.example
   6. **	**Create README.md
2. Database Setup
3. **	**Create Supabase project
4. **	**Create database tables
5. **	**Create storage buckets
6. **	**Prepare database relationship
7. **	**Prepare initial role data
8. Backend Setup
9. **	**Create FastAPI project
10. **	**Create main.py
11. **	**Create routes folder
12. **	**Create services folder
13. **	**Create schemas folder
14. **	**Create utils folder
15. **	**Create AI folder
16. **	**Create reports folder
17. Frontend Setup
18. **	**Create React Vite project
19. **	**Install Tailwind CSS
20. **	**Create routing structure
21. **	**Create layouts
22. **	**Create reusable components
23. **	**Create API service layer
24. Authentication
25. **	**Create login page
26. **	**Create patient register page
27. **	**Implement role based redirect
28. **	**Protect private routes
29. **	**Create logout function
30. Patient Features
31. **	**Create patient profile page
32. **	**Allow profile picture update
33. **	**Create examination history page
34. **	**Create examination detail page
35. **	**Create PDF download access
36. Doctor Features
37. **	**Create doctor home page
38. **	**Create patient list page
39. **	**Create patient detail page
40. **	**Create examination form
41. **	**Create X Ray upload page
42. **	**Create AI result page
43. **	**Create doctor note form
44. **	**Create AI feedback form
45. **	**Create report generation action
46. Admin Features
47. **	**Create admin home page
48. **	**Create manage patients page
49. **	**Create manage doctors page
50. **	**Create manage examinations page
51. **	**Create examination detail page
52. **	**Create report generation action
53. AI Integration
54. **	**Load AI model
55. **	**Preprocess uploaded image
56. **	**Run prediction
57. **	**Return normal or pneumonia
58. **	**Return confidence score
59. **	**Generate Grad CAM if feasible
60. **	**Save AI result to database
61. PDF Report
62. **	**Create PDF template
63. **	**Fetch patient data
64. **	**Fetch doctor data
65. **	**Fetch examination data
66. **	**Fetch AI result
67. **	**Fetch doctor note
68. **	**Add disclaimer
69. **	**Save PDF file
70. **	**Return download link
71. Testing and Debugging
72. **	**Test patient registration
73. **	**Test login per role
74. **	**Test access control
75. **	**Test examination creation
76. **	**Test X Ray upload
77. **	**Test AI prediction
78. **	**Test PDF report
79. **	**Test patient download
80. **	**Fix bugs
81. Deployment and Demo
82. **	**Prepare environment variables
83. **	**Deploy frontend
84. **	**Deploy backend if feasible
85. **	**Connect Supabase
86. **	**Create demo accounts
87. **	**Prepare demo scenario
88. **	**Finalize README

# MVP Implementation Priority

1. Priority 1

   1. Authentication

      1. **	**Patient register
      2. **	**Login
      3. **	**Role based redirect
      4. **	**Logout
   2. Patient Portal
   3. **	**View profile
   4. **	**View own examination history
   5. **	**View examination detail
   6. **	**Download PDF report
   7. Doctor Workspace
   8. **	**View patients
   9. **	**Create examination
   10. **	**Upload X Ray
   11. **	**Run AI prediction
   12. **	**Add doctor note
   13. **	**Generate PDF report
   14. Admin Workspace
   15. **	**Manage patients
   16. **	**Manage doctors
   17. **	**Manage examinations
   18. Database
   19. **	**Save users
   20. **	**Save profiles
   21. **	**Save examinations
   22. **	**Save uploaded X Ray
   23. **	**Save AI result
   24. **	**Save PDF report
   25. AI
   26. **	**Return prediction result
   27. **	**Return confidence score
   28. PDF
   29. **	**Generate report
   30. **	**Include patient data
   31. **	**Include doctor data
   32. **	**Include AI result
   33. **	**Include doctor note
   34. **	**Include disclaimer
2. Priority 2
3. Profile Picture
4. **	**Patient upload profile picture
5. **	**Doctor profile picture
6. Doctor Feedback
7. **	**Correct
8. **	**Incorrect
9. **	**Uncertain
10. Examination Status
11. **	**Pending review
12. **	**Reviewed
13. **	**Report ready
14. Image Validation
15. **	**JPG
16. **	**JPEG
17. **	**PNG
18. **	**File size limit
19. Priority 3
20. Grad CAM
21. **	**Generate heatmap
22. **	**Show visual explanation
23. UI Polish
24. **	**Better card layout
25. **	**Better dashboard layout
26. **	**Responsive mobile view
27. Cloud Deployment for AI
28. **	**Deploy model inference online

# Repository Structure

radia

**	**frontend

**	**	src

**	**	**	**components

**	**	**	**	common

**	**	**	**	forms

**	**	**	**	layout

**	**	**	**	report

**	**	**	**pages

**	**	**	**	public

**	**	**	**	patient

**	**	**	**	doctor

**	**	**	**	admin

**	**	**	**routes

**	**	**	**services

**	**	**	**hooks

**	**	**	**utils

**	**	**	**assets

**	**	package.json

**	**	vite.config.js

**	**	tailwind.config.js

**	**backend

**	**	app

**	**	**	**main.py

**	**	**	**config.py

**	**	**	**routes

**	**	**	**	auth_routes.py

**	**	**	**	patient_routes.py

**	**	**	**	doctor_routes.py

**	**	**	**	admin_routes.py

**	**	**	**	examination_routes.py

**	**	**	**	report_routes.py

**	**	**	**services

**	**	**	**	auth_service.py

**	**	**	**	user_service.py

**	**	**	**	examination_service.py

**	**	**	**	storage_service.py

**	**	**	**	ai_service.py

**	**	**	**	report_service.py

**	**	**	**models

**	**	**	**	user_model.py

**	**	**	**	profile_model.py

**	**	**	**	examination_model.py

**	**	**	**	prediction_model.py

**	**	**	**	report_model.py

**	**	**	**schemas

**	**	**	**	auth_schema.py

**	**	**	**	user_schema.py

**	**	**	**	examination_schema.py

**	**	**	**	report_schema.py

**	**	**	**ai

**	**	**	**	model_loader.py

**	**	**	**	preprocess.py

**	**	**	**	predict.py

**	**	**	**	gradcam.py

**	**	**	**reports

**	**	**	**	pdf_template.py

**	**	**	**utils

**	**	**	**	response.py

**	**	**	**	validation.py

**	**	**	**	security.py

**	**	requirements.txt

**	**docs

**	**	problem-planning.md

**	**	sdlc-planning.md

**	**	project-management.md

**	**	requirements.md

**	**	system-design.md

**	**	technical-design.md

**	**	testing-plan.md

**	**	risk-security-ethics.md

**	**README.md

**	**.env.example

**	**.gitignore

# Coding Convention

1. Naming Convention

**	**Folder name

**	**	lowercase

**	**	kebab case for frontend folders if needed

**	**Python files

**	**	snake_case

**	**React components

**	**	PascalCase

**	**React functions

**	**	camelCase

**	**API endpoints

**	**	lowercase

**	**	kebab case if needed

2. Code Organization

**	**Frontend pages only handle UI layout

**	**Frontend services handle API calls

**	**Backend routes handle request and response

**	**Backend services handle business logic

**	**AI folder handles model loading and prediction

**	**Reports folder handles PDF generation

3. Environment Variables

**	**Do not hardcode API keys

**	**Use .env file locally

**	**Provide .env.example for team members

4. Documentation

**	**Update README when setup changes

**	**Add comments only where logic is not obvious

**	**Keep folder names clear

# Git Workflow

1. Branches

**	**main

**	**	stable demo version

**	**dev

**	**	integrated development version

**	**feature-auth

**	**	login register role access

**	**feature-patient

**	**	patient portal

**	**feature-doctor

**	**	doctor workspace

**	**feature-admin

**	**	admin workspace

**	**feature-ai

**	**	AI prediction integration

**	**feature-report

**	**	PDF report generation

**	**feature-testing

**	**	testing and bug fixes

2. Commit Message Format

feat

**	**add new feature

fix

**	**fix bug or error

docs

**	**update documentation

test

**	**add or update tests

refactor

**	**improve code structure without changing behavior

chore

**	**setup or maintenance task

# Local Setup Plan

1. Setup Frontend

   1. **	**open terminal
   2. **	**cd frontend
   3. **	**npm install
   4. **	**copy .env.example to .env
   5. **	**fill environment variables
   6. **	**npm run dev
2. Setup Backend
3. **	**open terminal
4. **	**cd backend
5. **	**python -m venv .venv
6. **	**activate virtual environment
7. **	**pip install -r requirements.txt
8. **	**copy .env.example to .env
9. **	**fill environment variables
10. **	**uvicorn app.main:app --reload
11. Setup Database
12. **	**create Supabase project
13. **	**create database tables
14. **	**create storage buckets
15. **	**copy Supabase URL and keys
16. **	**paste into .env
17. Run Application
18. **	**start backend
19. **	**start frontend
20. **	**open frontend localhost URL
21. **	**login using demo account

# Demo Development Flow

1. Demo Flow
   1. **	**Patient registers account
   2. **	**Doctor logs in
   3. **	**Doctor selects patient
   4. **	**Doctor creates examination
   5. **	**Doctor uploads X Ray
   6. **	**System shows AI result
   7. **	**Doctor adds note
   8. **	**Doctor generates PDF report
   9. **	**Patient logs in
   10. **	**Patient opens examination history
   11. **	**Patient downloads PDF report
2. Admin Flow
3. **	**Admin logs in
4. **	**Admin views patients
5. **	**Admin views doctors
6. **	**Admin views examinations
7. **	**Admin can manage records

# Development Risk Control

1. If AI model integration fails

   1. **	**use mock AI response temporarily
   2. **	**document as fallback
   3. **	**continue database and report workflow
2. If Grad CAM fails
3. **	**remove from MVP
4. **	**keep prediction and confidence score
5. If cloud backend deployment fails
6. **	**run backend locally during demo
7. **	**deploy frontend only if feasible
8. If Supabase auth becomes too complex
9. **	**use custom backend auth for demo
10. **	**keep role based access simple
11. If PDF layout becomes hard
12. **	**Use simple report layout first
13. **	**improve only after core workflow works

**
