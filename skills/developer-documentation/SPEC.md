# Developer Documentation Specification

## Intent

Help an agent write, edit, and review technically accurate developer documentation that is clear, task-focused, scannable, accessible, inclusive, global-ready, and maintainable.

## Scope

In scope:

- READMEs, guides, tutorials, conceptual documents, procedures, troubleshooting content, CLI documentation, API references, and public code comments.
- Editorial structure, voice, terminology, semantic formatting, links, UI instructions, examples, accessibility, and validation.

Out of scope:

- Inventing product behavior or future plans.
- Replacing repository-specific documentation rules.
- General nontechnical writing and ordinary implementation comments.
- Legal advice or trademark clearance.

## Users and trigger context

- Primary users: agents creating or improving documentation for software developers and technical practitioners.
- Common requests: write a README section, document a feature or command, create a tutorial, improve API docs, explain a system, or review technical documentation.
- Should not trigger for: writing application code without documentation work, drafting marketing copy, writing personal correspondence, or adding a small implementation comment.

## Runtime contract

- Required first actions: inspect local conventions and verify facts from authoritative implementation sources.
- Required outputs: documentation or review feedback appropriate to the requested format and existing repository.
- Non-negotiable constraints: don't invent facts, expose sensitive data, hide material side effects, or privilege this skill over project-specific rules.
- Expected bundled files loaded at runtime: `SKILL.md` and only the focused references routed by the request.

## Source and evidence model

Authoritative sources:

- Repository-specific documentation guidance, source code, tests, schemas, generated interfaces, and supported-version data.
- Google developer documentation style guide, adapted under CC BY 4.0 and inventoried in `SOURCES.md`.

Useful improvement sources:

- Positive and negative documentation examples.
- Documentation lint, link, snippet, accessibility, and build results.
- Review feedback and recurring reader confusion.

Data that must not be stored:

- Secrets, credentials, personal information, customer data, or private identifiers not required for a sanitized reproduction.

## Reference architecture

- `SKILL.md` contains activation, authority order, the core workflow, routing, and final validation.
- `references/` contains focused runtime guidance and transformed examples.
- `SOURCES.md` contains provenance, source-adaptation decisions, coverage, and gaps.
- No scripts or assets are required.

## Validation

- Lightweight validation: skill structure, direct reference routing, terminology consistency, and review of trigger boundaries.
- Deeper validation: apply the skill to task, reference, security-sensitive, and anti-pattern examples; verify technical facts and run repository documentation checks.
- Holdout examples: troubleshooting content, conceptual architecture documentation, and UI-only procedures.
- Acceptance gates: project authority is preserved, references are loadable, examples cover happy/robust/incorrect transformations, and no high-impact Google guide category is unrepresented.

## Known limitations

- The Google guide changes over time; exact word-list and product-specific decisions can become stale.
- Some Google-specific HTML and house-style details were generalized or omitted when they did not improve portable runtime behavior.
- The skill cannot guarantee technical accuracy without access to the implementation or another authoritative source.

## Maintenance notes

- Update `SKILL.md` when the workflow, trigger boundary, authority order, or reference routing changes.
- Update `SOURCES.md` when upstream guide coverage or adaptation decisions change.
- Update focused references when upstream guidance changes an agent decision or a demonstrated documentation failure requires a correction.
