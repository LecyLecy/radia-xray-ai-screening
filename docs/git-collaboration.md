# Git and Collaboration

## Repository Strategy

Radia uses a monorepo:

```text
frontend/
backend/
docs/
supabase/
.github/workflows/
```

## Branching Strategy

| Branch | Purpose |
| --- | --- |
| `dev` | Active integration branch. |
| `main` | Stable final/demo branch. |

Only `dev` and `main` are maintained for this solo/final workflow. Changes should be tested on `dev`, committed, then merged or fast-forwarded into `main`.

## Commit Convention

Use concise conventional prefixes:

- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation update
- `test:` test or verification change
- `refactor:` internal code improvement
- `chore:` maintenance
- `style:` UI or formatting only

## Final Push Workflow

```powershell
git status
git add .
git commit -m "docs: finalize project documentation"
git checkout main
git merge dev
git push origin dev
git push origin main
```

If conflicts occur, local project changes are treated as the source of truth per project instruction.

## Files That Must Not Be Committed

- `.env`
- `.env.local`
- `.venv/`
- `node_modules/`
- `dist/`
- `__pycache__/`
- uploaded images or generated reports
- Supabase signed URLs
- secret keys or tokens
- large model checkpoints unless explicitly approved

## Evidence For Submission

- Commit history.
- `dev` and `main` branch state.
- README setup guide.
- `docs/` final documentation.
- GitHub Actions successful backend/frontend CI runs.
- Screenshots with secrets redacted.
