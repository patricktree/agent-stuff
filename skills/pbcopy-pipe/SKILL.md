---
name: pbcopy-pipe
description: Copy text to the macOS clipboard via `pbcopy`. Use when the user asks to copy or pbcopy text, or to put a previous or upcoming response on the clipboard.
---

# Pbcopy Pipe

## Flow

1. Decide the exact text to copy: the subset the user named, or else the assistant's immediately preceding message. For generated content, take the final version, not analysis notes or tool output.
2. Pipe it verbatim into `pbcopy` through a quoted here-document, which preserves formatting and blocks shell interpolation:

   ```sh
   cat <<'EOF' | pbcopy
   text to copy
   EOF
   ```

   Copy only the text itself; add Markdown fences, quotes, or commentary only when the user asked for them to be copied. If the text contains a line that is exactly `EOF`, use another delimiter such as `PB_COPY_EOF`.

3. Reply briefly, e.g. `Copied to clipboard.` If `pbcopy` is unavailable, say so and give the exact text in the response instead.
