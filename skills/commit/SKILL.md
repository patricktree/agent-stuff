---
name: commit
description: ALWAYS use this skill when creating a git commit. Reviews the change and writes the message in the repository's commit style, Conventional Commits by default.
---

# Git Commit Conventions

Whether a commit needs the user's approval is decided by the `safe-git-practices` skill.

## Prepare

Check what goes into the commit:

```bash
git status
git diff HEAD
```

Read the last 30 commit messages, bodies included, to learn the repository's commit style:

```bash
git log -30 --format='%s%n%n%b%n---'
```

## Message format

Match the style the history shows. When the history has no consistent style, use Conventional Commits:

```text
<type>(<scope>): <subject>

<body>

<footer>
```

Types: `feat`, `fix`, `refactor`, `build`, `ci`, `chore`, `docs`, `style`, `perf`, `test`.

In the body, explain what changed and why; the diff already shows how.

## Commit command

Pass each paragraph as its own `-m` flag so the message contains real newlines rather than literal `\n` sequences:

```bash
git commit -m "type(scope): subject" \
  -m "Body paragraph explaining what and why."
```
