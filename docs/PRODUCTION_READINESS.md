# Production Readiness Audit

## Current Status

AssessmentOS has a coherent MVP product surface for the end-to-end assessment workflow:

- Import/intake review UI
- Question repository UI
- Paper builder UI
- School template editor and preview
- Export preview and assignment-mode placeholders
- Drizzle + SQLite schema, migration, seed, and database client
- Drizzle-backed persistence for imports, questions, papers, templates, and export requests
- Provider-replaceable dev/demo session and workspace context abstraction
- Specs for database setup, security, data model, and persistence migration

The app is not production-ready yet. It is a demo-mode MVP with real local persistence and a replaceable auth/workspace abstraction, but no real login provider or production deployment controls.

## Real Systems

- Next.js App Router dashboard routes
- TypeScript strict mode
- ESLint, Prettier, Vitest
- Drizzle ORM schema in `db/schema.ts`
- SQLite migration in `drizzle/`
- Seed script in `db/seed.ts`
- Domain validation helpers and tests
- Tenant-scoped repository constructors that require school/workspace/user context
- Role and permission helpers in `lib/auth/session.ts`
- Audit logs written by persisted mutation paths

## Mocked Systems

- Approval decisions and comments
- Audit activity shown to users
- Real login/session provider
- Upload storage, OCR, AI normalization, and generated PDF/DOCX artifacts

## Security Gaps

- Real authentication provider is not connected.
- Local development uses a dev/demo session provider.
- Role permission helpers exist, but route protection is still lightweight.
- There is no session handling, CSRF strategy, rate limiting, or protected mutation layer.
- Persisted mutation paths write audit logs, but there is no audit-log review UI yet.
- File and AI workflows are placeholders and must not accept untrusted production input.

## Persistence Gaps

- Validation results are not yet persisted for every runtime validation run.
- Approval requests, comments, analytics, and enterprise controls are still planned.
- Local SQLite is suitable for MVP development and demo persistence, not a final multi-tenant production hosting decision.

## Auth Gaps

- `getCurrentSession()` and `getCurrentWorkspaceContext()` resolve a centralized dev/demo session.
- Feature repositories receive school/workspace/user context through request-bound factory helpers.
- Role permissions cover questions, imports, papers, templates, exports, and audit-log viewing.
- Future protected routes must replace the dev/demo provider with a real session source and active workspace selector.

## Upload, AI, And Export Gaps

- Upload/dropzone UI is placeholder only.
- No real storage provider is configured.
- No OCR or document parsing exists.
- AI normalization output is mocked and must remain draft-only when implemented.
- PDF/DOCX export buttons are placeholders.
- Browser print preview is available, but generated export artifacts are not.

## Recommended Production Roadmap

1. Restore every MVP workflow to green checks before adding new product behavior.
2. Replace the dev/demo session provider with real Auth.js, Clerk, or school SSO integration.
3. Add route protection, CSRF/rate limiting, and a production session store.
4. Build audit-log review and administrative role-assignment surfaces.
5. Persist validation results for every mutation and export readiness run.
6. Add upload storage behind an abstraction before real OCR or AI processing.
7. Implement AI normalization only through import candidates with source/rights review.
8. Persist export requests before building real PDF/DOCX rendering.
9. Add deployment, backup, observability, rate-limit, and incident-response documentation before production launch.

## Production Gate

AssessmentOS should not be treated as production-ready until:

- Real auth and tenant authorization are enforced server-side.
- Mock adapters are retired for core workflows.
- Mutations are audited.
- Validation and content-rights checks block unsafe exports.
- Upload, AI, and export providers have explicit security boundaries.
- CI passes lint, typecheck, tests, format, build, migration generation, and migration application.
