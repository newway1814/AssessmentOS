# UX Flows

## Navigation Model

The app should use a professional dashboard layout with sidebar navigation, workspace switcher, primary content region, and contextual right-side inspector panels.

## MVP Flows

### School Workspace Setup

1. Admin or coordinator enters a school workspace.
2. They configure subjects, grades, and basic taxonomy.
3. They define initial template records or create import placeholders.

### Create Teacher-Authored Question

1. Teacher opens the question repository.
2. Teacher creates a question card.
3. Teacher adds prompt, answer placeholder, marks, difficulty, subject, grade, chapter, subtopic, and rights/source metadata.
4. System validates required metadata.

### Browse Question Repository

1. Teacher or coordinator views questions in a data table.
2. User filters by subject, grade, chapter, type, status, source, rights, or validation state.
3. User opens a question inspector for details, versions, validation, and comments.

### Upload/Import Placeholder

1. User creates an upload record.
2. User supplies source and usage-rights metadata.
3. System stores the upload for future extraction or normalization work.

### AI Normalization Placeholder

1. User requests normalization for imported or draft content.
2. System marks output as draft and requires validation.
3. User reviews structured content before it enters the repository.

### Draft Paper Creation

1. Teacher creates a draft paper.
2. Teacher selects subject, grade, template, and paper structure.
3. Teacher adds questions from the repository.
4. Teacher edits sections in a document-style editor.
5. System shows validation issues in a panel.

### School Template Setup

1. Coordinator creates a template record.
2. Coordinator defines basic metadata and intended use.
3. Template import remains a placeholder for future extraction.

### Export Placeholder

1. User opens export action.
2. System runs validation.
3. User sees readiness status for future PDF/DOCX export.

## Post-MVP Flows

- Approval request and review
- Full OCR import
- Full AI pipeline
- PDF/DOCX rendering
- Analytics and reporting
- Billing and enterprise controls
