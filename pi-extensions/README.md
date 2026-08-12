# Pi extensions

Canonical source files for personal Pi extensions.

These files are symlinked into Pi's auto-discovery directory by `sync-with-agents.sh`:

```sh
~/workspace/agent-stuff/sync-with-agents.sh ~/workspace/agent-stuff-visibility-private ~/workspace/agent-stuff-device-macbook
```

Pi loads extensions from:

```text
~/.pi/agent/extensions/
```

## Extensions

### `tmux-window-status.ts`

Automatically renames the current tmux window when Pi is running inside tmux.

Window title format:

```text
<status> <label>
```

Statuses:

- `🟢` waiting for user input
- `🟡` busy processing a user request

Behavior:

- Only runs when `$TMUX` and `$TMUX_PANE` are present.
- Pins every command to Pi's startup pane so another active tmux window cannot be renamed.
- Silently no-ops if `tmux` is unavailable or a rename command fails.
- Captures the original tmux window name and `automatic-rename` option on session start.
- Disables tmux `automatic-rename` for the current window while Pi runs.
- Restores the original tmux window name and `automatic-rename` option when Pi quits.
- Uses the Pi session name as the label.
- If the session has no name yet, generates a label from the first non-command user input and stores it via `pi.setSessionName(...)`.

Example titles:

```text
🟢 pi
🟡 Load dump into Postgres conta...
🟢 Load dump into Postgres conta...
```
