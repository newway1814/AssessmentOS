---
name: doubt-driven-development
description: Use deliberate skepticism for AssessmentOS work where assumptions could create security, data, rights, or product-risk issues.
---

# Doubt Driven Development

Use this skill when the task involves ambiguous behavior, data rights, school/workspace isolation, auth, AI, uploads, exports, or destructive actions.

## Questions To Test

- What assumption would make this wrong?
- Is school/workspace scoping preserved?
- Could copyrighted or unlicensed content enter the system?
- Is a placeholder clearly labeled as a placeholder?
- Is UI calling infrastructure directly?
- Are AI, storage, export, and validation hidden behind typed interfaces?

## Actions

- Add a spec note when behavior is ambiguous.
- Prefer typed boundaries and Zod validation for inputs.
- Keep risky behavior mocked until the spec explicitly authorizes implementation.
- Ask the user only when the decision cannot be safely inferred.
