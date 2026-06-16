# Persistence Plan

## Purpose

This plan defines how AssessmentOS should replace mock repositories with Drizzle-backed repositories without changing product scope or adding AI, OCR, auth, uploads, billing, or real export rendering.

The migration should happen one workflow at a time. Each step must preserve the existing UI behavior while moving data access behind tenant-scoped service/repository boundaries.

## Repository Boundary Rules

- Do not call Drizzle directly from React components.
- Every school-owned query must require `schoolId` and `workspaceId`.
- Mutations must validate inputs with Zod or domain schemas before writing.
- Source and usage-rights metadata must be preserved for every imported or repository question.
- Meaningful question edits must create `QuestionVersion` records.
- Mutations should write audit logs once audit persistence is connected.
- Mock adapters should be retired only after equivalent Drizzle-backed tests exist.

## Implementation Order

### 1. Questions

Replace the mock question repository first.

Required behavior:

- List questions by active school/workspace.
- Preserve filtering and inspector metadata.
- Create questions with `QuestionSource`, `Question`, `QuestionVersion`, and `AnswerKey`.
- Edit questions by updating the current question and appending `QuestionVersion`.
- Archive questions through status, not hard delete.

Tests:

- Repository list is tenant-scoped.
- Create persists source/rights metadata.
- Edit increments version history.
- Archive excludes or marks archived records consistently with UI behavior.

### 2. Imports

Persist import review after questions are stable.

Required behavior:

- Store `ImportBatch` for pasted text and placeholder upload sources.
- Store normalized draft cards as `ImportCandidate`.
- Approve candidates into canonical questions through the question repository.
- Reject or mark candidates as edit-later without creating questions.

Tests:

- Import candidates do not appear in the repository until approved.
- Approved candidates preserve source and rights metadata.
- Restricted rights remain blocked or flagged for review.

### 3. Papers

Move paper list/editor state to Drizzle.

Required behavior:

- List papers by tenant.
- Open a paper with sections and ordered questions.
- Add questions pinned to a required `QuestionVersion`.
- Remove and reorder paper questions.
- Calculate totals from persisted section/question records.

Tests:

- Paper questions are version-pinned.
- Section ordering is stable.
- Marks totals match persisted records.

### 4. Templates

Persist school templates and versions.

Required behavior:

- List templates by school/workspace.
- Create and edit draft templates.
- Append `TemplateVersion` for meaningful layout changes.
- Activate/archive templates by status.
- Keep template structure validated at the boundary.

Tests:

- Existing papers retain their selected template version.
- Template structure rejects missing required header/instruction fields.

### 5. Exports

Persist export readiness before real rendering.

Required behavior:

- Create `ExportRequest` for paper preview/export attempts.
- Store requested format, copy type, template version, requester, and readiness summary.
- Keep PDF/DOCX buttons as placeholders until rendering exists.

Tests:

- Export requests are tenant-scoped.
- Readiness records reflect validation blockers.
- No generated artifact is promised when rendering is not connected.

### 6. Validation Results

Persist validation checks for review and audit.

Required behavior:

- Store validation results for questions, import candidates, papers, templates, uploads, and exports.
- Support severity, code, target, field path, suggested fix, and resolution state.
- Recalculate on demand while keeping visible results reviewable.

Tests:

- Validation targets are queryable by target type/id.
- Error severity blocks export readiness where required.

### 7. Audit Logs

Wire audit logs into mutations after core persistence is stable.

Required behavior:

- Append audit logs for create/edit/archive/approve/reject/export actions.
- Include actor, tenant context, action, target, and compact metadata.
- Avoid storing large document bodies in every audit event.

Tests:

- Important mutations create audit logs.
- Audit queries are tenant-scoped.

## Acceptance Criteria

- Existing UI behavior remains intact after each repository migration.
- `npm run lint`, `npm run typecheck`, `npm run test`, `npm run format`, and `npm run build` pass after each step.
- Drizzle migrations are generated and committed for schema changes.
- Seed data continues to support the guided demo workflow.
- Mock adapters are removed only when their Drizzle-backed replacement is covered by tests.
