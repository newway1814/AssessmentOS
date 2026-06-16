# AssessmentOS

AssessmentOS is an AI-powered assessment operating system for schools. It helps teachers and academic coordinators create, import, normalize, organize, validate, review, and export exams, assignments, worksheets, answer keys, rubrics, and school-specific paper templates.

It is B2B SaaS for institutional assessment operations, not a generic AI exam generator.

## Current MVP

The app now has a usable demo-mode foundation for the core assessment workflow:

- Question intake and import review placeholders
- Question repository with create/edit/archive flows backed by mock data
- Draft paper builder with sections, repository question selection, marks totals, and validation panels
- School template management with realistic exam-paper previews
- Export preview with student/teacher copy, answer key toggle, and assignment-mode placeholders
- Drizzle + SQLite database foundation, migration, and seed data
- Spec and production-readiness documentation

## Routes

- `/` - product landing/root placeholder
- `/dashboard` - workspace overview and workflow narrative
- `/dashboard/demo` - guided end-to-end demo workflow
- `/dashboard/imports` - question intake/import review workflow
- `/dashboard/questions` - question repository
- `/dashboard/papers` - paper list and create flow
- `/dashboard/papers/paper-grade-8-algebra-checkpoint` - demo paper editor
- `/dashboard/templates` - school template list and create flow
- `/dashboard/templates/template-riverside-standard-exam` - demo template editor
- `/dashboard/exports` - export readiness list
- `/dashboard/exports/paper-grade-8-algebra-checkpoint` - print-style export preview
- `/docs` - documentation entry route

## Demo Workflow

Use `/dashboard/demo` or follow this sequence:

1. Import questions in `/dashboard/imports`.
2. Review normalized cards and source/rights metadata.
3. Open the repository in `/dashboard/questions`.
4. Build a draft paper in `/dashboard/papers`.
5. Apply or inspect a school template in `/dashboard/templates`.
6. Preview export readiness and assignment mode in `/dashboard/exports`.

## Local Setup

```bash
npm install
copy .env.example .env
npm run db:migrate
npm run db:seed
npm run dev
```

Use this local database setting:

```env
DATABASE_URL="./data/assessmentos.sqlite"
```

SQLite files under `data/` are ignored by git.

## Database Commands

```bash
npm run db:generate  # Generate Drizzle migrations from db/schema.ts
npm run db:migrate   # Apply migrations to the SQLite database
npm run db:seed      # Seed demo school/workspace data
npm run db:push      # Push schema directly for local prototyping
npm run db:studio    # Open Drizzle Studio
```

## Verification

```bash
npm run lint
npm run typecheck
npm run test
npm run format
npm run build
```

## Mocked vs Real

Real today:

- Next.js App Router shell and dashboard routes
- Strict TypeScript, ESLint, Prettier, Vitest
- Drizzle SQLite schema, migration, seed, and database client
- Domain helpers for validation, paper totals, imports, templates, and exports

Mocked or placeholder today:

- Auth and role enforcement
- Real repository persistence in UI workflows
- Upload storage and OCR
- AI normalization and generation
- PDF/DOCX rendering
- Export artifact storage
- Approval workflow, analytics, billing, and enterprise controls

## Production-Readiness Roadmap

1. Replace mock repositories with Drizzle-backed repositories in the order documented in `specs/PERSISTENCE_PLAN.md`.
2. Add authentication, role-based authorization, and tenant-scoped policy checks.
3. Wire audit logs and persisted validation results into every mutation.
4. Add real upload storage and import processing behind provider-neutral interfaces.
5. Add AI normalization only after source/rights review and candidate approval flows are persistent.
6. Add export request persistence before real PDF/DOCX rendering.

See `docs/PRODUCTION_READINESS.md` for the current audit.
