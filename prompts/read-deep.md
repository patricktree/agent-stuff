---
description: Deep read a path (default CWD), with optional exclusions
---

Deep read everything in `$1` except

- `.git`
- `.gitignore`'d contents

Additional exclusions: ${@:2}

If additional exclusions are specified (the text after "Additional exclusions:" is non-empty), parse them: skip the word "except" if present, then treat the remaining comma-or-space-separated items as directory/file paths to also exclude.

If no path was given (i.e. `$1` is empty or "CWD"), use the CWD.

Regardless of how big the directory and its contents are.

DO NOT ASK.  
DO NOT return any message to the user, just read into context.
