# Node.js Best Practices Specification

## Intent

Maintain focused runtime and code-level Node.js guidance split from the removed broad Node.js project setup skill.

## Scope

In scope:

- Keep focused runtime guidance for Node.js ESM scripts, CLIs, entrypoints, async flow, or top-level await usage.
- Keep TypeScript setup recommendations out of this skill.

Out of scope:

- package.json, ESLint, Prettier, Vitest, pnpm, or tsconfig setup.
- Semantic cleanup of recommendations unless requested separately.

## Users And Trigger Context

- Primary users: coding agents configuring or reviewing JavaScript/TypeScript projects.
- Common user requests: add, edit, standardize, or review Node.js ESM scripts, CLIs, entrypoints, async flow, or top-level await usage.
- Should not trigger for: unrelated project setup areas covered by sibling skills.

## Runtime Contract

- Required first actions: read `SKILL.md` and apply only the relevant guidance.
- Required outputs: code or configuration changes that preserve the skill's recommendations.
- Non-negotiable constraints: keep TypeScript setup guidance in `typescript-project-setup`, not this skill.
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

- This skill intentionally excludes TypeScript setup even when Node.js entrypoints are written in TypeScript.

## Maintenance Notes

- When to update `SKILL.md`: recommendation changes or trigger precision fixes.
- When to update `SOURCES.md`: when adding provenance or changelog detail.
- When to update `references/evidence/`: when preserving trigger examples or regression cases.
