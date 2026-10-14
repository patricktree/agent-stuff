---
description: Apply Patrick's standard GitHub repository, home page, and Actions settings
argument-hint: "[OWNER/REPO]"
---

# Configure a GitHub repository

Configure the target GitHub repository using `gh` for repository and Actions settings, and browser automation for the repository home page details dialog.

Resolve the target as follows:

1. Use `$1` when provided.
2. Otherwise, resolve the repository associated with the current working directory.
3. Require an existing repository owned by `patricktree`. If the target is missing, ambiguous, or owned by someone else, stop and explain the mismatch without changing anything.

This invocation authorizes changing these repository settings. Apply exactly this configuration:

- Disable Projects.
- Hide Releases, Deployments, and Packages from the repository home page through the About section's **Edit repository details** dialog.
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

Use browser automation to open the resolved target repository's home page and select the gear beside **About** to access **Edit repository details**. Under **Include in the home page**, set **Releases**, **Deployments**, and **Packages** to unchecked, then select **Save changes**. Preserve **Description**, **Website**, and **Topics**. These checkboxes control home page visibility; keep the underlying releases, deployment environments, packages, and workflows intact. Reopen the dialog after saving and verify that all three checkboxes are unchecked. If browser access, authentication, or permission to edit the dialog is unavailable, report the home page settings as blocked and complete the settings available through `gh`.

Preserve every repository setting not listed above. Do not create a repository when the target does not exist.

Read back both the repository settings and Actions permission endpoints after mutation. Report full success only when every requested value matches, including the three home page checkboxes. Otherwise, report the target repository, the settings successfully verified, and each failed or blocked setting with its API error or browser blocker.
