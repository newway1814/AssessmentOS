# PR Plan

## PR 1

Title: `PR 1: Add specs, agent instructions, and UI/TypeScript standards`

Branch: `specs/project-foundation`

Scope:

- Repository foundation files
- GitHub issue and PR templates
- Documentation folder
- Product and engineering specs
- Agent instructions

Out of scope:

- App implementation
- Dependency installation
- Next.js setup
- UI components
- Database schema
- API routes

## PR 2

Do not start until explicitly requested.

Expected theme: app skeleton and tooling based on the accepted specs.

Likely scope:

- Next.js App Router scaffold
- Strict TypeScript configuration
- Tailwind CSS setup
- shadcn/ui and Radix baseline
- Lint/typecheck scripts
- Empty route structure matching MVP surfaces

Out of scope:

- Database schema
- Auth implementation
- AI provider integration
- Storage provider integration
- Real import, OCR, export, or approval workflow

## PR 3

Expected theme: domain model and validation foundations.

Likely scope:

- Core TypeScript domain types
- Zod schemas for boundaries
- Workflow state unions
- Mock data fixtures
- Basic validation rule interfaces

## PR 4

Expected theme: question repository MVP slice.

Likely scope:

- Repository table using mock data
- Question create/edit UI
- Metadata and source/rights inspector
- Validation issue display

## PR 5

Expected theme: draft paper MVP slice.

Likely scope:

- Draft paper list
- Document-style paper editor shell
- Add/reorder questions from repository
- Export readiness placeholder

## PR Hygiene

- Check git status.
- Ensure no secrets.
- Confirm docs/spec changes match behavior changes.
- Commit cleanly.
- Push branch.
- Open PR to `main`.
