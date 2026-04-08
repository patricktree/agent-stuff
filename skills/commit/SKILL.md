---
name: commit
description: ALWAYS use this skill when committing code changes — never commit directly without it. Creates commits following project conventions with proper Conventional Commits format and co-authorship trailer. Also enforces safe git practices for branching, pushing, and destructive operations. Trigger on any commit, git commit, save changes, push, pull, or git workflow task.
---

# Git Commit and Workflow Conventions

## Prerequisites

Before committing, check the current state:

```bash
git status
git diff
```

Review the last 30 commit messages to match the existing style:

```bash
git log --oneline -30
```

**Never commit, amend, or push unless the user explicitly asks.** No auto-commits after checks pass, no "let me commit this" — wait for the user to say "commit", "commit and push", etc.

## Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Commit Types

Use Conventional Commits:

| Type | Purpose |
|------|---------|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Refactoring (no behavior change) |
| `build` | Build system or dependencies |
| `ci` | CI configuration |
| `chore` | Maintenance tasks |
| `docs` | Documentation only |
| `style` | Code formatting (no logic change) |
| `perf` | Performance improvement |
| `test` | Test additions or corrections |

### Subject Line Rules

- Use imperative, present tense: "Add feature" not "Added feature"
- No period at the end

### Body Guidelines

- Explain **what** and **why**, not how
- Use imperative mood and present tense
- Use real newlines in commit bodies; never include literal `\n` sequences

### Co-Authorship Trailer

Append this trailer to **every** commit message (empty line before the trailer):

```
Co-authored-by: patricktree-agents[bot] <2968297+patricktree-agents[bot]@users.noreply.github.com>
```

### Commit Command Hygiene

Do not embed escaped newlines like `\n` inside `-m` strings. Prefer multiple `-m` flags or the editor flow:

```bash
git commit -m "type(scope): Subject" \
  -m "Body paragraph explaining what and why." \
  -m "Co-authored-by: patricktree-agents[bot] <2968297+patricktree-agents[bot]@users.noreply.github.com>"
```

### Examples

#### Simple fix

```
fix(api): Handle null response in user endpoint

The user API could return null for deleted accounts, causing a crash
in the dashboard. Add null check before accessing user properties.

Co-authored-by: patricktree-agents[bot] <2968297+patricktree-agents[bot]@users.noreply.github.com>
```

#### Feature with scope

```
feat(auth): Add OAuth2 refresh token rotation

Rotate refresh tokens on each use to limit the window of token theft.
Previous behavior reused the same refresh token until expiry.

Co-authored-by: patricktree-agents[bot] <2968297+patricktree-agents[bot]@users.noreply.github.com>
```

#### Refactor

```
refactor: Extract common validation logic to shared module

Move duplicate validation code from three endpoints into a shared
validator class. No behavior change.

Co-authored-by: patricktree-agents[bot] <2968297+patricktree-agents[bot]@users.noreply.github.com>
```

## Safe Git Practices

### Read-only by default

`git status`, `git diff`, `git log` are always safe. Everything else requires explicit user consent.

### Branch safety

- Branch changes require user consent.
- `git checkout` is ok for PR review or explicit user request.

### Push and pull

- If user types a command ("pull and push"), that is consent for that command.
- For big reviews: `git --no-pager diff --color=never`.

### Destructive operations

Forbidden unless the user explicitly asks:

- `git reset --hard`
- `git clean`
- `git restore`
- `git rm`
- Don't delete/rename unexpected files; stop and ask.

### Stash

Avoid manual `git stash`; if Git auto-stashes during pull/rebase, that's fine.

### Multi-agent workflows

- Check `git status` and `git diff` before edits.
- Ship small commits.

### Review before committing

Run `git diff --cached` after staging but before committing to verify exactly what will be committed.
