---
name: context-engineering
description: Gather and preserve the right AssessmentOS context before acting on broad, cross-cutting, or multi-turn work.
---

# Context Engineering

Use this skill when the task touches multiple areas, continues prior work, or depends on product decisions.

## Gather

- `AGENTS.md`
- Relevant files in `/specs`
- Existing routes/components/services in the affected area
- Recent git status and branch state
- Existing tests and package scripts

## Preserve

- Record important assumptions in specs or concise code comments when they affect future behavior.
- Keep generated artifacts and temporary files out of commits.
- Do not overwrite user changes.

## Handoff

Report:

- What context was used.
- What changed.
- Commands run.
- Remaining assumptions or manual setup.
