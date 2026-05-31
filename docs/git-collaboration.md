**# Git and Collaboration Planning

# Tujuan

1. Version control

   1. **	**Track source code changes
   2. **	**Save commit history
   3. **	**Support rollback if code breaks
   4. **	**Separate stable code and development code
2. Collaboration evidence
3. **	**Show contributor commits
4. **	**Show branch usage
5. **	**Show pull request history if used
6. Repository sharing
7. **	**Allow team members to pull code
8. **	**Allow evaluator to view final source code
9. Documentation backup
10. **	**Store README
11. **	**Store setup guide
12. **	**Store technical docs if needed

# Repository Strategy

1. Repository Name

   1. **	**radia
2. Repository Type
3. **	**Monorepo
4. Main Folders
5. **	**frontend
6. **	**backend
7. **	**Docs

# Branching Strategy

1. main

   1. **	**Stable version
   2. **	**Code that is ready for demo
   3. **	**Only merge tested code here
2. dev
3. **	**Development integration branch
4. **	**Use for active development and integration testing
5. Current workflow
6. **	**Only `dev` and `main` are maintained branches
7. **	**Develop and test on `dev`
8. **	**Merge or fast-forward stable demo snapshots to `main`

# Commit Convention

1. Feat

   1. **	**Add new feature
2. Fix
3. **	**Fix bug or error
4. Docs
5. **	**Update documentation
6. Test
7. **	**Add or update test
8. Refactor
9. **	**Improve code structure without changing behavior
10. Chore
11. **	**Setup dependency or maintenance task
12. Style
13. **	**UI or formatting change

# Pull and Setup Rule

1. Before Pulling
2. **	**Install Node.js
3. **	**Install Python
4. **	**Install Git
5. **	**Ask for .env file from project lead
6. **	**Make sure Supabase project is available
7. After Pulling
8. **	**git pull origin main
9. **	**Open frontend folder
10. **	**Run npm install
11. **	**Open backend folder
12. **	**Create virtual environment
13. **	**Run pip install -r requirements.txt
14. **	**Copy .env.example to .env
15. **	**Fill environment variables
16. **	**Run frontend and backend locally

# README Structure

1. Project Title

   1. **	**Radia A Web Based X Ray Examination Management System with AI Assisted Pneumonia Screening
2. Project Description
3. **	**Brief explanation of Radia
4. Tech Stack
5. **	**Frontend
6. **	**Backend
7. **	**Database
8. **	**Storage
9. **	**AI
10. **	**PDF
11. Main Features
12. **	**Patient registration and portal
13. **	**Doctor examination workflow
14. **	**Admin management
15. **	**X Ray upload
16. **	**AI prediction
17. **	**PDF report
18. Folder Structure
19. **	**frontend
20. **	**backend
21. **	**docs
22. Environment Variables
23. **	**List required .env values without exposing secrets
24. Setup Guide
25. **	**Frontend setup
26. **	**Backend setup
27. **	**Database setup
28. Demo Accounts
29. **	**Patient account
30. **	**Doctor account
31. **	**Admin account
32. Known Limitations
33. **	**AI is second opinion only
34. **	**Grad CAM optional
35. **	**AI may run locally during demo

 .gitignore Strategy

1. Environment files

   1. **	**.env
   2. **	**.env.local
   3. **	**.env.production
2. Python files
3. **	**__pycache__
4. **	***.pyc
5. **	**.venv
6. **	**venv
7. Node files
8. **	**node_modules
9. **	**dist
10. **	**build
11. System files
12. **	**.DS_Store
13. **	**Thumbs.db
14. Model files if too large
15. **	***.pth
16. **	***.pt
17. **	***.h5
18. Uploaded files
19. **	**uploads
20. **	**Reports

# .env.example Strategy

1. SUPABASE_URL
2. SUPABASE_ANON_KEY
3. SUPABASE_SERVICE_ROLE_KEY
4. DATABASE_URL
5. STORAGE_BUCKET_XRAY
6. STORAGE_BUCKET_REPORT
7. STORAGE_BUCKET_PROFILE
8. JWT_SECRET
9. AI_MODEL_PATH

# Collaboration Evidence

1. GitHub commit history

   1. **	**Show meaningful project commits
2. Branch history
3. **	**Show maintained `dev` and `main` branch flow
4. Pull requests
5. **	**Optional but good for evidence
6. README contribution section
7. **	**List project contributors only
8. Google Sheets progress log
9. **	**Show actual progress

# Code Review Rule

1. **	**Feature code should be tested locally before merge
2. **	**Code should not break existing main workflow
3. **	**Environment variables must not be committed
4. **	**Feature branch should be merged only after basic test passes
5. **	**If working solo each major commit is checked using local run and testing log

# Git Workflow

1. Start from dev
   1. **	**Pull latest `dev`
   2. **	**Implement feature
   3. **	**Test locally
   4. **	**Commit changes
   5. **	**Push `dev`
   6. **	**Merge stable demo changes to `main`
   7. **	**Update Google Sheets task status
   8. **	**Update testing log if needed

# GitHub Repository Documentation

1. [README.md](http://readme.md)

   1. **	**Project overview setup guide known limitations
2. .env.example
3. **	**Template environment variables
4. .gitignore
5. **	**Files that should not be committed
6. Docs
7. **	**technical documentation backup
8. Frontend
9. **	**React project
10. Backend
11. **	**FastAPI project

**
