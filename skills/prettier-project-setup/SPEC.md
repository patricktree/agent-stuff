# Prettier Project Setup Specification

## Intent

Maintain focused Prettier setup conventions for Node.js/TypeScript projects split from the removed broad Node.js project setup skill.

## Scope

In scope:

- Preserve the exact recommendations moved from the original skill.
- Keep trigger wording precise for Prettier dependencies, prettier.config.cjs, .prettierignore, or format scripts.

Out of scope:

- ESLint, Vitest, pnpm, or tsconfig setup.
- Semantic cleanup of recommendations unless requested separately.

## Users And Trigger Context

- Primary users: coding agents configuring or reviewing JavaScript/TypeScript projects.
- Common user requests: add, edit, standardize, or review Prettier dependencies, prettier.config.cjs, .prettierignore, or format scripts.
- Should not trigger for: unrelated project setup areas covered by sibling skills.

## Runtime Contract

- Required first actions: read `SKILL.md` and apply only the relevant guidance.
- Required outputs: code or configuration changes that preserve the skill's recommendations.
- Non-negotiable constraints: do not silently modernize or clean up preserved recommendations.
- Expected bundled files loaded at runtime: none.

## Source And Evidence Model

Authoritative sources:

- The removed broad Node.js project setup skill content as of the split.

Useful improvement sources:

- positive examples: successful project setup runs using these recommendations.
- negative examples: false-positive skill triggers or over-broad context loading.
- commit logs/changelogs: future updates to the split skills.
- issue or PR feedback: reports that recommendations are stale or unclear.
- validation results: markdownlint and skill structural validation.

Data that must not be stored:

- secrets
- customer data
- private URLs or identifiers not needed for reproduction

## Reference Architecture

- `SKILL.md` contains: all runtime guidance for this focused setup area.
- `references/` contains: none.
- `references/evidence/` contains: none.
- `scripts/` contains: none.
- `assets/` contains: none.

## Validation

- Lightweight validation: run skill structural validation on the skill directory.
- Deeper validation: run markdownlint on changed Markdown files.
- Holdout examples: requests for sibling tooling should not load this skill.
- Acceptance gates: no runtime or prompt references to the removed broad skill remain.

## Known Limitations

- The split intentionally preserves existing recommendations, including any stale versions or duplicated ESLint rules.

## Maintenance Notes

- When to update `SKILL.md`: recommendation changes or trigger precision fixes.
- When to update `SOURCES.md`: when adding provenance or changelog detail.
- When to update `references/evidence/`: when preserving trigger examples or regression cases.
