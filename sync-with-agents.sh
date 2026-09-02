#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)" # dirname may be relative; cd+pwd makes absolute, stable symlink target even from other CWDs/symlinks
CENTRAL_SKILLS_DIR="${HOME}/.agents/skills"
AGENTS_DIR="${HOME}/.agents"
CLAUDE_DIR="${HOME}/.claude"
CODEX_DIR="${HOME}/.codex"
COPILOT_DIR="${HOME}/.copilot"
GITHUB_DIR="${HOME}/.github"
GEMINI_DIR="${HOME}/.gemini"
GEMINI_CONFIG_DIR="${GEMINI_DIR}/config"
GEMINI_COMMANDS_DIR="${GEMINI_DIR}/commands"
PI_DIR="${HOME}/.pi/agent"

# --- Collect all skill and prompt source repos: this repo + any extras passed as args ---
SKILL_SOURCES=("${SCRIPT_DIR}/skills")
PROMPT_SOURCES=("${SCRIPT_DIR}/prompts")
PI_EXTENSION_SOURCES=("${SCRIPT_DIR}/pi-extensions")
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
  if [[ -d "${arg}/pi-extensions" ]]; then
    PI_EXTENSION_SOURCES+=("${abs_arg}/pi-extensions")
    found=true
  fi
  if [[ "${found}" == "false" ]]; then
    echo "Warning: skipping '${arg}' (no skills/, prompts/, or pi-extensions/ directory found)" >&2
  fi
done

# --- Build AGENTS.md: base + optional platform additions from extra repos ---
mkdir -p "${AGENTS_DIR}" "${CLAUDE_DIR}" "${CODEX_DIR}" "${COPILOT_DIR}/skills" "${GITHUB_DIR}" "${GEMINI_DIR}" "${GEMINI_CONFIG_DIR}" "${GEMINI_COMMANDS_DIR}" "${PI_DIR}"

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
cp "${AGENTS_CONTENT}" "${GEMINI_DIR}/AGENTS.md"
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
# This keeps the central hub clean and allows agent-specific prompt adapters
# without exposing them to agents that interpret invocation policy differently.
MANAGED_PROMPTS=".sync-managed-prompts"

# Clean up prompt template skills previously placed in central hub (migration)
CENTRAL_MANAGED="${CENTRAL_SKILLS_DIR}/${MANAGED_PROMPTS}"
if [[ -f "${CENTRAL_MANAGED}" ]]; then
  while IFS= read -r dname; do
    [[ -n "${dname}" ]] || continue
    rm -rf "${CENTRAL_SKILLS_DIR:?}/${dname}"
  done < "${CENTRAL_MANAGED}"
  rm -f "${CENTRAL_MANAGED}"
fi

for agent_skills_dir in "${CLAUDE_DIR}/skills" "${CODEX_DIR}/skills" "${GITHUB_DIR}/skills" "${GEMINI_CONFIG_DIR}/skills" "${PI_DIR}/skills"; do
  mkdir -p "${agent_skills_dir}"

  # Remove all existing skill symlinks (will be re-created from central hub)
  find "${agent_skills_dir}" -maxdepth 1 -type l -delete

  # Clean up previously managed prompt template skills
  managed_file="${agent_skills_dir}/${MANAGED_PROMPTS}"
  if [[ -f "${managed_file}" ]]; then
    while IFS= read -r dname; do
      [[ -n "${dname}" ]] || continue
      rm -rf "${agent_skills_dir:?}/${dname}"
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

# --- Sync prompt templates through agent-specific adapters ---
# Pi keeps native prompt templates so /name and one-based substitutions work.
# Claude Code and GitHub Copilot receive manual-only skills.
# Codex receives explicit-only skills using agents/openai.yaml policy.
# Gemini receives native custom commands because it ignores skill invocation policy.
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
: > "${PI_MANAGED}"

# Clean up previously managed Claude Code commands (migration from old approach)
CLAUDE_CMD_MANIFEST="${CLAUDE_DIR}/commands/.sync-managed"
if [[ -f "${CLAUDE_CMD_MANIFEST}" ]]; then
  while IFS= read -r fname; do
    rm -f "${CLAUDE_DIR}/commands/${fname}"
  done < "${CLAUDE_CMD_MANIFEST}"
  rm -f "${CLAUDE_CMD_MANIFEST}"
fi

# Write manifests for every generated prompt artifact
CLAUDE_PROMPT_MANAGED="${CLAUDE_DIR}/skills/${MANAGED_PROMPTS}"
CODEX_PROMPT_MANAGED="${CODEX_DIR}/skills/${MANAGED_PROMPTS}"
COPILOT_PROMPT_MANAGED="${COPILOT_DIR}/skills/${MANAGED_PROMPTS}"
GITHUB_PROMPT_MANAGED="${GITHUB_DIR}/skills/${MANAGED_PROMPTS}"
GEMINI_PROMPT_MANAGED="${GEMINI_COMMANDS_DIR}/${MANAGED_PROMPTS}"

if [[ -f "${COPILOT_PROMPT_MANAGED}" ]]; then
  while IFS= read -r dname; do
    [[ -n "${dname}" ]] || continue
    rm -rf "${COPILOT_DIR:?}/skills/${dname}"
  done < "${COPILOT_PROMPT_MANAGED}"
fi

: > "${CLAUDE_PROMPT_MANAGED}"
: > "${CODEX_PROMPT_MANAGED}"
: > "${COPILOT_PROMPT_MANAGED}"
: > "${GITHUB_PROMPT_MANAGED}"

if [[ -f "${GEMINI_PROMPT_MANAGED}" ]]; then
  while IFS= read -r fname; do
    rm -f "${GEMINI_COMMANDS_DIR}/${fname}"
  done < "${GEMINI_PROMPT_MANAGED}"
fi
: > "${GEMINI_PROMPT_MANAGED}"

for source_dir in "${PROMPT_SOURCES[@]}"; do
  for template in "${source_dir}"/*.md; do
    [[ -f "${template}" ]] || continue
    template_basename="$(basename "${template}")"
    template_name="${template_basename%.md}"

    if [[ ! "${template_name}" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ || ${#template_name} -gt 64 ]]; then
      echo "Error: prompt name '${template_name}' must be a valid skill name" >&2
      exit 1
    fi

    description="$(awk '
      NR == 1 && $0 == "---" { in_frontmatter = 1; next }
      in_frontmatter && $0 == "---" { exit }
      in_frontmatter && /^description:[[:space:]]*/ {
        sub(/^description:[[:space:]]*/, "")
        print
        exit
      }
    ' "${template}")"
    if [[ -z "${description}" ]]; then
      echo "Error: prompt '${template}' needs a one-line description" >&2
      exit 1
    fi

    # Pi: copy as-is (canonical format, 1-based args)
    cp "${template}" "${PI_PROMPTS_DIR}/${template_basename}"
    echo "${template_basename}" >> "${PI_MANAGED}"

    # Claude Code: manual-only skill with zero-based positional arguments
    skill_dir="${CLAUDE_DIR}/skills/${template_name}"
    if [[ -e "${skill_dir}" || -L "${skill_dir}" ]] && ! grep -Fxq "${template_name}" "${CLAUDE_PROMPT_MANAGED}"; then
      echo "Error: prompt '${template_name}' conflicts with an unmanaged Claude skill" >&2
      exit 1
    fi
    rm -rf "${skill_dir}"
    mkdir -p "${skill_dir}"
    PROMPT_SKILL_NAME="${template_name}" perl -pe '
      BEGIN { $in_fm = 0; $fm_done = 0 }
      if (/^---\s*$/ && !$fm_done) {
        if (!$in_fm) {
          $in_fm = 1;
          $_ = "---\nname: $ENV{PROMPT_SKILL_NAME}\n";
        } else {
          $in_fm = 0;
          $fm_done = 1;
          $_ = "disable-model-invocation: true\n---\n";
        }
      } elsif ($fm_done) {
        s/\$\{\@:(\d+):(\d+)\}/"the next $2 invocation arguments starting at position $1 (from `\$ARGUMENTS`)"/ge;
        s/\$\{\@:(\d+)\}/"the invocation arguments starting at position $1 (from `\$ARGUMENTS`)"/ge;
        s/\$(\d+)/"\$" . ($1-1)/ge;
        s/\$\@/\$ARGUMENTS/g;
      }
    ' "${template}" > "${skill_dir}/SKILL.md"
    echo "${template_name}" >> "${CLAUDE_PROMPT_MANAGED}"

    # GitHub Copilot: manual-only skill; invocation text arrives as user context
    skill_dir="${GITHUB_DIR}/skills/${template_name}"
    if [[ -e "${skill_dir}" || -L "${skill_dir}" ]] && ! grep -Fxq "${template_name}" "${GITHUB_PROMPT_MANAGED}"; then
      echo "Error: prompt '${template_name}' conflicts with an unmanaged GitHub Copilot skill" >&2
      exit 1
    fi
    rm -rf "${skill_dir}"
    mkdir -p "${skill_dir}"
    PROMPT_SKILL_NAME="${template_name}" perl -pe '
      BEGIN { $in_fm = 0; $fm_done = 0 }
      if (/^---\s*$/ && !$fm_done) {
        if (!$in_fm) {
          $in_fm = 1;
          $_ = "---\nname: $ENV{PROMPT_SKILL_NAME}\n";
        } else {
          $in_fm = 0;
          $fm_done = 1;
          $_ = "disable-model-invocation: true\nuser-invocable: true\n---\n\nInvocation arguments are supplied as trailing user context. In the template below, interpret `\$1` as the first argument, `\$2` as the second, `\$@` or `\$ARGUMENTS` as all arguments, and `\${\@:N}` as arguments starting at position N.\n";
        }
      }
    ' "${template}" > "${skill_dir}/SKILL.md"
    echo "${template_name}" >> "${GITHUB_PROMPT_MANAGED}"

    # Personal Copilot skills use ~/.copilot/skills; keep ~/.github/skills as a mirror
    skill_dir="${COPILOT_DIR}/skills/${template_name}"
    if [[ -e "${skill_dir}" || -L "${skill_dir}" ]] && ! grep -Fxq "${template_name}" "${COPILOT_PROMPT_MANAGED}"; then
      echo "Error: prompt '${template_name}' conflicts with an unmanaged personal Copilot skill" >&2
      exit 1
    fi
    rm -rf "${skill_dir}"
    mkdir -p "${skill_dir}"
    cp "${GITHUB_DIR}/skills/${template_name}/SKILL.md" "${skill_dir}/SKILL.md"
    echo "${template_name}" >> "${COPILOT_PROMPT_MANAGED}"

    # Codex: explicit-only skill with product-specific invocation policy
    skill_dir="${CODEX_DIR}/skills/${template_name}"
    if [[ -e "${skill_dir}" || -L "${skill_dir}" ]] && ! grep -Fxq "${template_name}" "${CODEX_PROMPT_MANAGED}"; then
      echo "Error: prompt '${template_name}' conflicts with an unmanaged Codex skill" >&2
      exit 1
    fi
    rm -rf "${skill_dir}"
    mkdir -p "${skill_dir}/agents"
    PROMPT_SKILL_NAME="${template_name}" perl -pe '
      BEGIN { $in_fm = 0; $fm_done = 0 }
      if (/^---\s*$/ && !$fm_done) {
        if (!$in_fm) {
          $in_fm = 1;
          $_ = "---\nname: $ENV{PROMPT_SKILL_NAME}\n";
        } else {
          $in_fm = 0;
          $fm_done = 1;
          $_ = "---\n\nInvocation arguments are supplied with the explicit skill mention. In the template below, interpret `\$1` as the first argument, `\$2` as the second, `\$@` or `\$ARGUMENTS` as all arguments, and `\${\@:N}` as arguments starting at position N.\n";
        }
      }
    ' "${template}" > "${skill_dir}/SKILL.md"
    printf 'policy:\n  allow_implicit_invocation: false\n' > "${skill_dir}/agents/openai.yaml"
    echo "${template_name}" >> "${CODEX_PROMPT_MANAGED}"

    # Gemini: native custom command with explicit full-argument injection
    command_filename="${template_name}.toml"
    command_file="${GEMINI_COMMANDS_DIR}/${command_filename}"
    if [[ -e "${command_file}" ]] && ! grep -Fxq "${command_filename}" "${GEMINI_PROMPT_MANAGED}"; then
      echo "Error: prompt '${template_name}' conflicts with an unmanaged Gemini command" >&2
      exit 1
    fi
    escaped_description="$(printf '%s' "${description}" | perl -pe 's/\\/\\\\/g; s/"/\\"/g')"
    if perl -0ne 'exit(index($_, "\x27\x27\x27") >= 0 ? 0 : 1)' "${template}"; then
      echo "Error: prompt '${template}' contains a TOML multiline literal delimiter" >&2
      exit 1
    fi
    {
      printf 'description = "%s"\n' "${escaped_description}"
      printf "prompt = '''\n"
      printf 'Invocation arguments: {{args}}\n\n'
      printf '%s\n\n' "In the template below, interpret \`\$1\` as the first argument, \`\$2\` as the second, \`\$@\` or \`\$ARGUMENTS\` as all arguments, and \`\${@:N}\` as arguments starting at position N."
      perl -ne '
        if (/^---\s*$/ && !$frontmatter_done) {
          if ($in_frontmatter) {
            $frontmatter_done = 1;
          } else {
            $in_frontmatter = 1;
          }
          next;
        }
        if ($frontmatter_done) {
          s/\$ARGUMENTS|\$\@/{{args}}/g;
          print;
        }
      ' "${template}"
      printf "'''\n"
    } > "${command_file}"
    echo "${command_filename}" >> "${GEMINI_PROMPT_MANAGED}"
  done
done

# --- Symlink Pi extensions ---
PI_EXTENSIONS_DIR="${PI_DIR}/extensions"
PI_EXTENSIONS_MANAGED="${PI_EXTENSIONS_DIR}/.sync-managed-extensions"
mkdir -p "${PI_EXTENSIONS_DIR}"

if [[ -f "${PI_EXTENSIONS_MANAGED}" ]]; then
  while IFS= read -r extension_name; do
    [[ -n "${extension_name}" ]] || continue
    rm -rf "${PI_EXTENSIONS_DIR:?}/${extension_name}"
  done < "${PI_EXTENSIONS_MANAGED}"
fi
: > "${PI_EXTENSIONS_MANAGED}"

for source_dir in "${PI_EXTENSION_SOURCES[@]}"; do
  [[ -d "${source_dir}" ]] || continue

  for extension in "${source_dir}"/*; do
    [[ -f "${extension}" || -d "${extension}" ]] || continue
    extension_name="$(basename "${extension}")"
    target="${PI_EXTENSIONS_DIR}/${extension_name}"
    rm -rf "${target}"
    ln -s "${extension}" "${target}"
    echo "${extension_name}" >> "${PI_EXTENSIONS_MANAGED}"
  done
done

echo "Synced skills from ${#SKILL_SOURCES[@]} source(s), prompts from ${#PROMPT_SOURCES[@]} source(s), Pi extensions from ${#PI_EXTENSION_SOURCES[@]} source(s)"
echo "Run 'cd ~/.agents && git add -A && git status' to review changes"
