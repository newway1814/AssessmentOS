---
name: debugging-and-error-recovery
description: Diagnose failed builds, tests, runtime errors, or unexpected AssessmentOS behavior with evidence before changing code.
---

# Debugging And Error Recovery

Use this skill when something fails or behaves unexpectedly.

## Workflow

1. Reproduce the failure with the smallest command or route.
2. Capture the exact error message and relevant stack/log lines.
3. Map the error to the code path.
4. Fix the root cause, not just the symptom.
5. Rerun the failing command first, then the broader check set.

## Common Checks

- `npm run db:generate`
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run format`
- `npm run build`

## Rules

- Do not guess at CI failures if logs are accessible.
- Do not delete generated or source files as a first response.
- If Next mutates `next-env.d.ts` with generated route imports, remove that drift before committing.
