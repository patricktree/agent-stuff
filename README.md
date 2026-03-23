# agent-stuff

Universal configuration for AI coding agents — one source of truth for instructions, skills, and prompt templates, distributed to every agent tool.

## Problem

Multiple AI coding agents (Claude Code, Codex, pi, GitHub Copilot) each look for instructions, skills, and prompt templates in their own directory under `~/` (`.claude/`, `.codex/`, `.pi/`, `.github/`). Maintaining identical configuration across all of them by hand is tedious and error-prone.

## Solution

This repo is the **single source of truth** for universal (platform-agnostic) agent instructions, skills, and prompt templates. Device-specific content lives in separate repos (e.g. `agent-stuff-device-macbook`, `agent-stuff-device-rpi`) and are passed to the sync script as arguments.

The `~/.agents/` directory is the **central hub** on each machine — also a git repo to back up what's actually installed.

### Directory structure after sync

```text
~/
├── workspace/
│   ├── agent-stuff/                  # ← this repo (universal)
│   │   ├── AGENTS.template.md        # shared agent instructions (source of truth)
│   │   ├── sync-with-agents.sh       # accepts device-specific repos as arguments
│   │   ├── skills/
│   │   │   ├── universal-skill-1/
│   │   │   │   └── SKILL.md
│   │   │   └── universal-skill-2/
│   │   │       └── SKILL.md
│   │   └── prompts/                  # canonical prompt templates (1-based args)
│   │       ├── explore.md
│   │       ├── read-deep.md
│   │       └── ...
│   │
│   └── agent-stuff-device-macbook/   # device-specific repo (macOS)
│       ├── AGENTS.template.md        # optional platform-specific additions
│       ├── skills/
│       │   └── macos-only-skill/
│       │       └── SKILL.md
│       └── prompts/                  # optional device-specific templates
│           └── ...
│
├── .agents/                          # central hub (git repo for backup)
│   ├── AGENTS.md                     # copied from template(s)
│   └── skills/                       # merged skills only (no prompt templates)
│       ├── third-party-skill/        # installed independently
│       │   └── SKILL.md
│       ├── universal-skill-1 ------> ~/workspace/agent-stuff/skills/universal-skill-1
│       ├── universal-skill-2 ------> ~/workspace/agent-stuff/skills/universal-skill-2
│       └── macos-only-skill -------> ~/workspace/agent-stuff-device-macbook/skills/macos-only-skill
│
├── .claude/
│   ├── CLAUDE.md                     # copied from template(s)
│   └── skills/                       # real dir: individual skill symlinks + prompt template skills
│       ├── .sync-managed-prompts     # manifest of managed prompt template skills
│       ├── universal-skill-1 ------> ~/.agents/skills/universal-skill-1
│       ├── universal-skill-2 ------> ~/.agents/skills/universal-skill-2
│       ├── macos-only-skill -------> ~/.agents/skills/macos-only-skill
│       ├── explore/                  # prompt template → skill (created by sync)
│       │   └── SKILL.md             #   disable-model-invocation: true, 0-based args
│       └── rams/
│           └── SKILL.md
│
├── .codex/
│   └── AGENTS.md                     # copied from template(s)
│
├── .github/
│   ├── AGENTS.md                     # copied from template(s)
│   └── skills/                       # real dir: individual skill symlinks only
│       ├── universal-skill-1 ------> ~/.agents/skills/universal-skill-1
│       └── ...
│
└── .pi/
    └── agent/
        ├── AGENTS.md                 # copied from template(s)
        └── prompts/                  # copied from prompts/ (as-is, 1-based)
            ├── .sync-managed-prompts
            ├── explore.md
            └── ...
```

## How it works

### Skills: symlinks through a central hub

1. **Custom skills → central hub.**
   Each skill directory from the universal repo (and any device-specific repos) is symlinked into `~/.agents/skills/`. This merges all custom skills with any third-party skills already installed there.

2. **Central hub → agent directories.**
   Each agent gets a **real** `skills/` directory containing **individual symlinks** to each skill in `~/.agents/skills/`. This avoids a directory-level symlink, keeping the central hub clean and allowing agent-specific additions (like Claude Code's prompt template skills) without polluting other agents.

### Prompt templates: copied to Pi, converted to skills for Claude Code

Prompt templates are synced differently to each tool because of format differences:

**Pi** — Templates are **copied** as-is to `~/.pi/agent/prompts/`, preserving the canonical 1-based argument syntax.

**Claude Code** — Each template becomes a **skill directory** (`name/SKILL.md`) in `~/.claude/skills/`, alongside the regular skill symlinks. The sync script transforms each template:

| Transformation | Example |
|---|---|
| Wrap in `name/SKILL.md` directory structure | `explore.md` → `explore/SKILL.md` |
| Add `disable-model-invocation: true` to frontmatter | User-only invocation via `/name` |
| Shift positional args from 1-based to 0-based | `$1` → `$0`, `$2` → `$1` |
| Replace `$@` with `$ARGUMENTS` | Pi alias → Claude Code equivalent |

A `.sync-managed-prompts` manifest in each target tracks which files/directories are managed, enabling stale cleanup when templates are removed from the source.

### Instructions: copied with renaming

The instructions file (`AGENTS.template.md`) is **copied** (not symlinked) into each agent directory because some agents expect a specific filename (`CLAUDE.md` for Claude Code, `AGENTS.md` for the others). If a device-specific repo also has an `AGENTS.template.md`, its contents are appended.

## Usage

Run the sync script after changing `AGENTS.template.md`, or adding/removing skills or prompt templates:

```sh
# Universal only
./sync-with-agents.sh

# Universal + device-specific
./sync-with-agents.sh ~/workspace/agent-stuff-device-macbook
```

The script is idempotent — safe to run repeatedly.

## Prompt template format

Prompt templates are Markdown files invoked via `/name` in the editor (both Pi and Claude Code). The canonical format **always** includes YAML frontmatter and uses **Pi's 1-based** positional argument syntax:

```markdown
---
description: Short description shown in autocomplete
---

Template body with $1 positional arguments and $@ for all args...
```

Supported argument syntax in canonical format: `$1`, `$2`, `$@` / `$ARGUMENTS`, `${@:N}`, `${@:N:L}`.

The sync script automatically transforms positional args to Claude Code's 0-based syntax and adds `disable-model-invocation: true` when creating skill directories.

## Adding a universal skill

1. Create a new directory under `skills/` with a `SKILL.md` inside it.
2. Run `./sync-with-agents.sh` (with any device-specific repo arguments).

## Adding a universal prompt template

1. Create a new `.md` file under `prompts/` with YAML frontmatter containing `description`.
2. Use 1-based positional args (`$1`, `$2`) in the canonical format.
3. Run `./sync-with-agents.sh` (with any device-specific repo arguments).

## Adding a device-specific skill or prompt template

1. Create the skill directory or prompt `.md` file in the device-specific repo.
2. Run `./sync-with-agents.sh ~/workspace/<device-repo>`.

## Adding a third-party skill

Place (or install) it directly into `~/.agents/skills/`. It sits alongside the symlinked custom skills and is picked up by every agent automatically on next sync.

## Adding a third-party prompt template

Place the `.md` file directly into `~/.pi/agent/prompts/` (for Pi) or create a skill directory in `~/.claude/skills/` (for Claude Code). Files/directories not listed in `.sync-managed-prompts` are left untouched by the sync script.
