---
name: pr-description-style
description: Captures preferred pull request description structure and writing style. Use when creating, editing, or proposing PR descriptions, GitHub PR bodies, merge request descriptions, or review summaries for code changes.
---

# PR Description Style

Apply this style when drafting, editing, or updating pull request descriptions.

## First rule

1. Mirror any repository-specific PR template first.
2. Use this skill to fill gaps and improve clarity when no stronger local convention exists.
3. Write for reviewers: explain why the change matters, what changed, and how it was validated.
4. Prefer concise, high-signal descriptions over exhaustive implementation logs.

## Default structure

Prefer this structure for substantive changes:

```md
## Problem

Explain the current behavior or gap, and why it matters.

Use bullets for separate impacts such as cost, GDPR/privacy, reliability,
security, UX, maintainability, or operational risk.

## Solution

Explain the intended behavior after the change.

Keep this outcome-focused. Mention important policy choices, thresholds,
retention windows, or tradeoffs.

## Changes

- List concrete code/config/docs changes.
- Keep bullets specific and reviewable.
- Separate behavior changes from cleanup/documentation changes when useful.

## Validation

- `command that was run`
- `another command that was run`
```

For tiny mechanical PRs, `## Summary` is acceptable instead of `## Problem` and
`## Solution` when there is no meaningful problem framing.

## Problem section

- Start from the existing behavior or system state.
- Explain why the current behavior is insufficient.
- Name concrete risks such as cost, GDPR/privacy, reliability, security, UX, maintainability, or operational impact.
- Avoid implementation details unless they are necessary to understand the problem.

## Solution section

- Describe the target behavior after the change.
- Explain important policy choices, thresholds, retention windows, or tradeoffs.
- Keep it readable for non-authors and future operators.
- Avoid over-explaining obvious implementation mechanics.

## Changes section

- Use bullets.
- Mention primary files, modules, resources, or workflows changed when useful.
- Separate behavior changes from validation fixes, cleanup, or documentation changes.
- Keep bullets parallel, concrete, and reviewable.

## Validation section

- List commands actually run.
- Use backticks for commands.
- Include important manual checks when relevant.
- Do not claim validation that was not performed.
- State blockers explicitly when validation could not be run.

## Tone

- Be clear, direct, specific, and concise.
- Prefer “Add lifecycle rules…” over “This PR adds…”.
- Use precise nouns from the codebase or domain.
- Avoid marketing language.
- Avoid vague bullets such as “misc cleanup”, “fix stuff”, or “various improvements”.
