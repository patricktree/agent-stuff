#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)" # dirname may be relative; cd+pwd makes absolute, stable symlink target even from other CWDs/symlinks
CENTRAL_SKILLS_DIR="${HOME}/.agents/skills"
AGENTS_DIR="${HOME}/.agents"
CLAUDE_DIR="${HOME}/.claude"
CODEX_DIR="${HOME}/.codex"
GITHUB_DIR="${HOME}/.github"
PI_DIR="${HOME}/.pi/agent"

# --- Collect all skill and prompt source repos: this repo + any extras passed as args ---
SKILL_SOURCES=("${SCRIPT_DIR}/skills")
PROMPT_SOURCES=("${SCRIPT_DIR}/prompts")
for arg in "$@"; do
  abs_arg="$(cd "${arg}" && pwd)"
  found=false
  if [[ -d "${arg}/skills" ]]; then
    SKILL_SOURCES+=("${abs_arg}/skills")
    found=true
  fi
  if [[ -d "${arg}/prompts" ]]; then
    PROMPT_SOURCES+=("${abs_arg}/prompts")
    found=true
  fi
  if [[ "${found}" == "false" ]]; then
    echo "Warning: skipping '${arg}' (no skills/ or prompts/ directory found)" >&2
  fi
done

# --- Build AGENTS.md: base + optional platform additions from extra repos ---
mkdir -p "${AGENTS_DIR}" "${CLAUDE_DIR}" "${CODEX_DIR}" "${GITHUB_DIR}" "${PI_DIR}"

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
cp "${AGENTS_CONTENT}" "${PI_DIR}/AGENTS.md"
rm -f "${AGENTS_CONTENT}"

# --- Symlink skills from all sources ---
mkdir -p "${CENTRAL_SKILLS_DIR}"

# Remove stale/dangling symlinks before re-syncing
find "${CENTRAL_SKILLS_DIR}" -maxdepth 1 -type l ! -exec test -e {} \; -delete

for source_dir in "${SKILL_SOURCES[@]}"; do
  for skill_dir in "${source_dir}"/*/; do
    [[ -d "${skill_dir}" ]] || continue
    skill_name="$(basename "${skill_dir}")"
    target="${CENTRAL_SKILLS_DIR}/${skill_name}"
    rm -rf "${target}"
    ln -s "${skill_dir%/}" "${target}"
  done
done

# --- Symlink individual skills from central hub into each agent's skills dir ---
# Each agent gets a real directory with per-skill symlinks (not a directory symlink).
# This keeps the central hub clean and allows agent-specific additions (e.g. prompt
# template skills for Claude Code) without polluting other agents.
MANAGED_PROMPTS=".sync-managed-prompts"

# Clean up prompt template skills previously placed in central hub (migration)
CENTRAL_MANAGED="${CENTRAL_SKILLS_DIR}/${MANAGED_PROMPTS}"
if [[ -f "${CENTRAL_MANAGED}" ]]; then
  while IFS= read -r dname; do
    rm -rf "${CENTRAL_SKILLS_DIR}/${dname}"
  done < "${CENTRAL_MANAGED}"
  rm -f "${CENTRAL_MANAGED}"
fi

for agent_skills_dir in "${CLAUDE_DIR}/skills" "${GITHUB_DIR}/skills"; do
  # Replace directory symlink (old approach) with real dir if needed
  [[ -L "${agent_skills_dir}" ]] && rm -f "${agent_skills_dir}"
  mkdir -p "${agent_skills_dir}"

  # Remove all existing skill symlinks (will be re-created from central hub)
  find "${agent_skills_dir}" -maxdepth 1 -type l -delete

  # Clean up previously managed prompt template skills
  managed_file="${agent_skills_dir}/${MANAGED_PROMPTS}"
  if [[ -f "${managed_file}" ]]; then
    while IFS= read -r dname; do
      rm -rf "${agent_skills_dir}/${dname}"
    done < "${managed_file}"
  fi
  rm -f "${managed_file}"

  # Symlink each skill from central hub (including hidden dirs like .system)
  for skill in "${CENTRAL_SKILLS_DIR}"/*/; do
    [[ -d "${skill}" ]] || continue
    skill_name="$(basename "${skill}")"
    ln -s "${skill%/}" "${agent_skills_dir}/${skill_name}"
  done
  for skill in "${CENTRAL_SKILLS_DIR}"/.*/; do
    [[ -d "${skill}" ]] || continue
    skill_name="$(basename "${skill}")"
    [[ "${skill_name}" == "." || "${skill_name}" == ".." ]] && continue
    ln -s "${skill%/}" "${agent_skills_dir}/${skill_name}"
  done
done

# --- Sync prompt templates ---
# Pi: copy as-is (canonical format, 1-based positional args).
# Claude Code: create skill dirs in ~/.claude/skills/ with transformed SKILL.md
#   - Adds disable-model-invocation: true to frontmatter
#   - Shifts positional args from 1-based to 0-based ($1 → $0)
#   - Replaces $@ with $ARGUMENTS
PI_PROMPTS_DIR="${PI_DIR}/prompts"

# If Pi prompts dir is a symlink (from a previous sync), replace with real dir
[[ -L "${PI_PROMPTS_DIR}" ]] && rm -f "${PI_PROMPTS_DIR}"
mkdir -p "${PI_PROMPTS_DIR}"

# Clean up previously managed Pi prompt files
PI_MANAGED="${PI_PROMPTS_DIR}/${MANAGED_PROMPTS}"
if [[ -f "${PI_MANAGED}" ]]; then
  while IFS= read -r fname; do
    rm -f "${PI_PROMPTS_DIR}/${fname}"
  done < "${PI_MANAGED}"
fi
> "${PI_MANAGED}"

# Clean up previously managed Claude Code commands (migration from old approach)
CLAUDE_CMD_MANIFEST="${CLAUDE_DIR}/commands/.sync-managed"
if [[ -f "${CLAUDE_CMD_MANIFEST}" ]]; then
  while IFS= read -r fname; do
    rm -f "${CLAUDE_DIR}/commands/${fname}"
  done < "${CLAUDE_CMD_MANIFEST}"
  rm -f "${CLAUDE_CMD_MANIFEST}"
fi

# Write prompt template skills manifest for Claude Code
CLAUDE_PROMPT_MANAGED="${CLAUDE_DIR}/skills/${MANAGED_PROMPTS}"
> "${CLAUDE_PROMPT_MANAGED}"

for source_dir in "${PROMPT_SOURCES[@]}"; do
  for template in "${source_dir}"/*.md; do
    [[ -f "${template}" ]] || continue
    template_basename="$(basename "${template}")"
    template_name="${template_basename%.md}"

    # Pi: copy as-is (canonical format, 1-based args)
    cp "${template}" "${PI_PROMPTS_DIR}/${template_basename}"
    echo "${template_basename}" >> "${PI_MANAGED}"

    # Claude Code: create skill dir with transformed SKILL.md
    skill_dir="${CLAUDE_DIR}/skills/${template_name}"
    mkdir -p "${skill_dir}"
    perl -pe '
      BEGIN { $in_fm = 0; $fm_done = 0 }
      if (/^---\s*$/ && !$fm_done) {
        if (!$in_fm) {
          $in_fm = 1;
        } else {
          $in_fm = 0;
          $fm_done = 1;
          $_ = "disable-model-invocation: true\n---\n";
        }
      } elsif ($fm_done) {
        s/\$(\d+)/"\$" . ($1-1)/ge;
        s/\$\@/\$ARGUMENTS/g;
      }
    ' "${template}" > "${skill_dir}/SKILL.md"
    echo "${template_name}" >> "${CLAUDE_PROMPT_MANAGED}"
  done
done

echo "Synced skills from ${#SKILL_SOURCES[@]} source(s), prompts from ${#PROMPT_SOURCES[@]} source(s)"
echo "Run 'cd ~/.agents && git add -A && git status' to review changes"
