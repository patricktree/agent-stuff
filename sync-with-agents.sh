#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)" # dirname may be relative; cd+pwd makes absolute, stable symlink target even from other CWDs/symlinks
CENTRAL_SKILLS_DIR="${HOME}/.agents/skills"

AGENTS_DIR="${HOME}/.agents"
CLAUDE_DIR="${HOME}/.claude"
CODEX_DIR="${HOME}/.codex"
GITHUB_DIR="${HOME}/.github"

# --- Collect all skill source repos: this repo + any extras passed as args ---
SKILL_SOURCES=("${SCRIPT_DIR}/skills")
for arg in "$@"; do
  if [[ -d "${arg}/skills" ]]; then
    SKILL_SOURCES+=("$(cd "${arg}" && pwd)/skills")
  else
    echo "Warning: skipping '${arg}' (no skills/ directory found)" >&2
  fi
done

# --- Build AGENTS.md: base + optional platform additions from extra repos ---
mkdir -p "${AGENTS_DIR}" "${CLAUDE_DIR}" "${CODEX_DIR}" "${GITHUB_DIR}"

AGENTS_CONTENT=$(mktemp)
cp "${SCRIPT_DIR}/AGENTS.template.md" "${AGENTS_CONTENT}"
for arg in "$@"; do
  if [[ -f "${arg}/AGENTS.template.md" ]]; then
    printf '\n' >> "${AGENTS_CONTENT}"
    cat "${arg}/AGENTS.template.md" >> "${AGENTS_CONTENT}"
  fi
done

cp "${AGENTS_CONTENT}" "${AGENTS_DIR}/AGENTS.md"
cp "${AGENTS_CONTENT}" "${CLAUDE_DIR}/CLAUDE.md"
cp "${AGENTS_CONTENT}" "${CODEX_DIR}/AGENTS.md"
cp "${AGENTS_CONTENT}" "${GITHUB_DIR}/AGENTS.md"
rm -f "${AGENTS_CONTENT}"

# --- Symlink skills from all sources ---
mkdir -p "${CENTRAL_SKILLS_DIR}"

for source_dir in "${SKILL_SOURCES[@]}"; do
  for skill_dir in "${source_dir}"/*/; do
    [[ -d "${skill_dir}" ]] || continue
    skill_name="$(basename "${skill_dir}")"
    target="${CENTRAL_SKILLS_DIR}/${skill_name}"
    rm -rf "${target}"
    ln -s "${skill_dir%/}" "${target}"
  done
done

# --- Symlink agent skill dirs to central ---
rm -rf "${CLAUDE_DIR}/skills" "${CODEX_DIR}/skills" "${GITHUB_DIR}/skills"
ln -s "${CENTRAL_SKILLS_DIR}" "${CLAUDE_DIR}/skills"
ln -s "${CENTRAL_SKILLS_DIR}" "${CODEX_DIR}/skills"
ln -s "${CENTRAL_SKILLS_DIR}" "${GITHUB_DIR}/skills"

echo "Synced skills from ${#SKILL_SOURCES[@]} source(s)"
echo "Run 'cd ~/.agents && git add -A && git status' to review changes"
