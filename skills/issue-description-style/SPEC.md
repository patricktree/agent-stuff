# Issue Description Style Specification

## Intent

Produce concise, actionable GitHub issue descriptions that distinguish facts from assumptions, follow repository templates, and visibly disclose agent authorship.

## Scope

In scope:

- Bug reports, feature requests, and maintenance-task descriptions.
- Reproduction evidence, expected outcomes, and acceptance criteria.
- The runtime-specific agent-attribution footer.

Out of scope:

- Pull request descriptions.
- Issue comments and triage policy.
- Choosing labels, assignees, milestones, or severity without evidence.

## Users And Trigger Context

- Primary users: agents drafting or creating issues for Patrick Kerschbaum.
- Common user requests: open an issue, draft a bug report, propose a feature request, or document maintenance work.
- Should not trigger for: PR descriptions, commit messages, support emails, or general project plans.

## Runtime Contract

- Required first actions: inspect repository issue forms, templates, and contribution guidance.
- Required outputs: an issue body using the smallest structure suitable for its issue type.
- Non-negotiable constraints: do not hard-wrap prose; do not invent evidence; redact sensitive data; append the agent-attribution footer once as the final agent-authored visible content, using known runtime identity details without guessing, unless explicitly overridden for that issue.
- Expected bundled files loaded at runtime: `references/examples.md` only when selecting a structure or repairing a weak draft.

## Source And Evidence Model

Authoritative sources:

- Direct user preferences.
- Repository issue templates and contribution guidance.
- User-provided context and reproducible repository evidence.

Useful improvement sources:

- Accepted issue descriptions, maintainer feedback, and user corrections.

Data that must not be stored:

- Secrets or credentials.
- Personal data or unrelated private repository information.

## Reference Architecture

- `SKILL.md` contains runtime selection and writing rules.
- `references/examples.md` contains transformed examples.
- `SPEC.md` contains this maintenance contract.
- `SOURCES.md` records provenance and decisions.

## Validation

- Lightweight validation: run the skill validator and Markdown linting.
- Deeper validation: review bug, feature, maintenance, and vague-input examples.
- Acceptance gates: the local template is respected, prose paragraphs are not hard-wrapped, unsupported claims are absent, acceptance criteria are actionable, and the runtime-specific footer appears once.

## Known Limitations

- Issue forms may control structure and may append generated metadata after the authored content.

## Maintenance Notes

- Update `SKILL.md` when structure, evidence, or attribution preferences change.
- Update `references/examples.md` when a new issue class or recurring failure mode appears.
- Update `SOURCES.md` when new evidence changes a decision.
