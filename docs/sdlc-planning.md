
**# SDLC Planning

# SDLC Model

Waterfall Model with Early AI Feasibility Validation.

Karena:

**	**1. Planning dan dokumentasi kuat dari awal.

2. Project kuliah butuh report formal.
3. Fitur utama sudah cukup bisa didefinisikan dari awal.
4. Mostly solo developer, jadi Scrum kurang natural.
5. Deadline pendek, jadi dokumentasi phase-by-phase lebih mudah dipertanggungjawabkan.

Radia uses a Modified Waterfall Model because the project requires clear planning, structured documentation, defined requirements, and sequential development activities. The Waterfall Model is suitable because the main requirements of Radia can be identified early, such as user authentication, patient profile management, X-Ray examination records, AI-assisted screening, examination history, and PDF report generation.

However, since Radia includes an AI-assisted pneumonia screening component, an early AI feasibility validation is added before full implementation. This validation is used to check whether the selected AI model can receive an X-Ray image input and return a prediction result that can be integrated into the web application. This reduces the risk of discovering AI integration problems too late in the development process.

# SDLC Phase

**	**1. Planning

**	**(Early AI Feasibility Validation dilakukan di akhir Planning / awal
	Requirement Analysis, melakukan pengecekan awal apakah komponen AI
	bisa dipakai dalam software.)

2. Requirement Analysis
3. System Design
4. Implementation
5. Testing and Integration
6. Deployment
7. Maintenance Planning

# Mapping SDLC Radia

1. Planning

   1. Define problem theme: Health
   2. Define project title: Radia
   3. Identify affected users: patient, doctor, admin
   4. Define real-world scenario
   5. Define project scope and out-of-scope boundaries
   6. Choose SDLC model
   7. Select initial project tools
   8. Create initial timeline
   9. Identify technical feasibility, especially AI model feasibility
2. Requirement Analysis
3. Identify stakeholders
4. Define functional requirements
5. Define non-functional requirements
6. Create user stories
7. Create acceptance criteria
8. Prioritize requirements using MoSCoW
9. Validate requirement consistency with project scope
10. Early AI Feasibility Validation
11. Tujuan
12. Load model successfully
13. Accept X-Ray image input
14. Preprocess image
15. Return prediction result
16. Return confidence score
17. Generate or display Grad-CAM if feasible
18. Output
19. Model can be loaded: Yes/No
20. Prediction can be generated: Yes/No
21. Confidence score available: Yes/No
22. Grad-CAM available: Yes/No
23. Integration risk: Low/Medium/High
24. System Design
25. Design user flow
26. Design role-based access flow
27. Design database schema
28. Design system architecture
29. Create UML diagrams
30. Create UI wireframes
31. Define API endpoints
32. Implementation
33. Setup repository structure
34. Setup backend
35. Setup frontend
36. Setup database
37. Implement authentication and role-based access
38. Implement patient registration and profile
39. Implement doctor/admin workspace
40. Implement examination record
41. Implement X-Ray upload
42. Integrate AI prediction
43. Implement examination history
44. Implement PDF report generation
45. Testing and Integration
46. Unit testing
47. Integration testing
48. System testing
49. Acceptance testing
50. Bug fixing
51. Regression testing after changes
52. Document test results
53. Deployment
54. Prepare environment variables
55. Deploy frontend
56. Deploy backend
57. Connect deployed app to database
58. Verify image upload and PDF generation
59. Prepare demo account for patient, doctor, and admin
60. Maintenance Planning
61. Identify possible future improvements
62. Document known limitations
63. Plan bug fixing workflow
64. Plan future model improvement using doctor feedback
65. Plan security and dependency updates

# SDLC Documentation Table

| SDLC Phase            | Main Activities                                                      | Deliverables                                                        | Tools                                  |
| --------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------- | -------------------------------------- |
| Planning              | Define problem, scope, objective, feasibility, SDLC model            | Problem statement, scope boundary, SDLC selection, initial timeline | Google Docs/Notion, Google Sheets      |
| Requirement Analysis  | Identify stakeholders, FR, NFR, user stories, acceptance criteria    | Requirement specification, MoSCoW table, traceability matrix        | Google Docs/Notion, GitHub Issues      |
| System Design         | Design architecture, database, UML, UI flow, API                     | UML diagrams, ERD, architecture diagram, wireframes                 | Draw.io, Figma, Google Docs            |
| Implementation        | Build frontend, backend, database, AI integration, PDF report        | Working web application source code                                 | GitHub, VS Code, selected stack        |
| Testing & Integration | Unit, integration, system, acceptance testing                        | Test plan, test case table, test report, defect log                 | Pytest, browser testing, GitHub Issues |
| Deployment            | Deploy app and prepare demo                                          | Deployment link, demo accounts, setup guide                         | Vercel/Render/Supabase/GitHub          |
| Maintenance Planning  | Plan improvements, bug fixes, future AI retraining, security updates | Maintenance plan, future work, known limitations                    | GitHub Issues, documentation           |

**
