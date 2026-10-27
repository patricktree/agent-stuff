# Sources

Retrieved: 2026-10-26

| Source | Trust tier | Contribution | Usage constraints |
| --- | --- | --- | --- |
| [ry's LLM wiki gist at `66be421`](https://gist.github.com/ry/c56dfa7b1b90eeff2d8d0127e45ae3bb/66be421686c257f25d3bb7f806867c07b4769dea) | canonical | The pattern: LLM-owned pages over immutable sources, a schema file, ingest, query, lint and compact operations, `README.md` indexes, standard relative links, git history instead of a log file | Written for personal knowledge bases; in a repository the code is the source, and it changes under the wiki with every commit. |
| `~/workspace/cup` `docs/` at `b57da60c` | high, maintained | The schema (`docs/agents/domain.md`), index layout, research incorporation notes with permalinks to the scratch originals, ADR supersession, link-don't-copy rule | Local provenance only. Product-specific rules (Cloudflare guidance, `docs:search` collections) stay out. |
| `cup` commits `39ec423` and `d48de8d9` | high, observed | The landing sequence done by hand once: the social-signup wayfinder scratch was deleted, then its research was recovered into `docs/research/social-signup/` with incorporation notes | None. |
| `~/workspace/20261019-resend-software-engineer-devtools-take-home-challenge` at `98d09db` | high, observed | Wayfinder without a wiki: the spec in `.scratch/` became the authoritative living document (touched by 23 of 49 commits), and `AGENTS.md` needed "where one disagrees with the spec, the spec wins" | Short-lived project; shows the failure mode, not a norm. |
| [`mattpocock/skills`](https://github.com/mattpocock/skills): `wayfinder`, `setup-matt-pocock-skills`, `domain-modeling` | canonical | Seed `domain.md` consumer rules, the ADR test and format, the wayfinder map shape and its local-markdown tracker operations | Third-party; may change between releases. |
| [Matt Pocock's wayfinder docs](https://github.com/mattpocock/skills/blob/main/docs/engineering/wayfinder.md) and [`chief-of-staff` wiki, PR #1304](https://github.com/mattpocock/skills/pull/1304) | canonical | Local-markdown maps are discouraged because material in the repository persists by accident; wiki claims are written as dated history tied to commits | Researched by a separate session on 2026-10-26 from his repositories and PRs; his code repositories have no current-state wiki. |

## Decisions

| Decision | Status | Rationale |
| --- | --- | --- |
| Treat wayfinder and the wiki as layers, not alternatives | adopted | Wayfinder converges on a destination and ends; the wiki describes the system for as long as it lives. `cup` used both in sequence. |
| Make landing a named operation in the schema, with a ledger as its completion criterion | adopted | The missing step between the two: without it, the spec quietly becomes the wiki (resend) or the move is done by hand (`cup`). Accounting for every Decisions-so-far line makes it checkable. |
| Keep the schema in `docs/agents/domain.md` | adopted | The engineering skills already reach that file through the `## Agent skills` block, so the wiki rides an existing pointer instead of adding one. |
| Write decisions and evidence as dated history, and only architecture pages as the present | adopted | Matt Pocock's practice and the gist's supersession notes: history cannot drift silently, so current-state prose is limited to what explains the code across components. |
| Make the skill user-invoked | adopted | Setup and landing happen at moments the user chooses; ongoing maintenance lives in the repository's own schema, which needs no skill description in context. |
| Write templates as Markdown assets and the overview from the code, without a script | adopted | The content depends on each repository's code; a script could only copy files. |
| Include docs search tooling in the skeleton | rejected | The gist finds the index enough at small scale and recommends search only as the wiki grows; `cup` added search with 35 pages, when it moved a large body of research and decisions in at once. |
| Prescribe GitHub Issues over local markdown for wayfinder | superseded | First draft left the tracker to `setup-matt-pocock-skills` without a recommendation. |
| Recommend the hosted tracker for wayfinder, local maps only for throwaway work | adopted | User decision on 2026-10-26, from the Matt Pocock research: decision tickets stay in closed issues that ADRs link, and nothing persists in the repository by accident. Landing still covers local maps. |
| Give current-state pages a size budget (about 300 words per section, 1,500 per page) | adopted | User decision on 2026-10-26. `cup`'s 530-word "API definitions" paragraph showed that restated code drifts; the budget turns accretion into a lint finding. |
| Prefer enforced checks over prose for invariants | adopted | User decision on 2026-10-26: lint rules, import boundaries, contract snapshots and tests cannot drift; pages name the check. |
| Add a check only when keeping it costs less than the drift it prevents | adopted | User decision on 2026-10-27: a library-layer check, which needed every new library assigned a layer by hand, was removed from patricktree/cup#51 before merge because its upkeep outweighed the rule it guarded. |
| Fold in the rules from `cup`'s compaction pass (guarantee-or-restated-code test, one home per rule, confirm the code holds a detail before deleting it, split multi-rule paragraphs, extra health-review checks) | adopted | Found while compacting `cup`'s wiki in patricktree/cup#46 and adopted into its schema in patricktree/cup#48; general to any codebase wiki. |
| Schedule the health review and report findings as one issue | adopted | User decision on 2026-10-26: the docs check proves only structure, and an issue keeps fixes reviewable instead of silent. |

## Gaps

- Landing has been designed from one hand-run instance (`cup`) and one counterexample (resend); the first real run should confirm the ledger is practical.
- Multi-context repositories (`GLOSSARY-MAP.md`) are handled only by asking the user during setup.
