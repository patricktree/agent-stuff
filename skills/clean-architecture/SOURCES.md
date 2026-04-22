# Sources

Retrieved: 2026-04-22

| Source | Trust tier | Confidence | Contribution | Usage constraints |
|---|---|---:|---|---|
| https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html | canonical | High | Primary source for dependency rule, concentric layers, boundary crossing via dependency inversion, and simple boundary data guidance. | Conceptual guidance; not a language- or framework-specific implementation guide. |
| https://blog.sentry.io/why-clean-architecture-makes-debugging-easier/ | secondary | High | Practical source for debugging, trace consistency, layer-specific error ownership, and testability implications. | Vendor blog; operational examples are illustrative rather than universal. |
| README.md | canonical | High | Repository conventions for where skills live and how they are synced. | Repo-local operational guidance only. |

## Decisions

| Decision | Status | Rationale |
|---|---|---|
| Create a provider-agnostic skill under `skills/clean-architecture/` | adopted | Matches repo structure and keeps the skill portable across synced agent environments. |
| Make the skill a concise guidance skill with one focused reference file | adopted | The domain benefits from a small orchestration file plus optional deeper reference material. |
| Emphasize dependency direction, boundary leaks, debugging, and testing | adopted | These are the strongest overlapping themes across the two requested articles and are the most actionable for coding agents. |
| Prescribe exact folder names or framework-specific code patterns | rejected | The sources emphasize dependency rules and responsibility boundaries over a single fixed layout. |
| Require a large set of supporting examples or scripts | rejected | Not necessary for this skill class; no repeated automation workflow is involved. |

## Coverage matrix

| Dimension | Status | Notes |
|---|---|---|
| Core Clean Architecture principles | complete | Covered in `SKILL.md` and `references/principles.md`. |
| Layer responsibilities | complete | Covered with a responsibility table and deeper reference sections. |
| Boundary crossing and dependency inversion | complete | Covered in the reference file. |
| Debugging implications | complete | Included in both the main skill and reference file. |
| Testing implications | complete | Included in both the main skill and reference file. |
| Refactoring and migration guidance | complete | Included as incremental migration guidance. |
| Trade-offs / over-abstraction warnings | complete | Included to keep the skill pragmatic. |

## Stopping rationale

Additional retrieval is currently low-yield for this request because the user explicitly supplied the two source articles, and those two sources already cover the conceptual foundation plus the practical debugging angle needed for a first version of this skill.

## Gaps

- No framework-specific examples are included yet.
- No language-specific folder structures are included yet.
- If the user wants implementation templates for a specific stack, add focused reference files later instead of bloating the base skill.
