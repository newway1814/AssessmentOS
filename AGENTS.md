# Agent Instructions

AssessmentOS is a spec-driven B2B SaaS project for school assessment operations. Keep future work grounded in `/specs`.

## Core Rules

- Define or update expected behavior in `/specs` before implementation changes.
- Work in small, logical commits.
- Use branches only when useful.
- Do not create pull requests unless explicitly requested.
- Do not add random dependencies or broad refactors.
- Preserve user work and keep changes scoped to the request.

## Local Skills

- Reusable workflow guidance lives in `.agents/skills/<skill-name>/SKILL.md`.
- Load the matching skill for debugging, testing, browser checks, planning, spec work, source-driven work, code review, simplification, shipping, and git workflow tasks.

## Engineering Standards

- Use strict TypeScript, clear domain types, Zod at boundaries, and discriminated unions for important workflow states.
- Keep AI, storage, template extraction, export/rendering, validation, and audit logging behind typed service interfaces.
- Do not hardcode AI provider logic in UI components.

## UI Standards

- Use a serious B2B SaaS style: Next.js App Router, Tailwind CSS, shadcn/ui, Radix primitives, dashboard layout, data tables, inspector panels, document editor surfaces, and polished loading/empty/error states.
- Avoid childish edtech visuals, random gradients, gimmicky animation, messy generated UI, and oversized marketing components inside the app.

## Content Rights

- Do not design or implement random copyrighted web scraping.
- Imported content must be school-owned, teacher-created, licensed, open, public-domain, or verified partner content.
- Preserve source and usage-rights metadata for every imported question.

## Before Finishing

- Check `git status` and ensure no secrets are committed.
- Always run lint, typecheck, and tests when tooling exists.
- Commit cleanly.
- Always report changed files, commit hash, and commands run.
