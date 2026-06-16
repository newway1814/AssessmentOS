---
name: grill-with-docs
description: Stress-test AssessmentOS product or architecture decisions against specs, docs, and acceptance criteria before implementation.
---

# Grill With Docs

Use this skill when a requested behavior needs pressure-testing against existing docs.

## Workflow

1. Read the relevant files in `/specs` and `/docs`.
2. Compare the request to MVP scope, non-goals, architecture, data model, UI system, and TypeScript standards.
3. Identify conflicts, missing definitions, or decisions that need a spec update.
4. Resolve through documentation before implementation when behavior changes.

## Good Questions

- Is this MVP or future scope?
- Does it preserve content-rights metadata?
- Is it an AI/storage/export/auth feature that should remain abstracted?
- Does it match serious B2B SaaS UI expectations?

## Output

Give a concise recommendation, required doc updates, and implementation boundaries.
