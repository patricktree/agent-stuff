---
name: pbcopy-pipe
description: Use when the user asks to copy text to the macOS clipboard, pipe something into pbcopy, "pbcopy this", "copy to clipboard", or wants the previous/next response placed on the clipboard.
---

# Pbcopy Pipe

Use `pbcopy` through a shell pipe when the user asks to copy generated text to the clipboard.

## Flow

1. Decide the exact text to copy.
2. Pipe it to `pbcopy` with a quoted here-document:

```sh
cat <<'EOF' | pbcopy
text to copy
EOF
```

3. If the user asks to copy a subset of a previous answer, copy only that subset.
4. Reply briefly, e.g. `Copied to clipboard.`

## Rules

- Use `cat <<'EOF' | pbcopy` for multi-line text; it preserves formatting and avoids shell interpolation.
- Do not add extra commentary, Markdown fences, or surrounding quotes unless the user asked for them to be copied.
- If the text itself contains a line that is exactly `EOF`, choose a different delimiter such as `PB_COPY_EOF`.
- For generated content, copy the final polished version, not analysis notes or tool output.
- If `pbcopy` is unavailable, say so and provide the exact text in the response instead.
