# MVP Scope

## Included

- School workspace concept
- Teacher-authored question cards
- Question repository
- Question metadata model
- Upload/import placeholder
- AI normalization placeholder
- Import candidate review model before repository approval
- Draft paper creation
- Document-style paper editor
- School template setup
- Template import placeholder
- Basic validation rules
- Answer key placeholder
- Export placeholder
- Export request/readiness model before real PDF/DOCX rendering

## MVP User Roles

- Teacher: creates and edits teacher-authored questions, assembles draft papers, reviews validation issues.
- Academic coordinator: manages taxonomy, templates, validation expectations, and repository quality.
- School admin: manages school/workspace settings and role assignments at a basic level.

Reviewer is a post-MVP workflow role, but the data model should leave room for it.

## MVP Screens

- Workspace dashboard shell
- Question repository table
- Question create/edit view
- Question inspector with metadata, source, rights, and validation state
- Upload/import placeholder view
- Draft paper list
- Document-style paper editor
- Template setup view
- Validation results panel
- Export readiness placeholder

## MVP Validation Examples

- Question has required subject, grade, and source metadata.
- Imported question has usage-rights metadata.
- Teacher-authored question source is marked as teacher-created or school-owned.
- Paper has title, subject, grade, and at least one section.
- Paper questions have marks where required.
- Template selection is compatible with paper type where known.
- Export is blocked when required validation fails.

## MVP Placeholder Rules

- Upload/import placeholder may record files and metadata, but does not promise OCR.
- AI normalization placeholder may show request/status shape, but does not promise a full AI pipeline.
- Answer key placeholder may represent readiness and association, but does not promise generation.
- Export placeholder may show readiness and requested format, but does not generate final PDF/DOCX.

## Explicitly Not Full MVP

- Full OCR
- Full AI pipeline
- Full PDF/DOCX rendering
- Approval workflow
- Analytics
- Billing
- Marketplace
- Multi-campus enterprise controls

## MVP Principle

MVP should establish the operating system shape: repository, metadata, draft paper editor, validation readiness, and future-ready abstractions.
