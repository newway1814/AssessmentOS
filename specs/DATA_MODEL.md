# Data Model

## Database Direction

Use SQLite with Drizzle ORM as the primary MVP persistence path. The detailed database setup, migration policy, tenant decisions, and next schema pass are defined in [`DATABASE_SETUP.md`](./DATABASE_SETUP.md).

The current implementation may use mock adapters for MVP UI workflows, but persistent data design should follow the database setup spec before real writes are introduced.

## Core Entities

### School

Top-level customer account. Owns campuses, workspaces, users, templates, repositories, and audit logs.

Key fields: name, slug, status, createdAt, updatedAt.

### Campus

Optional school sub-unit for physical or administrative separation.

Key fields: schoolId, name, status.

### Workspace

Collaboration boundary for subjects, grades, teachers, repositories, and papers.

Key fields: schoolId, campusId optional, name, defaultLocale, status.

### User

Authenticated person associated with one or more schools/workspaces.

Key fields: name, email, status, createdAt.

### Role

Permission assignment such as teacher, coordinator, reviewer, or admin.

Role assignments should include schoolId, workspaceId optional, userId, roleName, and status.

### Subject, Grade, Chapter, Subtopic

Academic taxonomy used to classify questions and papers.

Taxonomy records should be school/workspace-scoped so schools can adapt naming and hierarchy.

### Question

Canonical question card. Stores current normalized content, metadata, ownership, rights, and status.

Key fields: schoolId, workspaceId, subjectId, gradeId, chapterId optional, subtopicId optional, type, prompt, marks, difficulty, status, sourceId, createdById, updatedAt.

Questions should only represent approved repository content. Imported normalized drafts should remain as import candidates until reviewed and approved.

### QuestionVersion

Immutable or append-only version record for significant question changes.

Versions should capture content snapshot, metadata snapshot, editor, and change reason.

### QuestionSource

Source and usage-rights metadata for teacher-authored or imported questions.

Key fields: sourceType, title, author, owner, license, usageRights, attributionText, originalUrl optional, uploadId optional, verifiedAt optional.

### Upload

File import record for source documents, images, or templates.

Key fields: schoolId, workspaceId, uploadedById, filename, contentType, byteSize, storageKey, sourceType, usageRights, processingStatus.

Uploads are storage/source records, not normalized question drafts. Import review state should live in import-specific records.

### ImportBatch

MVP-ready import workflow record for pasted text, PDF/image/DOCX placeholders, school repository batches, or verified external source placeholders.

Key fields: schoolId, workspaceId, uploadId optional, submittedById, sourceOption, status, rawText optional, rightsAcknowledgedAt optional, normalizationMetadata optional, createdAt, updatedAt.

### ImportCandidate

Normalized draft question card produced by import or mock normalization before repository approval.

Key fields: importBatchId, normalized prompt and metadata, answer key draft, source/rights snapshot, confidence optional, reviewStatus, reviewedById optional, approvedQuestionId optional.

Import candidates must preserve source and usage-rights metadata and must not enter the canonical question repository until approved.

### MediaAsset

Stored media reference used by questions, papers, rubrics, or templates.

Media assets should reference storage metadata and rights/source metadata when externally supplied.

### Paper

Assessment document draft or published assessment.

Key fields: schoolId, workspaceId, title, subjectId, gradeId, templateVersionId optional, status, createdById.

### PaperSection

Logical section within a paper.

Key fields: paperId, title, instructions, order, marks optional.

### PaperQuestion

Placement of a question inside a paper, including order, marks, overrides, and display settings.

Question content should reference a required question version or snapshot to avoid accidental changes after paper assembly.

### Template

School-specific paper or worksheet template.

Key fields: schoolId, workspaceId optional, name, templateType, status, createdById.

### TemplateVersion

Versioned template structure and rendering rules.

Approved templates should be versioned so existing papers can keep their original layout contract.

### Rubric

Evaluation rubric connected to questions, papers, sections, or assignments.

Rubrics should support structured criteria, levels, marks, and optional free-text guidance.

### AnswerKey

Answer metadata connected to questions or papers.

MVP may store placeholder readiness status before full answer-key generation exists.

### ValidationResult

Result of validation rules against a question, paper, template, import, or export target.

Key fields: targetType, targetId, targetVersionId optional, severity, code, message, field optional, suggestedFix optional, resolvedAt optional, createdAt.

### ApprovalRequest

Post-MVP review request for content, paper, template, or export approval.

Post-MVP entity. Keep relationships visible now so paper and template states can evolve cleanly.

### Comment

Threaded discussion attached to questions, papers, templates, validation issues, or approval requests.

Comments should preserve author, target, body, timestamps, and resolution state where applicable.

### AuditLog

Append-only record of important user and system actions.

Key fields: schoolId, workspaceId optional, actorId, action, targetType, targetId, metadata, createdAt.

### ExportRequest

Future-ready export request record for PDF, DOCX, print, or preview readiness workflows.

Key fields: schoolId, workspaceId, paperId, templateVersionId, requestedById, format, copyType, status, readinessSummary, storageKey optional, createdAt, updatedAt.

## Important Relationships

- School has many campuses, workspaces, users through roles, templates, uploads, questions, papers, and audit logs.
- Workspace has many taxonomy records, questions, papers, uploads, validation results, and comments.
- Question has many question versions and one or more question sources.
- ImportBatch has many ImportCandidates; approved candidates may create or link to one Question.
- Paper has many sections; sections have many paper questions.
- PaperQuestion references a question and should preserve the selected question version or content snapshot.
- Template has many template versions; papers reference the template version used.
- ValidationResult targets questions, papers, templates, uploads, imports, or export requests.

## Content Rights Rule

Do not design random copyrighted web scraping. External content must be school-owned, teacher-created, licensed, open, public-domain, or verified partner content.

Every imported question must preserve source and usage-rights metadata.

## Isolation Rule

All customer-owned records must include school/workspace scoping either directly or through a required parent relation.

Queries must be written from an active school/workspace context. Records without tenant context should be limited to global configuration or system metadata.
