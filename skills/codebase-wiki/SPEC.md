# codebase-wiki Specification

## Intent

Give a repository an LLM-maintained documentation wiki in `docs/`, and a defined way to move a finished wayfinder effort's planning material into it (landing). Wayfinder plans an effort and then is done; the wiki is the long-lived description of the system that every later session reads.

## Scope

In scope:

- Setting up the skeleton: the index, the system overview written from the code, the ADR and research indexes, and the schema in `docs/agents/domain.md`.
- Pointing agents at the wiki from `AGENTS.md` or `CLAUDE.md`, and pointing wayfinder at landing from `docs/agents/issue-tracker.md`.
- Landing one effort into an existing wiki.
- Offering a scheduled health review that reports its findings as an issue.

Out of scope:

- Choosing or setting up the issue tracker, triage labels or the glossary format, which `setup-matt-pocock-skills` and `domain-modeling` own.
- Docs search tooling. A repository adds it once the index stops being enough, as `cup` did with `tooling/docs-search`.
- Running health reviews and compaction, which the installed schema describes for any session.
- Committing, branching or pushing during setup.

## Runtime Contract

- Invocation: manual only (`disable-model-invocation: true`; `agents/openai.yaml` for Codex). Setup is a deliberate, once-per-repository act, and landing happens at a point the user chooses.
- Input: `setup` (default) or `land <effort>`.
- Output: for setup, uncommitted changes and a report; for landing, an open pull request whose body is the ledger of where each decision and research file went, with the incorporated `research/<name>` branches deleted locally and on the remote.
- The schema asset is the single source of the maintenance and landing rules. `SKILL.md` installs it and defers to it, so a repository's copy keeps working without this skill.

## Dependencies

- `setup-matt-pocock-skills` (third-party) writes the seed `docs/agents/domain.md` that the schema extends, and `docs/agents/issue-tracker.md` with its `## Wayfinding operations` section.
- `domain-modeling` (third-party) owns `GLOSSARY.md` and the ADR format and test; the schema refers to it by name.
- `wayfinder` (third-party) produces the efforts that landing retires.
- `commit` and `pr` for the landing commit and pull request body.
- `write-markdown` for validation in repositories without a docs check.

## Maintenance Notes

- When the third-party seed `domain.md` changes, compare it with `assets/docs/agents/domain.md` so the schema still covers the seed's consumer rules.
- When `cup`'s or another consumer's schema gains a general rule, fold it into the asset and record it in `SOURCES.md`.
