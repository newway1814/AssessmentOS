# Acceptance Criteria

## Foundation PR

- Repository contains the requested documentation and spec files.
- No application implementation is added.
- Specs define AssessmentOS as an assessment operating system for schools, not only an AI exam generator.
- Specs include architecture for frontend, backend/API, database, AI abstraction, upload/storage abstraction, template extraction abstraction, export/rendering abstraction, validation engine, role-based access, audit logs, and school/workspace isolation.
- Specs include the required core entities.
- Specs include the content rights rule.
- Specs identify MVP and future scope.
- UI standard is documented as professional B2B SaaS using Next.js, Tailwind, shadcn/ui, and Radix.
- TypeScript standard is documented as strict, readable, Zod-boundary-oriented, and provider-agnostic.
- `AGENTS.md` includes concise future-agent instructions.

## Before Merge

- Git status is clean after commit.
- No secrets are committed.
- PR is opened to `main` from `specs/project-foundation`.
- PR title is `PR 1: Add specs, agent instructions, and UI/TypeScript standards`.
