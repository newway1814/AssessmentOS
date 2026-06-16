---
name: incremental-implementation
description: Implement AssessmentOS features in small vertical slices that respect specs, typed service boundaries, and reviewability.
---

# Incremental Implementation

Use this skill for multi-file feature work.

## Slice Shape

1. Domain types and pure helpers.
2. Mock or repository/service adapter.
3. Route/page wiring.
4. Client UI.
5. Focused tests.
6. Verification and commit.

## Architecture Rules

- Do not call Prisma directly from React components.
- Keep AI, uploads, templates, exports, and validation behind typed abstractions.
- Preserve school/workspace scoping in data access design.
- Make placeholders explicit.

## Verification

Run the smallest useful checks while developing, then the required final commands before commit.
