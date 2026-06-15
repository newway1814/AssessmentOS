# TypeScript Standards

AssessmentOS should follow strict, readable TypeScript discipline in the spirit of Matt Pocock-style practical type safety.

## Rules

- Enable strict TypeScript.
- Avoid unnecessary `any`.
- Use `unknown` for untrusted input until parsed.
- Use Zod at external boundaries.
- Prefer readable domain types over clever type gymnastics.
- Use discriminated unions for important workflow states.
- Use exhaustive checks for important states.
- Keep service interfaces typed.
- Keep API request and response shapes explicit.
- Do not hardcode AI provider logic in UI components.

## Domain Types

Domain types should reflect product language:

- School
- Workspace
- Question
- QuestionVersion
- QuestionSource
- Paper
- Template
- ValidationResult
- ApprovalRequest
- AuditLog

## Boundary Validation

Use Zod for:

- API request payloads
- Import/upload metadata
- AI service responses
- Export requests
- Webhook or integration payloads
- Environment variables

## State Modeling

Prefer discriminated unions for workflows:

```ts
type ValidationStatus =
  | { state: "not_run" }
  | { state: "running"; startedAt: string }
  | { state: "passed"; completedAt: string }
  | { state: "failed"; completedAt: string; issueCount: number };
```

## Service Boundary Example

```ts
interface AiNormalizationService {
  normalizeQuestion(input: NormalizeQuestionInput): Promise<NormalizeQuestionResult>;
}
```

UI components should call application services or actions, not provider SDKs directly.
