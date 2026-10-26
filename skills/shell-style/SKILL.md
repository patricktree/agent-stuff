---
name: shell-style
description: >-
  Personal shell style: braced, quoted variable expansion. Use when writing or
  editing shell scripts (Bash, POSIX sh), GitHub Actions `run` blocks, or
  command snippets that expand shell or environment variables.
---

# Shell Style

Apply this style to shell code the user is expected to keep: scripts, GitHub Actions `run` blocks, and saved snippets.

- Brace every variable expansion, environment variables included, even where nothing adjacent forces it: `"${image_name}:${GITHUB_SHA}"` rather than `"$image_name:$GITHUB_SHA"`.
- Quote variable expansions by default: `"${target_dir}"`.
- Prefer explicit, readable control flow over compact one-liners.
