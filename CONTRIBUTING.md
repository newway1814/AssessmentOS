# Contributing

AssessmentOS is built through small, spec-driven pull requests.

## Development Principles

- Specs first: update `/specs` before changing behavior.
- MVP first: prefer the smallest complete slice.
- Reviewable PRs: keep changes scoped and easy to evaluate.
- Quality over velocity: avoid generated clutter and speculative abstractions.

## Product Guardrails

- AssessmentOS is an assessment operating system for schools, not a novelty AI exam generator.
- School/workspace isolation, auditability, source metadata, and content rights are core product requirements.
- Imported questions must preserve source and usage-rights metadata.
- Do not add workflows that imply random copyrighted scraping.

## Engineering Guardrails

- Use strict TypeScript once implementation begins.
- Use Zod at API, import, upload, AI, and integration boundaries.
- Keep AI services behind typed abstractions.
- Keep upload/storage, template extraction, export/rendering, and validation behind replaceable interfaces.
- Avoid hardcoded providers in UI components.

## UI Guardrails

- Use a professional dashboard product standard.
- Preferred stack: Next.js App Router, Tailwind CSS, shadcn/ui, and Radix primitives.
- Build accessible forms, clear tables, inspector panels, document editing surfaces, validation states, and polished empty/loading/error states.

## Pull Request Checklist

- Specs are updated or confirmed unchanged.
- Scope is limited to the PR purpose.
- No secrets are included.
- No unapproved dependencies are added.
- Lint, typecheck, and tests pass once tooling exists.
