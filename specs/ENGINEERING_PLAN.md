# Engineering Plan

## Approach

Build AssessmentOS through small, spec-driven PRs.

## Sequence

1. Foundation specs and agent instructions.
2. App skeleton and tooling.
3. Domain types, schemas, and mock data.
4. Question repository MVP slice.
5. Draft paper editor MVP slice.
6. Template setup and validation improvements.
7. Import, normalization, answer key, and export placeholders.

## Tooling Targets

When implementation begins:

- Next.js App Router
- TypeScript strict mode
- Tailwind CSS
- shadcn/ui
- Radix primitives
- ESLint and formatting
- Zod
- Typed service interfaces
- Test setup appropriate to the chosen stack

## Service Interfaces

Define provider-agnostic interfaces for:

- AI normalization
- Upload/storage
- Template extraction
- Export/rendering
- Validation
- Audit logging

## Review Strategy

- Each PR should have one clear product or engineering objective.
- Specs should change with behavior.
- Tests should scale with risk and blast radius once tooling exists.
- Avoid shipping hidden behavior not represented in specs.
