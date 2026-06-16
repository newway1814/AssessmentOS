# Security and Privacy

## Data Isolation

- School and workspace isolation is mandatory.
- Every customer-owned domain record must be scoped directly or through a required parent relation.
- Authorization must be enforced in the backend/API layer, not only in the UI.

## Roles and Permissions

Implemented role concepts:

- `ADMIN`
- `ACADEMIC_COORDINATOR`
- `REVIEWER`
- `TEACHER`

Current permission helpers live in `lib/auth/session.ts`:

- `canManageQuestions`
- `canManageImports`
- `canManagePapers`
- `canManageTemplates`
- `canCreateExports`
- `canViewAuditLogs`

The current app uses a provider-replaceable dev/demo session provider through `getCurrentSession()` and `getCurrentWorkspaceContext()`. Persisted repositories receive school/workspace/user context from server-side callers instead of importing demo tenant constants directly.

Future real auth integration should replace only the session provider with Auth.js, Clerk, school SSO, or another provider, then add route protection, active workspace selection, CSRF/rate limiting, and production session storage.

## Auditability

Audit logs should capture important actions:

- Question creation and edits
- Import and normalization actions
- Source and rights metadata changes
- Paper creation and edits
- Template changes
- Validation runs
- Approval actions
- Export requests
- Role and workspace changes

Persisted mutation paths should write audit logs with the session actor ID where practical.

## Content Rights

Do not design random copyrighted web scraping.

External content must be:

- School-owned
- Teacher-created
- Licensed
- Open
- Public-domain
- Verified partner content

Every imported question must preserve source and usage-rights metadata.

## Secrets

- Do not commit real secrets.
- Keep `.env.example` as documentation only.
- Validate required environment variables once implementation tooling exists.

## AI Safety

- Treat AI output as draft content.
- Preserve provenance and user review steps.
- Validate AI output before repository entry, paper use, or export readiness.
