---
name: source-driven-development
description: Use primary sources and local code evidence when AssessmentOS depends on framework, library, API, or repo-specific behavior.
---

# Source Driven Development

Use this skill when correctness depends on current docs or existing code patterns.

## Sources

- Existing repo files and tests.
- Official documentation for frameworks and libraries.
- Project specs in `/specs`.
- Package scripts and config files.

## Workflow

1. Inspect local patterns before adding new ones.
2. Use official docs for unstable or version-sensitive APIs.
3. Prefer typed APIs over ad hoc string logic.
4. Record references in docs when a spec depends on external guidance.

## Rules

- Do not copy public repo code wholesale.
- Do not vendor third-party repos.
- Respect licenses and document references when used.
