# Prompt templates as manual-only Agent Skills

Research date: 2026-09-02

## Question

Can this repository replace its agent-specific prompt-template handling with one
portable `SKILL.md` representation using
`disable-model-invocation: true`, as suggested by
[Zeke Sikelianos's survey](https://gist.github.com/zeke/0f654737ec01b20e9bf85d3cc0bc1c14)?

## Conclusion

No, not consistently across the agents currently targeted by
`sync-with-agents.sh`.

`disable-model-invocation: true` provides the desired manual-only behavior in
Claude Code, VS Code's GitHub Copilot integration, and Pi. It is not part of the
Agent Skills standard, however. Codex implements the same policy in
`agents/openai.yaml`, while Gemini CLI has no per-skill manual-only mode.
Argument handling also differs between agents,
so a prompt containing `$1`, `$@`, or `$ARGUMENTS` is not portable merely because
it is wrapped in `SKILL.md`.

The practical design is therefore to retain a canonical source and generate
agent-specific artifacts:

- Claude Code: a skill with `disable-model-invocation: true` and Claude's
  zero-based argument syntax.
- VS Code Copilot and Copilot CLI: a skill with
  `disable-model-invocation: true`; pass trailing command text as context rather
  than relying on portable placeholder expansion. The same behavior is not yet
  established for GitHub's cloud coding agent.
- Codex: a skill plus `agents/openai.yaml` containing
  `policy.allow_implicit_invocation: false`; users invoke it with `$skill-name`.
- Pi: keep native prompt templates for `/name` and their richer one-based
  substitution, unless accepting `/skill:name` and appended arguments is an
  intentional UX and behavior change.
- Gemini CLI: keep or generate a native custom command for a strictly
  manual-only prompt. Skills have `/name` commands, but the same skill remains
  available for model activation because Gemini ignores the field.

## Why the field is not portable

The Agent Skills specification defines `name`, `description`, `license`,
`compatibility`, `metadata`, and experimental `allowed-tools`. It does not define
`disable-model-invocation` or any other invocation-policy field. Clients may add
extensions, but other clients are not required to honor them.

Source: [Agent Skills specification, frontmatter](https://agentskills.io/specification#frontmatter).

## Agent-by-agent findings

| Agent | Manual-only skill mechanism | User invocation | Portable argument substitution? |
| --- | --- | --- | --- |
| Claude Code | `disable-model-invocation: true` in `SKILL.md` | `/name` | No; Claude uses `$0`, `$1`, `$ARGUMENTS`, and `$ARGUMENTS[N]` |
| VS Code Copilot and Copilot CLI | Same field in `SKILL.md` | `/name` | No documented cross-agent placeholder contract; trailing text is additional context |
| OpenAI Codex | `policy.allow_implicit_invocation: false` in `agents/openai.yaml` | `$name` or `/skills` picker | No documented prompt-template placeholder substitution |
| Pi | `disable-model-invocation: true` in `SKILL.md` | `/skill:name` | No; skill arguments are appended, while native prompt templates perform one-based substitution |
| Gemini CLI | No per-skill equivalent | `/name` | No; model can also activate matching skills with consent |

### Claude Code

Claude's official documentation says the field prevents automatic loading while
keeping `/name` available to the user. A manual-only skill's description is also
excluded from model context. Claude explicitly describes the field as a Claude
Code extension rather than part of the cross-client standard.

Claude skill arguments are zero-based: `$0` is the first argument, `$1` the
second, and `$ARGUMENTS` is the full input. This differs from Pi's native prompt
templates.

Sources:

- [Claude Code: control who invokes a skill](https://code.claude.com/docs/en/skills#control-who-invokes-a-skill)
- [Claude Code: available string substitutions](https://code.claude.com/docs/en/skills#available-string-substitutions)
- [Claude Code: using frontmatter outside Claude Code](https://code.claude.com/docs/en/skills#using-skill-frontmatter-outside-claude-code)

### VS Code GitHub Copilot

VS Code documents the same field and semantics: the default skill is both a
slash command and auto-loadable, while `disable-model-invocation: true` leaves
the slash command available but prevents automatic loading. `user-invocable`
independently controls slash-menu visibility.

The documentation promises that text following `/skill-name` is added as
context. It does not specify Claude- or Pi-style positional placeholder
substitution for skills, so templates should not depend on those placeholders
without an agent-specific transform.

VS Code discovers personal skills in `~/.agents/skills/`, so this repository's
central hub is already a supported discovery location.

Source: [VS Code: Agent Skills](https://code.visualstudio.com/docs/agent-customization/agent-skills#_use-skills-as-slash-commands).

GitHub Copilot CLI's first-party changelog separately records support for
`disable-model-invocation` in version 0.0.412 and says it was fully honored in
1.0.74. GitHub's cloud coding-agent documentation describes Agent Skills but
does not document this field, so the field should not be assumed to control
cloud-agent invocation without an integration test or a first-party guarantee.

Sources:

- [GitHub Copilot CLI changelog](https://github.com/github/copilot-cli/blob/main/changelog.md)
- [GitHub: add skills to Copilot coding agent](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/add-skills)

### OpenAI Codex

Official OpenAI documentation defines the equivalent policy in the optional
`agents/openai.yaml` sidecar:

```yaml
policy:
  allow_implicit_invocation: false
```

When false, implicit matching is disabled and explicit invocation still works.
In Codex CLI and the IDE extension, users explicitly invoke a skill through
`/skills` or a `$skill-name` mention. The documented `SKILL.md` example contains
only `name` and `description`; `disable-model-invocation` is not the Codex policy
mechanism.

Source: [OpenAI Docs: Build skills](https://developers.openai.com/codex/skills#optional-metadata).

### Pi

Pi's official documentation implements `disable-model-invocation` with the
desired core semantics: it hides the skill from the system prompt and requires
`/skill:name`. The source parser accepts only the literal YAML boolean `true`,
and the prompt formatter filters such skills from the available-skills block.

Pi skills are not interchangeable with Pi prompt templates:

- Native prompt templates invoke as `/name` and substitute one-based `$1`, `$2`,
  `$@`/`$ARGUMENTS`, defaults, and slices.
- Skills invoke as `/skill:name`; their body is loaded unchanged and trailing
  arguments are appended after it rather than substituted into placeholders.

Sources (Pi commit `96317e5`):

- [Pi skills documentation](https://github.com/badlogic/pi-mono/blob/96317e50b8d6e7f6d0e47fd29122baf1461c00f5/packages/coding-agent/docs/skills.md#frontmatter)
- [Pi prompt-template arguments](https://github.com/badlogic/pi-mono/blob/96317e50b8d6e7f6d0e47fd29122baf1461c00f5/packages/coding-agent/docs/prompt-templates.md#arguments)
- [Pi skill command expansion](https://github.com/badlogic/pi-mono/blob/96317e50b8d6e7f6d0e47fd29122baf1461c00f5/packages/coding-agent/src/core/agent-session.ts#L1350-L1371)
- [Pi model-visibility filter](https://github.com/badlogic/pi-mono/blob/96317e50b8d6e7f6d0e47fd29122baf1461c00f5/packages/coding-agent/src/core/skills.ts#L352-L358)

### Gemini CLI

Gemini CLI discovers `~/.agents/skills/`. Its model can match a description,
call `activate_skill`, and ask the user for activation consent. Current source
also exposes each displayable skill as a `/name` command, which activates the
skill and sends trailing command text as the follow-up prompt.

This does not contradict the tool documentation's statement that users cannot
invoke `activate_skill` manually. Users do not issue a raw tool call: the CLI's
`SkillCommandLoader` turns `/name` into that tool action on their behalf. In the
pinned source, lines 34–40 map every displayable skill to its slash-command
name, and lines 45–53 dispatch `ACTIVATE_SKILL_TOOL_NAME` with the skill name and
trailing text.

Gemini's loader returns only `name` and `description` from frontmatter, and its
built-in skill creator says not to include other fields. Therefore
`disable-model-invocation: true` does not create a manual-only Gemini skill; it
is ignored for loading policy, leaving the skill model-triggerable even though
the user can also invoke it explicitly.

Sources (Gemini CLI commit `4963a44`):

- [Gemini CLI: managing Agent Skills](https://github.com/google-gemini/gemini-cli/blob/4963a4456a886bb6af7dcfb807ad6e3e46ce46fc/docs/cli/using-agent-skills.md)
- [Gemini CLI: raw `activate_skill` calls are not manually invocable](https://github.com/google-gemini/gemini-cli/blob/4963a4456a886bb6af7dcfb807ad6e3e46ce46fc/docs/tools/activate-skill.md#usage)
- [Gemini CLI slash-command adapter for skills](https://github.com/google-gemini/gemini-cli/blob/4963a4456a886bb6af7dcfb807ad6e3e46ce46fc/packages/cli/src/services/SkillCommandLoader.ts#L14-L53)
- [Gemini CLI skill frontmatter parser](https://github.com/google-gemini/gemini-cli/blob/4963a4456a886bb6af7dcfb807ad6e3e46ce46fc/packages/core/src/skills/skillLoader.ts#L41-L51)

## Implication for `agent-stuff`

Converting every canonical prompt into a shared skill directory would improve
file-shape consistency but would not produce consistent behavior. At minimum,
the sync layer still needs:

1. host-specific invocation policy (`SKILL.md` field versus OpenAI sidecar),
2. host-specific invocation UX (`/name`, `/skill:name`, `$name`, or custom
   command), and
3. host-specific argument rendering.

A shared canonical format remains useful, but it should be treated as source
for adapters, not as an artifact that every agent can consume unchanged.
