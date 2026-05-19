---
name: safe-git-practices
description: Enforces safe git workflow boundaries. Use when running git commands beyond read-only inspection, especially branch changes, checkout/switch, pull, push, rebase, merge, reset, clean, restore, rm, stash, or any destructive git operation.
---

# Safe Git Practices

Use this before running git workflow commands that can change repository state.

## Read-only by default

`git status`, `git diff`, and `git log` are always safe. Everything else requires explicit user consent.

For big reviews, prefer:

```bash
git --no-pager diff --color=never
```

## Consent rules

- Do not commit, amend, branch, pull, push, rebase, merge, stash, restore, reset, clean, remove, or switch worktrees unless the user explicitly asks.
- If the user types a command such as "pull and push", that is consent for that command.
- If the requested operation could overwrite or discard uncommitted work, stop and ask before proceeding.

## Branch safety

- Branch changes require user consent.
- `git checkout` is acceptable for PR review or explicit user request.
- Do not delete or rename unexpected files; stop and ask.

## Push and pull

- Push only when the user explicitly asks.
- Pull only when the user explicitly asks.
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
