# tmux window status

Pi extension that renames the current tmux window so the window list shows whether Pi is waiting for input or busy.

## Title format

```text
<status> <label>
```

Statuses:

- `🟢` Pi is waiting for user input.
- `🟡` Pi is processing a user request or queued follow-up.

Examples:

```text
🟢 pi
🟡 Load dump into Postgres conta...
🟢 Load dump into Postgres conta...
```

## Label behavior

The label is Pi's session name:

1. If the session already has a name, the extension uses it.
2. If the session has no name yet, the extension keeps the fallback label `pi`.
3. On the first non-command user input, the extension asynchronously asks the active Pi model for a concise session title.
4. When the title request finishes, the extension stores it with `pi.setSessionName(...)` and refreshes the tmux title.

The model-generated title is normalized defensively:

- surrounding quotes and punctuation are removed
- whitespace is collapsed
- casing is otherwise kept as returned by the model
- titles longer than 30 visible characters are truncated with `...`

Command inputs such as `/reload`, `/name ...`, `!git status`, and `!!git status` do not trigger title generation.

## tmux behavior

The extension only runs when both `$TMUX` and `$TMUX_PANE` are present. It captures Pi's startup pane and explicitly targets that pane's window for every tmux command:

```sh
tmux rename-window -t "$TMUX_PANE" "🟡 Example title"
```

Pinning the target prevents another active tmux client or window from being renamed while an asynchronous label request is finishing.

On session start it also records the current window name and `automatic-rename` option, then disables tmux automatic renaming for the current window:

```sh
tmux display-message -p "#W"
tmux show-window-options -v automatic-rename
tmux set-window-option automatic-rename off
```

All tmux failures are silently ignored. The extension is UI polish and must never interrupt Pi.

When Pi quits, the extension restores the original tmux window name and `automatic-rename` option if they were captured successfully. If `automatic-rename` was originally enabled, tmux may immediately recompute the name from the shell command after restoration.

## Pi events used

- `session_start`: capture original tmux state, mark waiting, disable tmux automatic rename, refresh title.
- `input`: mark busy, start async label generation if needed.
- `agent_start`: mark busy.
- `agent_end`: mark waiting unless Pi has pending messages.
- `session_info_changed`: refresh title after `/name` or generated session names.
- `session_shutdown`: restore original tmux state when Pi quits.
