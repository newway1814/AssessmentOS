# Security and Privacy

## Data Isolation

- School and workspace isolation is mandatory.
- Every customer-owned domain record must be scoped directly or through a required parent relation.
- Authorization must be enforced in the backend/API layer, not only in the UI.

## Roles and Permissions

Required role concepts:

- Teacher
- Academic coordinator
- Reviewer
- School admin

Permissions should cover repository access, paper editing, template management, validation review, approval actions, exports, comments, and admin settings.

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
