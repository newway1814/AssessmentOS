---
name: shipping-and-launch
description: Prepare AssessmentOS changes for handoff by confirming checks, scope, docs, commit state, and rollout risks.
---

# Shipping And Launch

Use this skill before final handoff of a completed task.

## Checklist

- Requested scope is complete.
- No unrelated product areas were implemented.
- Specs/docs updated when behavior changed.
- No secrets or generated artifacts are staged.
- Required checks pass or failures are explained.
- Commit is clean and hash is known.
- Push status and CI status are reported when applicable.

## Standard Commands

- `npm run db:generate`
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run format`
- `npm run build`

## Handoff

Report changed files, commit hash, commands run, mocked versus real behavior, manual setup, and CI state when checked.
