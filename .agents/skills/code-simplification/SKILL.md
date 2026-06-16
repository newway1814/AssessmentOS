---
name: code-simplification
description: Simplify AssessmentOS code without changing behavior, especially after feature slices accumulate duplication or unclear boundaries.
---

# Code Simplification

Use this skill for refactors that preserve behavior.

## Workflow

1. Identify the behavior that must remain unchanged.
2. Find duplication, unclear naming, oversized components, or leaky boundaries.
3. Make the smallest simplification that improves the next task.
4. Keep domain logic outside React components when practical.
5. Rerun focused checks.

## Good Targets

- Shared status badge helpers.
- Repeated metadata field renderers.
- Repository/service helper extraction.
- Pure validation or formatting helpers with tests.

## Avoid

- Reorganizing the app for taste alone.
- Mixing simplification with new product behavior.
- Introducing clever generic types where clear domain types are easier.
