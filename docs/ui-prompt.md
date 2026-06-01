# UI Guidelines

## Design Direction

Radia uses a clean clinical dashboard style:

- White and light gray backgrounds.
- Blue primary actions.
- Neutral text and borders.
- Compact cards, tables, and forms.
- Clear status badges for `READY` and `NOT READY`.
- Consistent English labels.
- Restrained spacing and typography.
- No decorative gradients or unnecessary animations.

## Core Components

- Button
- Form input
- Select
- Textarea
- Card
- Table
- Status badge
- Navbar
- Sidebar
- X-Ray upload preview
- Empty state
- Error/success message

## Page Guidelines

### Public

- Login uses one form for all roles.
- Register is patient-only and includes full name, email, phone, date of birth, gender, and password.

### Patient

- Show history and final doctor-approved information.
- Do not show AI confidence or internal AI details.
- Pending examinations can show symptoms and preliminary solution.
- Ready examinations show final diagnosis, final doctor note, and PDF download.

### Doctor

- Start New Scan should keep Patient Email, Symptoms / Complaints, and Preliminary Solution clearly stacked.
- X-Ray preview holder must stay fixed and should not become a black screen when no image is selected.
- Doctor detail should show AI result/confidence, final review controls, report action, and delete action.

### Admin

- User directory should be dense and clear.
- Medical staff promotion should search by patient email and show selected patient context.

## Accessibility and Usability

- Keep labels visible.
- Use readable contrast.
- Keep button text action-oriented.
- Use danger styling only for delete/destructive actions.
- Keep upload empty state friendly and non-black.
- Avoid exposing private storage object paths in the UI.
