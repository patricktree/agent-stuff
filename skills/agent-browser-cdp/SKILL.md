---
name: agent-browser-cdp
description: Browser automation via agent-browser attached to an existing Chrome DevTools Protocol endpoint. Use to automate browser interactions, inspect page structure, evaluate scripts, take screenshots, test mobile viewports, or connect to a user-provided Chrome profile/userDataDir without running `agent-browser install`.
---

# agent-browser CDP

Use `agent-browser` as a CDP client for an existing or system-launched Chrome. Do **not** run `agent-browser install`; this workflow never depends on agent-browser's bundled Chrome.

## Operating Rules

- Prefer attaching to an already-running browser with a responsive CDP endpoint.
- Keep each agent isolated with `--session "${AB_SESSION}"` on every command.
- Use refs from `snapshot`/`snapshot -i` for interactions whenever possible.
- Keep browser actions bounded: use the default timeout or set `AGENT_BROWSER_DEFAULT_TIMEOUT=5000` for the shell command. Do not wait longer than 5 seconds unless the user asks.
- Do not run `agent-browser close` against a user-owned browser unless the user explicitly asks; it may close the attached browser/session.
- If `agent-browser` is not installed, use `npx -y agent-browser ...`. Still do **not** run `agent-browser install`.

## Connect to a Requested Chrome Profile

When the user gives a Chrome `userDataDir`, auto-detect a running browser first. If no responsive CDP endpoint exists, launch system Chrome with remote debugging in `tmux` so the shell command does not hang.

```bash
USER_DATA_DIR="${HOME}/chrome-profiles/example" # replace with requested path
AB_SESSION="ab-cdp-$(date +%s)-$$"
AB_CMD=(agent-browser)
if ! command -v agent-browser >/dev/null 2>&1; then
  AB_CMD=(npx -y agent-browser)
fi

if [ ! -d "${USER_DATA_DIR}" ]; then
  echo "Chrome user data dir does not exist: ${USER_DATA_DIR}" >&2
  exit 1
fi

PORT=""
if [ -f "${USER_DATA_DIR}/DevToolsActivePort" ]; then
  CANDIDATE_PORT=$(head -n 1 "${USER_DATA_DIR}/DevToolsActivePort")
  if curl -fsS "http://127.0.0.1:${CANDIDATE_PORT}/json/version" >/dev/null; then
    PORT="${CANDIDATE_PORT}"
  fi
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

Report `AB_SESSION`, `PORT`, whether Chrome was already running or tmux-launched, and any `CHROME_TMUX_SESSION` created.

## Connect to a Known CDP Port

```sh
AB_SESSION="ab-cdp-$(date +%s)-$$"
PORT="9222"
agent-browser --session "${AB_SESSION}" connect "${PORT}"
agent-browser --session "${AB_SESSION}" tab
```

If the endpoint is not local or is a WebSocket URL, pass `--cdp` on each command instead of `connect`:

```sh
CDP_ENDPOINT="ws://host:9222/devtools/browser/..."
AB_SESSION="ab-cdp-$(date +%s)-$$"
agent-browser --session "${AB_SESSION}" --cdp "${CDP_ENDPOINT}" snapshot -i
```

## Common Tasks

```sh
# Navigate or open a tab
agent-browser --session "${AB_SESSION}" open https://example.com
agent-browser --session "${AB_SESSION}" tab new --label docs https://example.com/docs

# Inspect and interact by stable refs
agent-browser --session "${AB_SESSION}" snapshot -i
agent-browser --session "${AB_SESSION}" click @e2
agent-browser --session "${AB_SESSION}" fill @e3 "test@example.com"
agent-browser --session "${AB_SESSION}" wait --text "Welcome"

# Read state
agent-browser --session "${AB_SESSION}" get title
agent-browser --session "${AB_SESSION}" get url
agent-browser --session "${AB_SESSION}" console --json
agent-browser --session "${AB_SESSION}" errors

# Evaluate JavaScript
agent-browser --session "${AB_SESSION}" eval 'document.title'

# Screenshots and PDFs
agent-browser --session "${AB_SESSION}" screenshot /tmp/page.png
agent-browser --session "${AB_SESSION}" screenshot --full /tmp/page-full.png
agent-browser --session "${AB_SESSION}" pdf /tmp/page.pdf
```

## Mobile Viewport Recipe

Use viewport, touch-capable device emulation, then reload and verify what the page sees:

```sh
agent-browser --session "${AB_SESSION}" set device "iPhone 15 Pro"
agent-browser --session "${AB_SESSION}" reload
agent-browser --session "${AB_SESSION}" eval '({
  innerWidth: window.innerWidth,
  innerHeight: window.innerHeight,
  coarse: window.matchMedia("(pointer: coarse)").matches,
  hoverNone: window.matchMedia("(hover: none)").matches,
  ua: navigator.userAgent,
})'
agent-browser --session "${AB_SESSION}" screenshot /tmp/mobile.png
```

## Shadow DOM Recipe

When refs cannot reach a shadow-root control, use `eval` for the specific interaction and then re-snapshot:

```sh
agent-browser --session "${AB_SESSION}" eval '(() => {
  const app = document.querySelector("pi-web-app");
  const root = app?.shadowRoot;
  const prompt = root?.getElementById("prompt");
  const send = root?.getElementById("send-btn");
  if (!prompt || !send) return "no-controls";
  prompt.value = "Hi";
  prompt.dispatchEvent(new Event("input", { bubbles: true }));
  send.click();
  return "sent";
})()'
agent-browser --session "${AB_SESSION}" snapshot -i
```

## Cleanup

- For a user-owned browser: leave Chrome running; report the session details for follow-up.
- For a tmux-launched temporary Chrome: stop it when done with `tmux kill-session -t "${CHROME_TMUX_SESSION}"`.
- If an agent-browser daemon becomes stale, diagnose with `agent-browser doctor --offline --quick`; do not run install as part of cleanup.
