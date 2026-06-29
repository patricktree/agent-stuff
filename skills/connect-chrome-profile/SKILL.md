---
name: connect-chrome-profile
description: Connect agent-browser over CDP to a specific Chrome user data directory. Use when the user gives a Chrome profile/userDataDir path and asks to connect, attach, or confirm browser automation access for that profile without running `agent-browser install`.
argument-hint: "<chrome-user-data-dir>"
---

# Connect Chrome Profile

Load the `agent-browser` skill by name first, then connect `agent-browser` over CDP to the Chrome browser for exactly one provided user data directory and verify the connection works. Do **not** run `agent-browser install`.

## Inputs

- Expected argument: one Chrome user data directory path.
- Empty input: ask the user for the Chrome user data directory path; do not guess.
- If the path contains `~`, expand it before use.

## Workflow

1. Load the `agent-browser` skill by name, then load and follow the `agent-browser-cdp` skill, especially its “Connect to a Requested Chrome Profile” workflow.
2. Confirm the provided user data directory exists before connecting.
3. Auto-detect whether that profile is already running:
   - If `${USER_DATA_DIR}/DevToolsActivePort` exists and `curl -fsS "http://127.0.0.1:${PORT}/json/version"` succeeds, attach with `agent-browser --session "${AB_SESSION}" connect "${PORT}"`.
   - Otherwise launch system Chrome with remote debugging in `tmux`, then attach with `agent-browser` after `DevToolsActivePort` responds.
4. Confirm the connection by running `agent-browser --session "${AB_SESSION}" tab`.
5. Report the connection mode, `AB_SESSION`, `PORT`, and the listed/selected page. Keep the browser available for follow-up tasks unless the user asks you to stop it.

## Command Template

```bash
USER_DATA_DIR="/path/to/chrome-user-data-dir"
BROWSER_URL=""

if [ ! -d "${USER_DATA_DIR}" ]; then
  echo "Chrome user data dir does not exist: ${USER_DATA_DIR}" >&2
  exit 1
fi

if [ -f "${USER_DATA_DIR}/DevToolsActivePort" ]; then
  PORT=$(head -n 1 "${USER_DATA_DIR}/DevToolsActivePort")
  CANDIDATE_BROWSER_URL="http://127.0.0.1:${PORT}"
  if curl -fsS "${CANDIDATE_BROWSER_URL}/json/version" >/dev/null; then
    BROWSER_URL="${CANDIDATE_BROWSER_URL}"
  fi
fi

AB_SESSION="ab-cdp-$(date +%s)-$$"
AB_CMD=(agent-browser)
if ! command -v agent-browser >/dev/null 2>&1; then
  AB_CMD=(npx -y agent-browser)
fi

PORT=""
if [ -n "${BROWSER_URL}" ]; then
  PORT="${BROWSER_URL##*:}"
fi

if [ -z "${PORT}" ]; then
  CHROME_BIN="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
  if [ ! -x "${CHROME_BIN}" ]; then
    echo "System Chrome not found. Ask the user to start Chrome with --remote-debugging-port and retry." >&2
    exit 1
  fi

  CHROME_TMUX_SESSION="chrome-cdp-${AB_SESSION}"
  tmux new-session -d -s "${CHROME_TMUX_SESSION}" \
    "\"${CHROME_BIN}\" --remote-debugging-port=0 --user-data-dir=\"${USER_DATA_DIR}\" --headless=new --no-first-run --no-default-browser-check about:blank"

  for _ in 1 2 3 4 5; do
    if [ -f "${USER_DATA_DIR}/DevToolsActivePort" ]; then
      CANDIDATE_PORT=$(head -n 1 "${USER_DATA_DIR}/DevToolsActivePort")
      if curl -fsS "http://127.0.0.1:${CANDIDATE_PORT}/json/version" >/dev/null; then
        PORT="${CANDIDATE_PORT}"
        break
      fi
    fi
    sleep 1
  done
fi

if [ -z "${PORT}" ]; then
  echo "No responsive CDP endpoint found for ${USER_DATA_DIR}" >&2
  exit 1
fi

"${AB_CMD[@]}" --session "${AB_SESSION}" connect "${PORT}"
"${AB_CMD[@]}" --session "${AB_SESSION}" tab
```

## Failure Handling

- If the directory is missing, ask for the correct profile path.
- If `DevToolsActivePort` is present but stale, ignore it and launch system Chrome with remote debugging in `tmux`.
- If `agent-browser connect` or `tab` fails, show the error and run `agent-browser doctor --offline --quick` before deciding whether to retry.
- Do not launch system Chrome first when the running browser’s `DevToolsActivePort` responds; that can fail because Chrome already owns the profile.
- Do not run `agent-browser install`.
