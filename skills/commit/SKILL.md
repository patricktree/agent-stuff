---
name: commit
description: ALWAYS use this skill when committing code changes — never commit directly without it. Creates commits following project conventions with proper Conventional Commits format. Trigger on any commit, git commit, save changes, or request to create a commit.
---

# Git Commit Conventions

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

```text
<type>(<scope>): <subject>

<body>

<footer>
```

### Commit Types

Use Conventional Commits:

| Type       | Purpose                           |
| ---------- | --------------------------------- |
| `feat`     | New feature                       |
| `fix`      | Bug fix                           |
| `refactor` | Refactoring (no behavior change)  |
| `build`    | Build system or dependencies      |
| `ci`       | CI configuration                  |
| `chore`    | Maintenance tasks                 |
| `docs`     | Documentation only                |
| `style`    | Code formatting (no logic change) |
| `perf`     | Performance improvement           |
| `test`     | Test additions or corrections     |

### Subject Line Rules

- Use imperative, present tense: "add feature" not "added feature"
- No period at the end

### Body Guidelines

- Explain **what** and **why**, not how
- Use imperative mood and present tense
- Use real newlines in commit bodies; never include literal `\n` sequences

### Commit Command Hygiene

Do not embed escaped newlines like `\n` inside `-m` strings. Prefer multiple `-m` flags or the editor flow:

```bash
git commit -m "type(scope): subject" \
  -m "Body paragraph explaining what and why."
```

### Examples

#### Simple fix

```text
fix(api): handle null response in user endpoint

The user API could return null for deleted accounts, causing a crash
in the dashboard. Add null check before accessing user properties.
```

#### Feature with scope

```text
feat(auth): add OAuth2 refresh token rotation

Rotate refresh tokens on each use to limit the window of token theft.
Previous behavior reused the same refresh token until expiry.
```

#### Refactor

```text
refactor: extract common validation logic to shared module

Move duplicate validation code from three endpoints into a shared
validator class. No behavior change.
```
