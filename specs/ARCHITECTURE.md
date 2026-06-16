# Architecture

## Overview

AssessmentOS should be built as modular B2B SaaS with explicit boundaries around school data, assessment content, AI operations, and document workflows.

## Preferred Stack

- Frontend: Next.js App Router
- UI: Tailwind CSS, shadcn/ui, Radix primitives
- API/backend: typed API layer
- Database: SQLite with Drizzle ORM for MVP persistence
- Validation: Zod at boundaries and a domain validation engine
- Auth: provider-agnostic authentication with role-based access control

## Required Layers

### Frontend App

Dashboard application for question repository management, paper creation, document-style editing, template setup, validation review, and export entry points.

The frontend should own interaction state and presentation. It should not own provider-specific AI, storage, extraction, rendering, authorization, or validation logic.

### Backend/API Layer

Typed endpoints or server actions that enforce authorization, workspace isolation, validation, and service orchestration.

The backend/API layer is the policy boundary. It must verify the active school/workspace context, user role, input shape, and mutation permissions before calling services.

### Database Layer

Persistent school, workspace, user, content, paper, template, validation, approval, comment, and audit-log records.

The data layer must make tenant scoping difficult to forget. Prefer query helpers or repository methods that require school/workspace context for customer-owned records.

SQLite and Drizzle ORM are the default MVP database stack. Schema details, migration policy, import candidate handling, export request persistence, and seed expectations are defined in [`DATABASE_SETUP.md`](./DATABASE_SETUP.md).

### AI Service Abstraction

Provider-agnostic interface for future normalization, extraction, classification, and suggestion workflows. UI components must never hardcode provider-specific logic.

AI responses must be treated as draft, parsed through schemas, linked to source records when applicable, and validated before repository use.

Imported AI-normalized results must be stored as import candidates until a teacher or coordinator approves them into the repository. AI output must not directly create canonical questions.

### Upload/Storage Abstraction

Provider-agnostic interface for uploads and media assets. Storage metadata must be separate from domain content records.

Upload records must preserve filename, content type, size, uploader, source context, rights metadata, and processing state.

### Template Extraction Abstraction

Interface for future extraction of layout, header/footer, section, marking, and style rules from school templates.

Template extraction should produce editable structured draft templates, not silently overwrite school-approved templates.

### Export/Rendering Abstraction

Interface for future PDF/DOCX rendering. MVP may expose placeholders without full rendering.

Export requests must run validation first and should record requested format, template version, requester, and readiness state.

### Validation Engine

Rule-based service for checking question completeness, metadata quality, paper structure, answer-key readiness, template compatibility, and content-rights metadata.

Validation results should be structured by severity, code, target entity, target field, message, and suggested fix.

### Role-Based Access

Permissions must account for school, campus, workspace, role, and ownership boundaries.

Authorization should be centralized in backend services or policy helpers so UI visibility is never the only protection.

### Audit Logs

Important actions must be auditable, including imports, edits, validation changes, approvals, comments, exports, role changes, and template changes.

Audit logs should capture actor, action, target, timestamp, school/workspace context, and relevant metadata.

### School/Workspace Isolation

Every domain record must be scoped so one school or workspace cannot access another school or workspace's data.

Cross-school access is out of scope for MVP. Future enterprise sharing must be explicit, permissioned, and auditable.

## Suggested Module Boundaries

- `app`: routes, layouts, server actions, and UI composition.
- `components`: reusable UI components and product-specific view components.
- `domains`: domain types, schemas, validation rules, and service interfaces.
- `services`: implementations for AI, storage, extraction, rendering, audit logging, and notifications.
- `data`: database client, repositories, and tenant-scoped query helpers.
- `lib`: shared utilities with no product state.

## Design Constraints

- Keep business logic out of UI components.
- Preserve source and usage-rights metadata across import and normalization.
- Treat AI output as draft content requiring validation and review.
- Avoid provider lock-in at AI, storage, extraction, and rendering boundaries.
- Keep MVP placeholders honest: show readiness and future workflow shape without pretending full OCR, AI, or export rendering exists.
