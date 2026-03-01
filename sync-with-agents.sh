#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)" # dirname may be relative; cd+pwd makes absolute, stable symlink target even from other CWDs/symlinks
MY_SKILLS_DIR="${SCRIPT_DIR}/skills"
CENTRAL_SKILLS_DIR="${HOME}/.agents/skills"

AGENTS_DIR="${HOME}/.agents"
CLAUDE_DIR="${HOME}/.claude"
CODEX_DIR="${HOME}/.codex"
GITHUB_DIR="${HOME}/.github"

SOURCE_FILE_NAME="AGENTS.template.md"

# copy AGENTS.template.md to each agent's directory as AGENTS.md (or CLAUDE.md for claude)
mkdir -p "${AGENTS_DIR}" "${CLAUDE_DIR}" "${CODEX_DIR}" "${GITHUB_DIR}"
cp "${SOURCE_FILE_NAME}" "${AGENTS_DIR}/AGENTS.md"
cp "${SOURCE_FILE_NAME}" "${CLAUDE_DIR}/CLAUDE.md"
cp "${SOURCE_FILE_NAME}" "${CODEX_DIR}/AGENTS.md"
cp "${SOURCE_FILE_NAME}" "${GITHUB_DIR}/AGENTS.md"

# create central skills directory and symlink each skill from my skills directory to the central skills directory
mkdir -p "${CENTRAL_SKILLS_DIR}"
for skill_dir in "${MY_SKILLS_DIR}"/*/; do
  skill_name="$(basename "${skill_dir}")"
  target="${CENTRAL_SKILLS_DIR}/${skill_name}"
  rm -rf "${target}"
  ln -s "${MY_SKILLS_DIR}/${skill_name}" "${target}"
done

# remove existing skills directories in each agent's directory and symlink to the central skills directory
rm -rf "${CLAUDE_DIR}/skills" "${CODEX_DIR}/skills" "${GITHUB_DIR}/skills"
ln -s "${CENTRAL_SKILLS_DIR}" "${CLAUDE_DIR}/skills"
ln -s "${CENTRAL_SKILLS_DIR}" "${CODEX_DIR}/skills"
ln -s "${CENTRAL_SKILLS_DIR}" "${GITHUB_DIR}/skills"
