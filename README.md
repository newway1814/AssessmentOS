# AssessmentOS

AssessmentOS is an AI-powered assessment operating system for schools. It helps teachers and academic coordinators create, import, normalize, organize, validate, review, and export exams, assignments, worksheets, answer keys, rubrics, and school-specific paper templates.

It is B2B SaaS for institutional assessment operations, not a generic AI exam generator.

## Current MVP

The app now has a usable demo-mode foundation for the core assessment workflow:

- Question intake and import review with persisted import batches and mock normalization candidates
- Question repository with Drizzle-backed create/edit/archive flows
- Draft paper builder with persisted papers, sections, question ordering, marks totals, and validation panels
- School template management with persisted templates and realistic exam-paper previews
- Export preview with persisted export requests, student/teacher copy, answer key toggle, and assignment-mode placeholders
- Drizzle + SQLite database foundation, migration, and seed data
- Provider-replaceable dev/demo session and workspace context abstraction
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

`.env.example` also includes optional `ASSESSMENTOS_DEV_*` values for the local demo session. Those are development-only and should be replaced by a real auth provider before production.

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
- Drizzle-backed question, import, paper, template, and export request workflows
- Tenant-scoped repository constructors receiving school/workspace/user context
- Dev/demo session provider in `lib/auth/session.ts`
- Role and permission helpers for `ADMIN`, `ACADEMIC_COORDINATOR`, `REVIEWER`, and `TEACHER`
- Domain helpers for validation, paper totals, imports, templates, and exports

Demo/dev-only or placeholder today:

- Real login/session provider; local development uses a centralized demo session
- Upload storage and OCR
- AI normalization and generation
- PDF/DOCX rendering
- Export artifact storage
- Approval workflow, analytics, billing, and enterprise controls

## Production-Readiness Roadmap

1. Replace the dev/demo session provider with Auth.js, Clerk, school SSO, or another real provider.
2. Expand route protection, CSRF/rate-limit strategy, and audit-log review surfaces.
3. Persist validation results and any remaining approval/comment workflows that become part of the MVP.
4. Add real upload storage and import processing behind provider-neutral interfaces.
5. Add AI normalization only after source/rights review and candidate approval flows are protected by real auth.
6. Add real PDF/DOCX rendering behind the export request abstraction.

See `docs/PRODUCTION_READINESS.md` for the current audit.
