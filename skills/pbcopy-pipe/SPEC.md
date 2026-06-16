# pbcopy-pipe Skill Spec

## Intent

Help agents reliably copy requested text to the macOS clipboard using `pbcopy` without accidentally changing content through shell interpolation or extra wrapping.

## Trigger examples

- "pipe this into pbcopy"
- "copy that to clipboard"
- "pbcopy what you just wrote"
- "put the following text on my clipboard"

## Expected behavior

- Use a single `bash` command that pipes a quoted here-document into `pbcopy`.
- Preserve multi-line formatting exactly.
- Confirm succinctly after the command succeeds.

## Non-goals

- Clipboard history management.
- Cross-platform clipboard abstraction.
- Copying files or binary data.

## Validation

Manual validation is sufficient: inspect `SKILL.md` frontmatter and confirm the runtime example uses `cat <<'EOF' | pbcopy`.
