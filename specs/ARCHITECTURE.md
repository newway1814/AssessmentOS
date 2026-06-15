# Architecture

## Overview

AssessmentOS should be built as modular B2B SaaS with explicit boundaries around school data, assessment content, AI operations, and document workflows.

## Preferred Stack

- Frontend: Next.js App Router
- UI: Tailwind CSS, shadcn/ui, Radix primitives
- API/backend: typed API layer
- Database: relational database with Prisma or equivalent typed ORM
- Validation: Zod at boundaries and a domain validation engine
- Auth: provider-agnostic authentication with role-based access control

## Required Layers

### Frontend App

Dashboard application for question repository management, paper creation, document-style editing, template setup, validation review, and export entry points.

### Backend/API Layer

Typed endpoints or server actions that enforce authorization, workspace isolation, validation, and service orchestration.

### Database Layer

Persistent school, workspace, user, content, paper, template, validation, approval, comment, and audit-log records.

### AI Service Abstraction

Provider-agnostic interface for future normalization, extraction, classification, and suggestion workflows. UI components must never hardcode provider-specific logic.

### Upload/Storage Abstraction

Provider-agnostic interface for uploads and media assets. Storage metadata must be separate from domain content records.

### Template Extraction Abstraction

Interface for future extraction of layout, header/footer, section, marking, and style rules from school templates.

### Export/Rendering Abstraction

Interface for future PDF/DOCX rendering. MVP may expose placeholders without full rendering.

### Validation Engine

Rule-based service for checking question completeness, metadata quality, paper structure, answer-key readiness, template compatibility, and content-rights metadata.

### Role-Based Access

Permissions must account for school, campus, workspace, role, and ownership boundaries.

### Audit Logs

Important actions must be auditable, including imports, edits, validation changes, approvals, comments, exports, role changes, and template changes.

### School/Workspace Isolation

Every domain record must be scoped so one school or workspace cannot access another school or workspace's data.

## Design Constraints

- Keep business logic out of UI components.
- Preserve source and usage-rights metadata across import and normalization.
- Treat AI output as draft content requiring validation and review.
- Avoid provider lock-in at AI, storage, extraction, and rendering boundaries.
