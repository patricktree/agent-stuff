# agent-stuff

Shared configuration for AI coding agents — one source of truth for instructions and skills, distributed to every agent tool via symlinks.

## Problem

Multiple AI coding agents (Claude Code, Codex, pi, GitHub Copilot) each look for instructions and skills in their own directory under `~/` (`.claude/`, `.codex/`, `.agents/`, `.github/`). Maintaining identical configuration across all of them by hand is tedious and error-prone.

## Solution

This repo is the **single source of truth** for my `AGENTS.md` file and custom skills. A sync script copies the shared instructions file and wires up skills via symlinks so every agent reads the same content.

### Directory structure after sync

```text
# source: https://tree.nathanfriend.com/?s=(%27options!(%27fancy!true~fullPath!false~trailingSlash!true~rootDot!false)~M(%27M%27J3HFOFBtemplate.mdF*UFR41F6R*42F6.CsQ391369236R41541F*425423.claude03.codex03.pi0%27)~version!%271%27)*%20%200Q8.CsV3%5Cn*4my-custom-7-58H%2FOV%2F6R*SKILL.md3Ukill8%20--%3E%20J9Rthird-party-7-B*AGENTS.CagentF3*HworkspaceJ%2C%27%2FMsource!OC-stuffQ3BmdFUR**U7sV%2FU%01VURQOMJHFCB98765430*

~/
├── workspace/
│   └── agent-stuff/                  # ← this repo
│       ├── AGENTS.template.md        # shared agent instructions (source of truth)
│       └── skills/
│           ├── my-custom-skill-1/
│           │   └── SKILL.md
│           └── my-custom-skill-2/
│               └── SKILL.md
│
├── .agents/                          # central hub
│   ├── AGENTS.md                     # copied from AGENTS.template.md
│   └── skills/
│       ├── third-party-skill-1/      # installed independently
│       │   └── SKILL.md
│       ├── third-party-skill-2/      # installed independently
│       │   └── SKILL.md
│       ├── my-custom-skill-1 ------> ~/workspace/agent-stuff/skills/my-custom-skill-1
│       └── my-custom-skill-2 ------> ~/workspace/agent-stuff/skills/my-custom-skill-2
│
├── .claude/
│   ├── CLAUDE.md                     # copied from AGENTS.template.md
│   └── skills ----------------------> ~/.agents/skills
│
├── .codex/
│   ├── AGENTS.md                     # copied from AGENTS.template.md
│   └── skills ----------------------> ~/.agents/skills
│
└── .github/
    ├── AGENTS.md                     # copied from AGENTS.template.md
    └── skills ----------------------> ~/.agents/skills
```

## How it works

The setup has two layers of symlinks:

1. **Custom skills → central hub.**
   Each skill directory in `skills/` is symlinked into `~/.agents/skills/`. This merges custom skills with any third-party skills already installed there.

2. **Agent directories → central hub.**
   Each agent's `skills` path (`~/.claude/skills`, `~/.codex/skills`, etc.) is a symlink pointing to `~/.agents/skills/`. Every agent therefore sees the full, merged skill set without any duplication.

The instructions file (`AGENTS.template.md`) is **copied** (not symlinked) into each agent directory because some agents expect a specific filename (`CLAUDE.md` for Claude Code, `AGENTS.md` for the others).

## Usage

Run the sync script after changing `AGENTS.template.md` or adding/removing skills:

```sh
./sync-with-agents.sh
```

The script is idempotent — safe to run repeatedly.

## Adding a custom skill

1. Create a new directory under `skills/` with a `SKILL.md` inside it.
2. Run `./sync-with-agents.sh`.

The skill will be symlinked into `~/.agents/skills/` and immediately available to all agents.

## Adding a third-party skill

Place (or install) it directly into `~/.agents/skills/`. It sits alongside the symlinked custom skills and is picked up by every agent automatically — no sync step needed.
