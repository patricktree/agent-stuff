# connect-chrome-profile SPEC

## Purpose

Provide a small argument-driven workflow for connecting `agent-browser` over CDP to a Chrome user data directory and proving the connection with `agent-browser tab`.

## Runtime Contract

- Requires one argument: a Chrome user data directory path.
- Validates the directory exists before connecting.
- Loads the `agent-browser` skill by name before applying CDP/profile-specific guidance.
- Uses the `agent-browser-cdp` skill as the source of truth for CDP attachment details.
- Attaches to an already-running profile with `agent-browser connect` when `DevToolsActivePort` responds.
- Launches system Chrome with remote debugging in `tmux` only when no responsive running browser is detected.
- Verifies success with `agent-browser tab` and reports `AB_SESSION` plus the CDP port for follow-up calls.

## Maintenance Notes

- Keep the workflow intentionally thin; detailed browser automation guidance belongs in `agent-browser` and CDP/profile-specific guidance belongs in `agent-browser-cdp`.
- Preserve the rule that this workflow must not run `agent-browser install`.
- Update this spec if the skill stops depending on `agent-browser`, stops depending on `agent-browser-cdp`, or changes its verification command.

## Validation

- Structural validation with the skill-writer quick validator.
- Manual trigger review for requests that mention connecting or attaching to a Chrome profile path.
