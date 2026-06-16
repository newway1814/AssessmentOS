---
name: test-driven-development
description: Add or update AssessmentOS tests around domain logic, validation helpers, services, and user workflow behavior before or alongside implementation.
---

# Test Driven Development

Use this skill when adding logic, fixing bugs, or proving workflow behavior.

## Workflow

1. Identify the behavior to prove.
2. Add the smallest failing or expectation-focused test.
3. Implement the behavior.
4. Run the focused test.
5. Run the broader verification command.

## Good Test Targets

- Validation helpers.
- Marks totals and section calculations.
- Import/export readiness logic.
- Repository filters and mock adapters.
- Zod boundary schemas.

## Rules

- Test behavior, not implementation trivia.
- Keep tests deterministic.
- Avoid broad snapshot tests for dashboard UI.
- If a task is documentation-only, tests may be unnecessary; say so.
