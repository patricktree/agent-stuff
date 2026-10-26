---
name: safe-git-practices
description: Git consent boundaries, the single source for which git operations run freely and which need the user's approval. Use before any git command that changes repository state, such as commit, amend, push, pull, branch or worktree switches, rebase, merge, stash, or destructive operations like reset, clean, restore, or rm.
---

# Safe Git Practices

## Run without asking

Run these whenever the task needs them:

- Read-only inspection. For big diffs, prefer `git --no-pager diff --color=never`.
- `git pull`, including its merge or rebase integration and options such as `--rebase` and `--autostash`.
- Submodule initialization: `git submodule init`, or `git submodule update --init` with optional `--recursive`.
- New commits on a branch other than the default branch, such as a worktree branch.
- `git checkout` to review a PR.

## Ask first

Every other operation that changes repository state runs only when the user explicitly asks: commits on the default branch, amends, pushes, creating or switching branches and worktrees, rebases, merges, manual stashes, and the destructive operations below. A command the user types, such as "pull and push", is consent for exactly that command.

## Destructive operations

`git reset --hard`, `git clean`, `git restore`, and `git rm` discard work. Run one only when the user asks for that specific operation; when that consent is ambiguous, ask a clarifying question.

## Protect existing work

- Run `git status` before a pull, push, rebase, or merge.
- When Git refuses a pull or submodule initialization because local changes would be overwritten, ask the user how to handle those changes.
- When you meet unexpected files, stop and ask before deleting or renaming them.
