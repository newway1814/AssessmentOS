---
name: code-review-and-quality
description: Review AssessmentOS changes for correctness, maintainability, scope control, TypeScript quality, UI quality, and missing verification.
---

# Code Review And Quality

Use this skill for review requests or before merging substantial changes.

## Review Priorities

1. Behavioral bugs and regressions.
2. Data isolation, school/workspace scoping, content-rights metadata, and auditability risks.
3. TypeScript boundary issues, unnecessary `any`, weak unions, or missing Zod validation.
4. UI workflow gaps, broken empty/loading/error states, and accessibility issues.
5. Missing tests or insufficient verification.

## Output Shape

- Findings first, severity ordered.
- Include file and line references when possible.
- Keep summaries brief.
- If there are no issues, say that clearly and note residual test gaps.

## Standards

- Keep comments actionable.
- Do not request broad refactors unless they reduce real risk.
- Prefer small follow-up issues over expanding the current change.
