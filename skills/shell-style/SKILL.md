---
name: shell-style
description: >-
  Personal shell script and bash snippet style. Use when writing or editing
  Bash, POSIX shell, GitHub Actions run blocks, shell scripts, or command
  snippets with shell variables, parameter expansion, command substitution, or
  environment variables.
---

# Shell Style

Apply this style when writing persistent shell scripts, GitHub Actions `run` blocks, or shell snippets that the user is expected to keep.

## Variable expansion

Prefer braced variable expansion for shell variables.

```sh
image_name="ghcr.io/example/project/relay-hub"
echo "${image_name}:${GITHUB_SHA}"
```

Do not write unbraced variables when braced expansion is equally clear.

```sh
# Avoid
echo "$image_name:$GITHUB_SHA"

# Prefer
echo "${image_name}:${GITHUB_SHA}"
```

Use braces to avoid ambiguity when text is adjacent to the variable name.

## General shell style

- Quote variable expansions by default: `"${target_dir}"`.
- Prefer explicit, readable control flow over compact one-liners.
