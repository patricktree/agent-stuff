# agent-stuff

Universal configuration for AI coding agents — one source of truth for instructions and skills, distributed to every agent tool via symlinks.

## Problem

Multiple AI coding agents (Claude Code, Codex, pi, GitHub Copilot) each look for instructions and skills in their own directory under `~/` (`.claude/`, `.codex/`, `.agents/`, `.github/`). Maintaining identical configuration across all of them by hand is tedious and error-prone.

## Solution

This repo is the **single source of truth** for universal (platform-agnostic) agent instructions and skills. Device-specific skills live in separate repos (e.g. `agent-stuff-device-macbook`, `agent-stuff-device-rpi`) and are passed to the sync script as arguments.

The `~/.agents/` directory is the **central hub** on each machine — also a git repo to back up what's actually installed.

### Directory structure after sync

```text
~/
├── workspace/
│   ├── agent-stuff/                  # ← this repo (universal)
│   │   ├── AGENTS.template.md        # shared agent instructions (source of truth)
│   │   ├── sync-with-agents.sh       # accepts device-specific repos as arguments
│   │   └── skills/
│   │       ├── universal-skill-1/
│   │       │   └── SKILL.md
│   │       └── universal-skill-2/
│   │           └── SKILL.md
│   │
│   └── agent-stuff-device-macbook/   # device-specific repo (macOS)
│       ├── AGENTS.template.md        # optional platform-specific additions
│       └── skills/
│           └── macos-only-skill/
│               └── SKILL.md
│
├── .agents/                          # central hub (git repo for backup)
│   ├── AGENTS.md                     # copied from template(s)
│   └── skills/
│       ├── third-party-skill/        # installed independently
│       │   └── SKILL.md
│       ├── universal-skill-1 ------> ~/workspace/agent-stuff/skills/universal-skill-1
│       ├── universal-skill-2 ------> ~/workspace/agent-stuff/skills/universal-skill-2
│       └── macos-only-skill -------> ~/workspace/agent-stuff-device-macbook/skills/macos-only-skill
│
├── .claude/
│   ├── CLAUDE.md                     # copied from template(s)
│   └── skills ----------------------> ~/.agents/skills
│
├── .codex/
│   ├── AGENTS.md                     # copied from template(s)
│   └── skills ----------------------> ~/.agents/skills
│
└── .github/
    ├── AGENTS.md                     # copied from template(s)
    └── skills ----------------------> ~/.agents/skills
```

## How it works

The setup has two layers of symlinks:

1. **Custom skills → central hub.**
   Each skill directory from the universal repo (and any device-specific repos) is symlinked into `~/.agents/skills/`. This merges all custom skills with any third-party skills already installed there.

2. **Agent directories → central hub.**
   Each agent's `skills` path (`~/.claude/skills`, `~/.codex/skills`, etc.) is a symlink pointing to `~/.agents/skills/`. Every agent therefore sees the full, merged skill set without any duplication.

The instructions file (`AGENTS.template.md`) is **copied** (not symlinked) into each agent directory because some agents expect a specific filename (`CLAUDE.md` for Claude Code, `AGENTS.md` for the others). If a device-specific repo also has an `AGENTS.template.md`, its contents are appended.

## Usage

Run the sync script after changing `AGENTS.template.md` or adding/removing skills:

```sh
# Universal skills only
./sync-with-agents.sh

# Universal + device-specific skills
./sync-with-agents.sh ~/workspace/agent-stuff-device-macbook
```

The script is idempotent — safe to run repeatedly.

## Adding a universal skill

1. Create a new directory under `skills/` with a `SKILL.md` inside it.
2. Run `./sync-with-agents.sh` (with any device-specific repo arguments).

## Adding a device-specific skill

1. Create a new directory under `skills/` in the device-specific repo.
2. Run `./sync-with-agents.sh ~/workspace/<device-repo>`.

## Adding a third-party skill

Place (or install) it directly into `~/.agents/skills/`. It sits alongside the symlinked custom skills and is picked up by every agent automatically — no sync step needed.
