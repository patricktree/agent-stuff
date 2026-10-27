# Documentation wiki

This repository keeps an LLM-maintained wiki: agents write and maintain the pages, humans read and steer them. This file is the wiki's schema. Engineering skills reach it as the repository's domain docs.

## Layers

| Layer | Pages | Written as |
| --- | --- | --- |
| Vocabulary | `GLOSSARY.md` | Definitions: what each term means |
| Current state | [`architecture/`](../architecture/README.md) and the guides | The present: what the checkout does now |
| Decisions | [`adr/`](../adr/README.md) | History: what was decided, when, where and why |
| Evidence | [`research/`](../research/README.md) | History: what was found, when and from which sources |

The code is the source of truth for behaviour. Current-state pages are the only layer that needs upkeep, so keep it small: cover only what no single file shows (how components relate, invariants, flows across components, data ownership) and link to the code for the rest. A section past about 300 words or a page past about 1,500 is a compaction signal. When a rule can be enforced by a lint rule, an import boundary, a contract snapshot or a test, enforce it there and let the page name the check instead of restating the rule; prose keeps the rationale and the flows no check expresses. Add a check only when keeping it costs less than the drift it prevents: one that every new package or ordinary change must update by hand, such as a maintained list of layers, stays prose.

Decision and evidence pages are history, which cannot go stale: each claim carries its date and its source (issue, PR, commit or URL), claims about code cite a commit, and a changed conclusion gets a new dated note or a superseding ADR, never a rewrite.

The [index](../README.md) lists every page, directly or through the `README.md` of its directory, with a one-line summary. Git history is the wiki's log: each wiki change rides in the commit of the change it describes, and there is no log file.

## Before design or implementation

Read `GLOSSARY.md`, then the index, then the architecture pages and ADRs that touch the area. Use the glossary's terms in issues, specs, tests and code, in place of the synonyms it lists under _Avoid_. A concept the glossary lacks is either invented language (reconsider it) or a real gap (resolve its meaning with the `domain-modeling` skill before using it).

When your change contradicts an accepted ADR, say so before going ahead.

## Find related pages

Before changing, renaming or removing a domain concept or a cross-component behaviour, find every page that describes it: follow the index, then `rg` for the term, its synonyms and the identifiers involved. {docs search} After a rename or removal, search again for the meaning as well as the old words; an empty result for the old words alone proves nothing.

## Update with the implementation

Update affected pages and diagrams in the same change as the code whenever it moves a component boundary, an authentication or authorization flow, data ownership, a storage lifecycle, an external dependency or a cross-component behaviour. A change confined to one module needs no wiki change.

Document responsibilities, relationships, invariants and flows that span components, and link to route contracts, schemas and configuration instead of copying them. Before adding a sentence, ask whether it states a guarantee or restates code: identifiers, constants, field lists, which module does what, and test mechanics belong in the code, code comments or package guides. Extend the existing page before adding a second explanation of the same subject, and split a paragraph into a list or subsections once it covers several separate rules. Label plans, unknowns, implementation gaps and manual prerequisites as such: an accepted ADR or a glossary entry does not prove implementation, and repository configuration does not prove deployment.

## Record decisions and evidence

Write an ADR only for a decision that is hard to reverse, surprising without context, and the result of a real trade-off (the `domain-modeling` skill's test). Each ADR names the issue where it was decided and the change that implemented it. For a reversal, write a new ADR that links the old one, and set the old one's status to `superseded by NNNN` while keeping its rationale.

A research page keeps its sources, observation dates, limits and reproduction steps. To ingest one, update the pages it supports or contradicts, record contradictions you cannot resolve, and add it to the research index. When its conclusion stops guiding the project, add a dated note linking what replaced it.

## Land a finished effort

An effort planned with the `wayfinder` skill (a map with decision tickets, often a spec and research) and then built leaves planning material behind. Run wayfinder on the hosted issue tracker, where decision tickets stay in closed issues that ADRs can link; keep local `.scratch/` maps for throwaway work. **Landing** moves what stays true into the wiki and retires the rest. Land an effort once its build is merged:

1. Read the map's Decisions so far and Out of scope, the spec, the research findings, and the merged code.
2. Research: copy each investigation into `research/` from where wayfinder left it (an unmerged `research/<name>` branch or `.scratch/<effort>/`). Put a dated incorporation note at the top saying what the project adopted and what is now historical, followed by a permalink to the original at its commit.
3. Decisions: write an ADR for each decision that passes the ADR test. Every other decision is visible in the code, explained on an architecture page, or no longer matters.
4. Current state: describe what was built on the architecture pages, verified against the code rather than the spec. Spec content that was not built becomes a labelled plan on the page it affects, or is dropped.
5. Vocabulary: check every term the effort introduced against `GLOSSARY.md`.
6. Retire the planning material: close the map issue with a comment linking the landing change, or, for a local map, delete `.scratch/<effort>/` in the same change (git keeps it). Repoint every reference to it in `AGENTS.md`, package docs and code comments.

Landing is done when every line of the map's Decisions so far is accounted for (ADR, architecture page, or dropped, each listed in the commit or PR description), every research file is indexed, and nothing in the repository still references the retired planning material.

## Review the wiki's health

A health review runs on a schedule as well as on request; the docs check catches broken structure, this review catches pages that became untrue. State the scope, then follow the index into the pages and the code they link. Look for contradictions between pages, claims the code no longer backs, restated code, near-duplicate explanations across pages, research whose conclusions no longer match the code, orphan pages, missing index entries, concepts mentioned without a page, decisions without an implementation, and current-state pages over their size budget. Report the findings as one issue on the tracker, each with page and source references, confirmed mismatches apart from open questions, and what you did not cover; fixes follow as their own changes.

## Compact

Pages build up the way code does. Suggest compaction when you notice overlapping explanations, current-state pages restating code, obsolete detail hiding the behaviour, or an index that is hard to scan. Within an authorized change, rewrite decayed pages, merge duplicates, delete pages that stopped mattering, and move a cluster of related pages into a subdirectory with its own `README.md` index. Keep each rule in one home (the glossary for meaning, one architecture section for behaviour) and link to it from elsewhere. Before deleting restated detail, confirm the linked code or guide holds it; otherwise move it there first. Fix every inbound link in the same pass.

## Complete the change

New pages are indexed, moved or renamed pages have no broken inbound links, and `{docs check}` passes. These checks prove structure, not accuracy, so read changed prose and diagrams once more against the code they describe.
