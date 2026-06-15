# Agent Instructions

AssessmentOS uses spec-driven development.

## Working Rules

- Define or update expected behavior in `/specs` before implementation changes.
- Keep PRs small, focused, and reviewable.
- Do not start follow-up PRs unless explicitly asked.
- Do not add random dependencies. Prefer established project choices once tooling exists.
- Preserve user work and avoid broad refactors unrelated to the task.

## TypeScript

- Use strict TypeScript.
- Avoid unnecessary `any`.
- Use Zod at external boundaries.
- Prefer clear domain types over clever generic types.
- Use discriminated unions and exhaustive checks for important state machines.
- Keep service interfaces typed.
- Do not hardcode AI provider logic in UI components.

## UI

- Follow a professional B2B SaaS standard inspired by Linear, Vercel, Notion, Airtable, and Stripe dashboard quality.
- Preferred stack: Next.js App Router, Tailwind CSS, shadcn/ui, and Radix primitives.
- Use dashboard layouts, sidebar navigation, data tables, right-side inspector panels, document-style editors, validation panels, and polished empty/loading/error states.
- Avoid childish edtech visuals, random gradients, gimmicky animation, messy generated UI, and oversized marketing components inside the app.

## Content Rights

- Do not design or implement random copyrighted web scraping.
- Imported content must be school-owned, teacher-created, licensed, open, public-domain, or verified partner content.
- Every imported question must preserve source and usage-rights metadata.

## Before PR

- Check `git status`.
- Ensure no secrets are committed.
- Run lint, typecheck, and tests once tooling exists.
- Commit cleanly, push the branch, and open a PR to `main`.
