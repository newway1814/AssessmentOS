# API Spec

## Principles

- APIs must be typed and authorization-aware.
- Zod schemas should validate external input and service boundaries.
- All routes must enforce school/workspace isolation.
- AI, storage, extraction, export, and validation capabilities must be accessed through service abstractions.

## MVP API Areas

### Workspace

- List accessible workspaces.
- Read current workspace settings.
- Switch active workspace context.

### Questions

- Create teacher-authored question card.
- List repository questions with filters.
- Read question details and versions.
- Update question metadata and draft content.
- Preserve source and usage-rights metadata.

### Uploads

- Create upload placeholder record.
- Attach upload metadata to a future import flow.
- Store source and rights fields required for imported questions.

### AI Normalization

- Create normalization placeholder request.
- Return draft normalized content only after validation and source metadata checks.

### Papers

- Create draft paper.
- Add, remove, and reorder paper questions.
- Edit paper sections and document-style metadata.

### Templates

- Create school template record.
- Create template import placeholder.
- Select template for a draft paper.

### Validation

- Run basic validation rules for questions and papers.
- Return structured issues with severity, code, message, and target.

### Answer Keys

- Create answer-key placeholder records.
- Associate answer-key status with question or paper readiness.

### Export

- Create export placeholder request.
- Validate paper readiness before allowing future PDF/DOCX rendering.

## Error Shape

Errors should be structured:

```ts
type ApiError = {
  code: string;
  message: string;
  field?: string;
  requestId: string;
};
```

## Important States

Use discriminated unions for important asynchronous or workflow states such as upload, normalization, validation, export, and approval.
