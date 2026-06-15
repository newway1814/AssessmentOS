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

## Interaction Quality

- Prefer clear density over decorative spacing.
- Use accessible forms and controls.
- Use tables for repository and workflow lists.
- Use inspector panels for secondary metadata and validation context.
- Keep document editing surfaces calm, readable, and printable in spirit.
- Make errors specific and actionable.

## Visual Tone

- Neutral, polished, and operational.
- Typography should be readable at dashboard density.
- Color should communicate state and hierarchy without dominating the interface.
- Motion should be minimal and purposeful.
