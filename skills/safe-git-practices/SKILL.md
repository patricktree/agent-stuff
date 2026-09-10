---
name: safe-git-practices
description: Enforces safe git workflow boundaries. Use when running git commands beyond read-only inspection, especially branch changes, checkout/switch, pull, push, rebase, merge, reset, clean, restore, rm, stash, or any destructive git operation.
---

# Safe Git Practices

Use this before running git workflow commands that can change repository state.

## Operations allowed without confirmation

Read-only inspection, all `git pull` operations, and submodule initialization are preauthorized when relevant to the task. Run them without requesting confirmation. This includes pull's merge or rebase integration, `git submodule init`, and `git submodule update --init` with optional `--recursive`. Other Git changes require explicit user consent.

For big reviews, prefer:

```bash
git --no-pager diff --color=never
```

## Consent rules

- Outside the preauthorized operations above, do not commit, amend, branch, push, rebase, merge, stash, restore, reset, clean, remove, or switch worktrees unless the user explicitly asks.
- If the user types a command such as "pull and push", that is consent for that command.
- Preserve uncommitted work. If Git refuses a pull or submodule initialization because local changes would be overwritten, ask how to handle those changes instead of forcing the operation or discarding them.

## Branch safety

- Branch changes require user consent.
- `git checkout` is acceptable for PR review or explicit user request.
- Do not delete or rename unexpected files; stop and ask.

## Push and pull

- Push only when the user explicitly asks.
- Pull without confirmation when relevant to the task; the permission includes pull options such as `--rebase` and `--autostash`.
- Before pull, push, rebase, or merge, inspect the working tree with `git status`.

## Destructive operations

These are forbidden unless the user explicitly asks for that specific operation:

- `git reset --hard`
- `git clean`
- `git restore`
- `git rm`

When destructive consent is ambiguous, ask a clarifying question instead of guessing.

## Stash

Avoid manual `git stash`; if Git auto-stashes during pull or rebase, that is fine.
