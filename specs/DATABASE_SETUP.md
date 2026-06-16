# Database Setup And Schema Spec

## Purpose

This spec defines the sensible default database setup for AssessmentOS before the next schema implementation pass.

AssessmentOS is a multi-school B2B SaaS product. The database must make tenant isolation, question provenance, version history, reviewability, validation, and auditability first-class from the beginning without overbuilding enterprise sharing, billing, analytics, OCR, AI, or rendering.

## Decisions

| Area                | Decision                                                                                                         |
| ------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Database            | PostgreSQL for local, staging, and production.                                                                   |
| ORM                 | Prisma with generated client kept out of hand-authored domain types.                                             |
| Migration policy    | Use Prisma migrations for schema history; avoid `db push` for shared environments.                               |
| Local setup         | `DATABASE_URL` in `.env`; local Postgres may run through Docker, native Postgres, or managed dev DB.             |
| Tenant boundary     | `School` is the top-level tenant; `Workspace` is the daily collaboration/data boundary.                          |
| Campuses            | Optional in MVP; schema supports them but does not require campus assignment.                                    |
| User membership     | Users may belong to multiple schools and workspaces through role assignments.                                    |
| Question versioning | `Question` is stable identity; `QuestionVersion` is append-only snapshot history.                                |
| Paper references    | `PaperQuestion` pins the selected `QuestionVersion` and may store display overrides.                             |
| Imports             | Imported/normalized drafts live outside `Question` until approved.                                               |
| Validation          | Store validation results for review/audit, while allowing recalculation on demand.                               |
| Audit logs          | Append-only event records for important mutations; include metadata snapshots when useful.                       |
| Deletes             | Prefer archive/status fields for user-facing content; hard delete only child drafts or failed ephemeral records. |
| Content rights      | Every question and import candidate must preserve source and usage-rights metadata.                              |

## Environment Setup

Required variables:

```env
DATABASE_URL="postgresql://assessmentos:assessmentos@localhost:5432/assessmentos?schema=public"
```

Recommended local options:

- Docker Postgres for repeatable local development.
- Native Postgres for developers who already run it locally.
- Managed development Postgres for hosted preview environments.

Do not commit real database credentials. `.env.example` should show shape only.

## Prisma Workflow

Expected scripts:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

Current scripts may keep `db:push` for local prototyping, but migration-backed development should become the default before shared database work begins.

Rules:

- Run Prisma generation before typecheck in CI.
- Keep generated Prisma types separate from hand-authored domain schemas.
- Put repository/query helpers behind tenant-scoped data access functions.
- Do not call Prisma directly from React components.
- Seed one realistic demo school with roles, taxonomy, questions, templates, papers, import candidates, validation results, and audit logs.

## Tenant And Access Model

### School

Top-level customer tenant. Owns all customer data.

### Workspace

Primary working boundary for assessment teams. Most operational records should include both `schoolId` and `workspaceId`.

### Campus

Optional school sub-unit. Campus is useful for future multi-campus reporting and controls but should not complicate MVP flows.

### User And Role

Users are global identities. Access comes through role assignments:

- `schoolId` required.
- `workspaceId` optional for school-wide roles.
- `campusId` optional only when campus-specific permissions become necessary.

MVP roles:

- `TEACHER`
- `ACADEMIC_COORDINATOR`
- `REVIEWER`
- `SCHOOL_ADMIN`

Authorization must be enforced in backend services or policy helpers, not only by UI visibility.

## Core Schema Domains

### Academic Taxonomy

Use relational records for taxonomy, scoped to workspace:

- `Subject`
- `Grade`
- `Chapter`
- `Subtopic`

Keep names school-customizable. Do not use global canonical subject or grade tables in MVP.

Recommended constraints:

- `Subject`: unique by `workspaceId + name`.
- `Grade`: unique by `workspaceId + name`.
- `Chapter`: unique by `subjectId + name`.
- `Subtopic`: unique by `chapterId + name`.

### Question Repository

`Question` stores the current canonical repository card.

Required:

- `schoolId`
- `workspaceId`
- `sourceId`
- `subjectId`
- `gradeId`
- optional `chapterId`
- optional `subtopicId`
- `type`
- `prompt`
- `marks`
- optional `difficulty`
- `status`
- `createdById`

`QuestionVersion` stores immutable snapshots:

- `questionId`
- `versionNumber`
- content snapshot
- metadata snapshot
- source/rights snapshot or source reference
- answer key snapshot if changed
- editor
- change reason
- created timestamp

Question edits should create a new version for meaningful content, taxonomy, marks, answer key, or source/rights changes.

### Answer Keys

Use `AnswerKey` as a structured record rather than burying answer text in `Question`.

For MVP:

- Allow one answer key per current question.
- Allow version-level answer key snapshots.
- Allow paper-level answer key output.

Future:

- Multiple accepted answers.
- Rubric links.
- Marking schemes by section.
- Generated answer key drafts.

### Source And Rights

`QuestionSource` is required for every question and import candidate.

Required metadata:

- `sourceType`
- `title`
- optional `author`
- optional `owner`
- optional `license`
- `rightsStatus`
- `usageRights`
- optional `attributionText`
- optional `originalUrl`
- optional `uploadId`
- optional `verifiedAt`
- creator and timestamps

Allowed source types:

- `TEACHER_CREATED`
- `SCHOOL_OWNED`
- `LICENSED`
- `OPEN`
- `PUBLIC_DOMAIN`
- `VERIFIED_PARTNER`

Do not model random web scraping. Verified external content must come from approved partner/import channels with source metadata.

### Uploads And Imports

Uploads and import review are separate concepts.

`Upload` stores file/storage metadata:

- filename
- content type
- size
- storage key
- upload status
- uploader
- source and rights metadata

`ImportBatch` should be added before real import persistence:

- `schoolId`
- `workspaceId`
- optional `uploadId`
- submitted by user
- source option
- status
- raw pasted text or storage reference
- normalization provider metadata, if any
- rights warning acknowledgement
- timestamps

`ImportCandidate` should store normalized draft questions before approval:

- `importBatchId`
- normalized prompt
- metadata fields
- answer key draft
- source and rights metadata snapshot
- confidence
- review status
- reviewer
- approved question id, once accepted

Import candidates must not become `Question` records until approved.

### Papers

`Paper` is the assessment document.

Required:

- `schoolId`
- `workspaceId`
- `subjectId`
- `gradeId`
- optional `templateVersionId`
- title
- duration minutes
- total marks target
- status
- creator

`PaperSection` stores ordered sections.

`PaperQuestion` stores ordered placements:

- `paperSectionId`
- `questionId`
- required `questionVersionId`
- order
- optional marks override
- optional prompt/display override
- display settings JSON

Rule: paper preview/export should use the pinned question version and any explicit paper overrides, not whatever the repository question currently says.

### Templates

`Template` is stable identity. `TemplateVersion` stores structure and rendering metadata.

`TemplateVersion.structure` may be JSON in MVP, but must have a Zod schema at the application boundary.

Template version structure should include:

- school name
- logo reference or placeholder
- header text
- footer text
- instructions
- student metadata fields
- default duration
- default total marks
- section pattern
- page rule notes

Approved papers should reference a specific template version.

### Validation

Persist `ValidationResult` records for user-visible review and audit history.

Recommended fields:

- `schoolId`
- `workspaceId`
- `targetType`
- `targetId`
- optional `targetVersionId`
- severity
- code
- message
- optional field path
- optional suggested fix
- status or resolved timestamp
- created timestamp

Validation targets:

- question
- import candidate
- paper
- template
- upload
- export request

### Approval And Comments

Approval workflow is future scope, but schema may keep these tables available:

- `ApprovalRequest`
- `Comment`

Approval requests should target questions, papers, templates, imports, or exports through `targetType + targetId`.

Comments should be scoped to school/workspace and support resolution state.

### Export Requests

Add `ExportRequest` before real PDF/DOCX rendering:

- `schoolId`
- `workspaceId`
- `paperId`
- `templateVersionId`
- requested format
- requested copy type
- status
- readiness summary
- requested by user
- optional storage key for future generated artifact
- timestamps

MVP export preview can remain mock-only, but the database should eventually record export attempts and readiness state.

### Audit Logs

`AuditLog` is append-only.

Required for:

- question create/edit/archive
- question version creation
- import batch create/review/approve/reject
- upload create/status change
- paper create/edit/archive
- template create/version/activate/archive
- validation result creation/resolution
- approval request changes
- export request creation
- role changes

Fields:

- `schoolId`
- optional `workspaceId`
- optional `actorId`
- action
- target type
- target id
- metadata JSON
- created timestamp

Store before/after snapshots only for high-value mutations or where audit review needs them. Avoid copying full large document bodies into every audit log event.

## Enum Baseline

Stable enums:

- `RoleName`
- `QuestionType`
- `QuestionStatus`
- `SourceType`
- `RightsStatus`
- `UploadStatus`
- `ImportStatus`
- `ImportCandidateStatus`
- `PaperStatus`
- `TemplateStatus`
- `TemplateType`
- `ValidationSeverity`
- `ValidationTargetType`
- `ApprovalStatus`
- `ExportFormat`
- `ExportStatus`
- `ExportCopyType`

Use enums for workflow states that power UI badges, validation, or authorization. Use strings only for user-defined labels.

## Indexing And Constraints

Baseline indexes:

- `[schoolId, workspaceId]` on all workspace-owned records.
- `[targetType, targetId]` on validation results, comments, approvals, and audit logs.
- `[questionId, versionNumber]` unique on question versions.
- `[paperSectionId, order]` unique on paper questions.
- `[templateId, versionNumber]` unique on template versions.
- `[workspaceId, name]` unique on subject and grade.

Future performance indexes should be based on real query patterns, especially repository filters by grade, subject, chapter, difficulty, rights status, and updated date.

## MVP Implementation Order

1. Add migration-backed Prisma workflow and local Postgres setup notes.
2. Add missing enums for imports and exports.
3. Add `ImportBatch` and `ImportCandidate`.
4. Require `PaperQuestion.questionVersionId` for new paper placements.
5. Add paper duration and total marks target fields.
6. Add template version Zod schema for `structure`.
7. Add `ExportRequest`.
8. Tighten repository helpers so every customer query requires `schoolId` and `workspaceId`.
9. Expand seed data to cover the end-to-end MVP workflows.

## Non-Goals

- Real OCR.
- Real AI normalization.
- Real file storage provider integration.
- Real PDF/DOCX generation.
- Billing or marketplace schema.
- Cross-school content sharing.
- Multi-campus enterprise controls beyond optional campus references.

## Acceptance Criteria For The Next Schema Pass

- Prisma schema represents the entities and decisions in this spec.
- `npm run db:generate` passes.
- Migration files are created for schema changes.
- Seed data covers one realistic school workspace and all MVP workflow surfaces.
- Domain Zod schemas exist for import candidates, paper placements, template version structure, validation inputs, and export requests.
- Repository helpers prevent tenant context from being optional for school-owned data.
