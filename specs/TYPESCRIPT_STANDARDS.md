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
- Avoid non-null assertions unless the invariant is proven nearby.
- Avoid type assertions as a shortcut around unclear data.
- Prefer named domain types for shared concepts instead of repeating object literals across modules.

## Domain Types

Domain types should reflect product language:

- School
- Campus
- Workspace
- User
- Role
- Subject
- Grade
- Chapter
- Subtopic
- Question
- QuestionVersion
- QuestionSource
- Upload
- MediaAsset
- Paper
- PaperSection
- PaperQuestion
- Template
- TemplateVersion
- Rubric
- AnswerKey
- ValidationResult
- ApprovalRequest
- Comment
- AuditLog

## Boundary Validation

Use Zod for:

- API request payloads
- Import/upload metadata
- AI service responses
- Export requests
- Webhook or integration payloads
- Environment variables

Boundary parsing should return typed application data or structured errors. Do not pass unparsed external data into domain services.

## State Modeling

Prefer discriminated unions for workflows:

```ts
type ValidationStatus =
  | { state: "not_run" }
  | { state: "running"; startedAt: string }
  | { state: "passed"; completedAt: string }
  | { state: "failed"; completedAt: string; issueCount: number };
```

Use exhaustive checks for important unions:

```ts
function assertNever(value: never): never {
  throw new Error(`Unhandled state: ${JSON.stringify(value)}`);
}
```

## Service Boundary Example

```ts
interface AiNormalizationService {
  normalizeQuestion(
    input: NormalizeQuestionInput,
  ): Promise<NormalizeQuestionResult>;
}
```

UI components should call application services or actions, not provider SDKs directly.

## Data Access

- Database queries should preserve school/workspace scoping.
- Repository functions should return domain-specific results, not raw provider responses when that leaks infrastructure details.
- Audit-log writes should be explicit for important mutations.

## Testing Expectations

Once tooling exists, add focused tests for:

- Zod boundary schemas
- Validation rule behavior
- Permission and workspace isolation checks
- Important workflow state transitions
