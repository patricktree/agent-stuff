# PR Description Style Specification

## Intent

Produce concise, reviewer-focused pull request descriptions that follow local templates and visibly disclose agent authorship.

## Scope

In scope:

- Drafting, editing, and submitting pull request descriptions.
- Problem, solution, details, and validation structure.
- The runtime-specific agent-attribution footer.

Out of scope:

- Commit messages.
- Pull request review comments.
- Repository-specific requirements that conflict with a local PR template.

## Users And Trigger Context

- Primary users: agents preparing pull request bodies for Patrick Kerschbaum.
- Common user requests: create a PR, draft a PR description, update a PR body, or summarize changes for reviewers.
- Should not trigger for: issue descriptions, commit messages, release notes, or general change explanations.

## Runtime Contract

- Required first actions: inspect and follow the repository PR template when one exists.
- Required outputs: a concise PR body grounded in the actual change and validation performed.
- Non-negotiable constraints: append the agent-attribution footer once as the final agent-authored visible content, using known runtime identity details without guessing, unless the user explicitly overrides it for that PR.
- Expected bundled files loaded at runtime: `SKILL.md` only.

## Source And Evidence Model

Authoritative sources:

- Direct user preferences.
- Repository PR templates and contribution guidance.

Useful improvement sources:

- Accepted PR descriptions and reviewer feedback.
- Corrections requested by the user.

Data that must not be stored:

- Secrets.
- Private repository details unrelated to the style contract.

## Reference Architecture

- `SKILL.md` contains all runtime guidance.
- `SPEC.md` contains this maintenance contract.
- `SOURCES.md` records provenance and decisions.

## Validation

- Lightweight validation: run the skill validator and Markdown linting.
- Deeper validation: verify representative substantive and mechanical PR drafts.
- Acceptance gates: local template is respected, claims match evidence, and the runtime-specific footer appears once.

## Known Limitations

- Repository automation may append generated content after the visible footer.

## Maintenance Notes

- Update `SKILL.md` when PR structure, tone, or attribution preferences change.
- Update `SOURCES.md` when new evidence changes a style decision.
