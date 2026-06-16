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
8. Database migration pass for import candidates, export requests, pinned paper question versions, tenant-scoped repository helpers, and richer seed coverage.

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

## Database Setup

Use [`DATABASE_SETUP.md`](./DATABASE_SETUP.md) as the operating spec for the next persistence pass.

The next schema pass should:

- Move from prototype `db push` habits toward migration-backed Drizzle development.
- Add import batch/candidate persistence before any real OCR or AI calls.
- Add export request persistence before real PDF/DOCX rendering.
- Require tenant-scoped repository helpers for school-owned data.
- Preserve source and rights metadata at every import and question boundary.

## Review Strategy

- Each PR should have one clear product or engineering objective.
- Specs should change with behavior.
- Tests should scale with risk and blast radius once tooling exists.
- Avoid shipping hidden behavior not represented in specs.
