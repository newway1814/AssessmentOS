# Production Readiness Audit

## Current Status

AssessmentOS has a coherent MVP product surface for the end-to-end assessment workflow:

- Import/intake review UI
- Question repository UI
- Paper builder UI
- School template editor and preview
- Export preview and assignment-mode placeholders
- Drizzle + SQLite schema, migration, seed, and database client
- Specs for database setup, security, data model, and persistence migration

The app is not production-ready yet. It is a demo-mode MVP shell with real architecture foundations and mocked workflow adapters.

## Real Systems

- Next.js App Router dashboard routes
- TypeScript strict mode
- ESLint, Prettier, Vitest
- Drizzle ORM schema in `db/schema.ts`
- SQLite migration in `drizzle/`
- Seed script in `db/seed.ts`
- Domain validation helpers and tests
- Mocked repository/service boundaries that can be replaced one workflow at a time

## Mocked Systems

- Question repository data access in the UI
- Import batches and normalized question cards
- Paper list/editor persistence
- Template list/editor persistence
- Export readiness records and preview composition
- Approval decisions and comments
- Audit activity shown to users

## Security Gaps

- No authentication is connected.
- No role-based authorization is enforced.
- Tenant isolation exists in schema design but not in runtime policies.
- There is no session handling, CSRF strategy, rate limiting, or protected mutation layer.
- Sensitive operations are not backed by audit logs yet.
- File and AI workflows are placeholders and must not accept untrusted production input.

## Persistence Gaps

- UI workflows still use mock adapters.
- Drizzle tables exist, but repository functions do not yet read/write them.
- Mutation paths do not yet create question versions, validation records, export requests, or audit logs.
- Local SQLite is suitable for MVP development and demo persistence, not a final multi-tenant production hosting decision.

## Auth Gaps

- No user login or session model is wired into the app.
- Role assignments exist in the schema, but there are no policy helpers.
- School/workspace context is hardcoded in mocks.
- Future protected routes must resolve active user, school, workspace, and role before data access.

## Upload, AI, And Export Gaps

- Upload/dropzone UI is placeholder only.
- No real storage provider is configured.
- No OCR or document parsing exists.
- AI normalization output is mocked and must remain draft-only when implemented.
- PDF/DOCX export buttons are placeholders.
- Browser print preview is available, but generated export artifacts are not.

## Recommended Production Roadmap

1. Restore every MVP workflow to green checks before adding new product behavior.
2. Replace mock repositories with Drizzle-backed repositories in the order defined in `specs/PERSISTENCE_PLAN.md`.
3. Add tenant-scoped repository helpers requiring `schoolId` and `workspaceId`.
4. Add authentication and role-policy helpers before any production data is exposed.
5. Persist validation results and audit logs for every mutation.
6. Add upload storage behind an abstraction before real OCR or AI processing.
7. Implement AI normalization only through import candidates with source/rights review.
8. Persist export requests before building real PDF/DOCX rendering.
9. Add deployment, backup, observability, rate-limit, and incident-response documentation before production launch.

## Production Gate

AssessmentOS should not be treated as production-ready until:

- Auth and tenant authorization are enforced server-side.
- Mock adapters are retired for core workflows.
- Mutations are audited.
- Validation and content-rights checks block unsafe exports.
- Upload, AI, and export providers have explicit security boundaries.
- CI passes lint, typecheck, tests, format, build, migration generation, and migration application.
