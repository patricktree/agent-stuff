---
description: Apply Patrick's standard GitHub repository and Actions settings
argument-hint: "[OWNER/REPO]"
---

# Configure a GitHub repository

Configure the target GitHub repository using `gh` only.

Resolve the target as follows:

1. Use `$1` when provided.
2. Otherwise, resolve the repository associated with the current working directory.
3. Require an existing repository owned by `patricktree`. If the target is missing, ambiguous, or owned by someone else, stop and explain the mismatch without changing anything.

This invocation authorizes changing these repository settings. Apply exactly this configuration:

- Disable Projects.
- Disable merge commits.
- Disable rebase merging.
- Enable automatic deletion of head branches after pull requests are merged.
- Keep GitHub Actions enabled.
- Require Actions and reusable workflows to be pinned to a full-length commit SHA.
- Set the Actions policy to selected actions and reusable workflows. This must allow actions owned by `patricktree`, allow actions created by GitHub, disallow the blanket Marketplace verified-creators category, and use no additional allowlist patterns.

Use `gh repo edit` for repository settings and `gh api` for Actions permissions. The Actions permission state must be:

- `enabled`: `true`
- `allowed_actions`: `selected`
- `sha_pinning_required`: `true`
- `github_owned_allowed`: `true`
- `verified_allowed`: `false`
- `patterns_allowed`: `[]`

Preserve every repository setting not listed above. Do not create a repository when the target does not exist.

Read back both the repository settings and Actions permission endpoints after mutation. Finish only when every requested value matches, then report the target repository and the verified values. If GitHub rejects any setting, report the exact rejected setting and API error.
