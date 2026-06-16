---
name: git-workflow-and-versioning
description: Manage AssessmentOS git changes safely with small commits, clean status checks, and no pull requests unless requested.
---

# Git Workflow And Versioning

Use this skill for branching, staging, committing, pushing, or resolving workflow issues.

## Rules

- Work in small, logical commits.
- Use branches only when useful.
- Do not create pull requests unless explicitly requested.
- Never revert user changes unless explicitly asked.
- Do not use destructive commands like `git reset --hard` or `git checkout --` without explicit approval.

## Before Commit

1. Check `git status`.
2. Ensure no secrets are staged.
3. Stage only relevant files.
4. Review staged diff summary.
5. Commit with a concise imperative message.

## Report

- Changed files.
- Commit hash.
- Commands run.
- Whether changes were pushed.
