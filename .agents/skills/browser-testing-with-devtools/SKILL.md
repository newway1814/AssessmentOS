---
name: browser-testing-with-devtools
description: Verify AssessmentOS browser flows with real runtime evidence when UI behavior, routing, console errors, network calls, or responsive layout matter.
---

# Browser Testing With Devtools

Use this skill when a change affects visible UI, navigation, client state, forms, or browser-only APIs.

## Workflow

1. Start the app locally with `npm run dev` or the equivalent `next dev` command.
2. Open the smallest relevant route, such as `/dashboard/questions`, `/dashboard/papers`, `/dashboard/templates`, `/dashboard/exports`, or `/dashboard/imports`.
3. Verify the user-visible path, not just the compiled code.
4. Check for console errors, failed requests, broken navigation, overlapping text, and empty states.
5. Test at least one desktop width and one narrow/mobile width when layout changed.

## Evidence To Report

- Route or URL tested.
- Main action performed.
- Visible success signal.
- Any console/network/runtime issue found.

## Rules

- Do not treat a successful build as proof of UI behavior.
- Keep browser checks focused; avoid broad exploratory clicking unless the task calls for it.
- If in-app browser tooling is unavailable, use local HTTP smoke checks and say so.
