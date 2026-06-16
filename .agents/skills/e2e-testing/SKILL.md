---
name: e2e-testing
description: Plan and run end-to-end checks for AssessmentOS user workflows when browser confidence is required.
---

# E2E Testing

Use this skill when a task changes a complete workflow, navigation between screens, or user-visible form behavior.

## Candidate Flows

- Question repository: create, edit, filter, inspect.
- Paper builder: open paper, add/remove questions, validate marks.
- Templates: create/edit template, preview paper header.
- Exports: open preview, toggle teacher/student copy, assignment mode.
- Imports: start intake, mock normalize, approve/reject cards.

## Guidance

- Prefer stable selectors, labels, and visible text.
- Test one happy path and one empty/error/placeholder state where relevant.
- Keep E2E coverage focused; do not build a giant suite for a small change.

## Report

- Route tested.
- Scenario covered.
- Result.
- Any skipped coverage and why.
