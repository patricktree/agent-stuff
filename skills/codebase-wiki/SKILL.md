---
name: codebase-wiki
description: Set up an LLM-maintained documentation wiki in a repository's `docs/`, or land a finished wayfinder effort into it.
argument-hint: "[setup | land <effort>]"
disable-model-invocation: true
---

# Codebase wiki

A **codebase wiki** is the LLM wiki pattern applied to a repository: agents write and maintain `docs/`, humans read and steer it. It has four layers: the glossary (vocabulary), architecture pages (the present), ADRs (decisions, written as history) and research (evidence, written as history). Its schema, `docs/agents/domain.md`, tells every agent how to maintain them. Planning material from a wayfinder effort is temporary; **landing** moves what stays true into the wiki and retires the rest.

The schema is the single source of the maintenance rules, landing included. This skill installs the schema and the skeleton, and otherwise follows the schema.

## Input

- `setup` or empty: set up the wiki in the current repository.
- `land <effort>`: land one effort, named by its `.scratch/<effort>/` folder or its map issue.

Setup leaves its changes uncommitted for review. Land ends in an open pull request.

## Setup

1. **Explore.** Record `git status --short`; every pre-existing change must survive. Read whatever exists: `docs/`, `GLOSSARY.md` or `GLOSSARY-MAP.md`, `docs/adr/`, `docs/agents/*`, the `## Agent skills` block in `AGENTS.md` or `CLAUDE.md`, `.scratch/` efforts, and package scripts for a docs check or docs search.
2. **Present and confirm.** List each file you will create or change, and the existing content you will keep, move or fold in. Ask once about anything that branches, such as an existing `docs/agents/domain.md` with local rules, a docs tree with its own layout, or a glossary away from the repository root. When `docs/agents/issue-tracker.md` names local markdown and the repository has a GitHub or GitLab remote, recommend switching wayfinder to the hosted tracker by rerunning `setup-matt-pocock-skills`. Wait for the answer.
3. **Write the skeleton** from the [assets](assets/docs/), replacing every `{placeholder}`:
   - `docs/README.md`, `docs/architecture/README.md`, `docs/adr/README.md`, `docs/research/README.md`. Link the glossary where it lives.
   - `docs/agents/domain.md` from [the schema](assets/docs/agents/domain.md). It extends the seed that `setup-matt-pocock-skills` writes and replaces it; carry over every rule the user added to the old file. Fill `{docs check}` with the repository's docs check (`pnpm docs:check` in a Patricktree monorepo, else the `write-markdown` skill's markdownlint command). Replace `{docs search}` with a sentence naming the docs search command when the repository has one; otherwise delete it.
   - Write the system overview from the code: read the entry points and package boundaries, and link each component to its source. In a repository without code yet, write one paragraph on the intended system, labelled as a plan.
   - Index existing ADRs and research pages. Every index row links a page that exists.
4. **Point agents at the wiki.** Add this section near the top of whichever of `AGENTS.md` or `CLAUDE.md` exists, with the glossary link pointing where the glossary lives:

   ```markdown
   ## Documentation

   Before working on the project, read the [glossary](GLOSSARY.md) and the [wiki schema](docs/agents/domain.md), then the architecture pages and ADRs relevant to the task from the [documentation index](docs/README.md). Update affected documentation and diagrams in the same change as the implementation.
   ```

   If an `## Agent skills` block names `docs/agents/domain.md`, update that line's summary to name the wiki. If `docs/agents/issue-tracker.md` has a `## Wayfinding operations` section, append this bullet to it:

   ```markdown
   - **Land**: once the effort's build is merged, land it into the wiki as described in [the wiki schema](domain.md#land-a-finished-effort).
   ```

5. **Offer landing.** For each `.scratch/<effort>/` or open map issue whose build looks merged, offer to land it with `land <effort>`.
6. **Offer the scheduled health review.** Offer a recurring agent run, every one or two weeks, with the `schedule` skill where available, that follows the schema's `## Review the wiki's health` section and opens one issue with its findings. Create it only on the user's yes.
7. **Validate and report.** Run the docs check. Report the files created and changed, what was folded in from existing docs, the efforts still to land, and whether the health review is scheduled.

Setup is done when no `{placeholder}` remains, every page is reachable from `docs/README.md`, the docs check passes, and the pre-existing changes are untouched.

## Land

1. Read `docs/agents/domain.md`. When it lacks a `## Land a finished effort` section, add that section from [the schema](assets/docs/agents/domain.md) first and tell the user.
2. Follow that section for the named effort, through to its completion criterion.
3. **Open the pull request.** Commit the landing on a new branch with the `commit` skill, push it, and open a pull request whose body you write with the `pr` skill. The body carries the ledger: each line of the map's Decisions so far with where it went (ADR, architecture page, or dropped, with the reason), and each research file with its new path.
4. **Delete the incorporated research branches.** Once the pull request is open, delete each `research/<name>` branch whose investigation step 2 copied into `research/`, both locally and on the remote. Their content now lives in the pull request's commit.
5. **Report** the pull request link and the deleted branches.

Landing is done when the pull request is open with the full ledger and no incorporated research branch remains locally or on the remote.
