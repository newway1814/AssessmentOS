---
name: spec-driven-development
description: Define or update AssessmentOS behavior in specs before implementation when product behavior changes.
---

# Spec Driven Development

Use this skill for any new product behavior, workflow, data model change, or architecture decision.

## Workflow

1. Read the relevant spec files.
2. Define behavior, constraints, and acceptance criteria.
3. Mark MVP versus future scope.
4. Only then implement the smallest useful slice.
5. Update specs again if implementation reveals a better product rule.

## AssessmentOS Spec Files

- `/specs/PRD.md`
- `/specs/ARCHITECTURE.md`
- `/specs/DATA_MODEL.md`
- `/specs/API_SPEC.md`
- `/specs/UX_FLOWS.md`
- `/specs/UI_SYSTEM.md`
- `/specs/TYPESCRIPT_STANDARDS.md`
- `/specs/MVP_SCOPE.md`
- `/specs/NON_GOALS.md`
- `/specs/ACCEPTANCE_CRITERIA.md`

## Rules

- MVP first.
- Keep PRs and commits reviewable.
- Do not implement future scope unless explicitly requested.
