# agent-browser-cdp Skill Spec

## Purpose

Guide agents to automate Chrome via `agent-browser` over Chrome DevTools Protocol without installing or launching agent-browser's bundled Chrome.

## Trigger Scope

Use for browser automation, screenshots, page inspection, JavaScript evaluation, mobile viewport checks, and user profile attachment when the desired backend is an existing/system Chrome CDP endpoint.

## Non-Goals

- Do not run `agent-browser install`.
- Do not replace Playwright test authoring guidance.
- Do not close user-owned browsers unless explicitly requested.

## Maintenance Notes

Keep command examples aligned with `agent-browser --help` and the upstream README. Preserve the CDP-first behavior, the requirement to load the `agent-browser` skill by name, and the 5-second bounded-action guidance. Do not encode machine-specific skill paths.
