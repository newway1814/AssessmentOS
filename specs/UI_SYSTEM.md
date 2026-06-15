# UI System

## Design Direction

AssessmentOS should feel like serious B2B SaaS for schools and academic operations.

Reference quality:

- Linear
- Vercel
- Notion
- Airtable
- Stripe dashboard

Avoid:

- Childish edtech visuals
- Random gradients
- Gimmicky animation
- Messy generated UI
- Oversized marketing components inside the app

## Preferred UI Stack

- Next.js App Router
- Tailwind CSS
- shadcn/ui
- Radix primitives

## Application Shell

- Sidebar navigation
- Workspace switcher
- Top-level search or command entry
- Main content area
- Right-side inspector panels
- Status-aware empty, loading, and error states

The first application screen after sign-in should be the working product shell, not a marketing landing page. Navigation should prioritize repository, papers, templates, validation, uploads, and workspace settings.

## Core Surfaces

- Question repository data table
- Question card editor
- Metadata inspector
- Document-style paper editor
- Paper outline and section navigation
- Validation panel
- Template setup screen
- Upload/import placeholder screen
- Export readiness panel

## Layout Patterns

- Use a persistent sidebar for primary navigation.
- Use tables for repository, paper, template, upload, validation, and approval lists.
- Use right-side inspector panels for selected item details, metadata, validation issues, comments, and audit context.
- Use document-style editing surfaces for paper creation, with a paper outline nearby.
- Use split views when users need to compare repository items with selected details.
- Keep forms compact, labeled, keyboard-accessible, and validation-aware.

## Component Standards

- Prefer shadcn/ui components backed by Radix primitives.
- Use consistent button hierarchy: primary for one main action, secondary for common alternatives, destructive only for destructive actions.
- Use badges for status, source type, rights state, validation severity, and workflow state.
- Use tabs only when each tab has meaningful, persistent content.
- Use command/search patterns for repository and paper insertion workflows.
- Use toasts for short confirmations and inline alerts for blocking issues.

## Interaction Quality

- Prefer clear density over decorative spacing.
- Use accessible forms and controls.
- Use tables for repository and workflow lists.
- Use inspector panels for secondary metadata and validation context.
- Keep document editing surfaces calm, readable, and printable in spirit.
- Make errors specific and actionable.
- Preserve user context after create, edit, import, validation, and export-placeholder actions.
- Empty states should offer the next useful action without sounding promotional.
- Loading states should use skeletons or stable placeholders that avoid layout shift.
- Error states should explain what failed and how to recover.

## Visual Tone

- Neutral, polished, and operational.
- Typography should be readable at dashboard density.
- Color should communicate state and hierarchy without dominating the interface.
- Motion should be minimal and purposeful.

## Accessibility

- Keyboard navigation must work for repository tables, forms, dialogs, menus, and editor actions.
- Interactive controls must have accessible labels.
- Focus states must be visible.
- Color must not be the only indicator of status or validation severity.
- Forms must connect errors to fields where possible.

## Anti-Patterns

- Do not use decorative hero sections inside authenticated app flows.
- Do not hide core actions behind clever icons without labels or tooltips.
- Do not invent visual systems that fight shadcn/ui conventions.
- Do not present AI output as final or authoritative without review and validation states.
