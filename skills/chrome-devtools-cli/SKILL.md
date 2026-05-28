---
name: chrome-devtools-cli
description: CLI to interact with Chrome Devtools (CDP). Use to automate browser tasks, take screenshots, evaluate scripts, or explore page structure, and more. Use standalone (i.e. with new profile) or connect to the user's Chrome ("autoConnect"). Use when you want to automate browser interactions, take screenshots, evaluate scripts, or explore page structure via CDP.
---

# Chrome DevTools CLI

## Setup (once per machine)

Register the server in the home-scoped mcporter config with **headless Chrome** by default:

```bash
npx -y mcporter config add chrome-devtools \
  --command "npx" --arg "-y" --arg "chrome-devtools-mcp@0.26.0" --arg "--headless" \
  --scope home
```

This writes to `~/.mcporter/mcporter.json`. Only needed once.

> **Pin the version!** Always use a specific version (currently `0.26.0`). The `@latest` tag has shipped broken builds in the past (e.g. `0.17.2` was missing its `build/` directory).

Use headless mode (`--headless`) unless you specifically need to see the browser window (e.g. for visual debugging). Headless is faster, uses less resources, and works in environments without a display.

## Fast path: connect to a requested profile

When the user gives a Chrome `userDataDir`, they do **not** need to specify
whether that browser is already running. Auto-detect it first:

1. If `DevToolsActivePort` exists and responds, configure the MCP server with
   `--browserUrl` to attach to the running browser.
2. Otherwise configure the MCP server with `--userDataDir` and let
   `chrome-devtools-mcp` launch that profile.

Do **not** try `--userDataDir` first for a running profile. That attempts to
launch a second Chrome with the same profile and fails with "The browser is
already running".

```bash
USER_DATA_DIR="$HOME/chrome-profiles/layest-agents" # replace with the requested profile
BROWSER_URL=""

if [ -f "$USER_DATA_DIR/DevToolsActivePort" ]; then
  PORT=$(head -n 1 "$USER_DATA_DIR/DevToolsActivePort")
  CANDIDATE_BROWSER_URL="http://127.0.0.1:$PORT"
  if curl -fsS "$CANDIDATE_BROWSER_URL/json/version" >/dev/null; then
    BROWSER_URL="$CANDIDATE_BROWSER_URL"
  fi
fi

MCPORTER_SESSION_DIR=$(mktemp -d -t mcporter-session-XXXXXX)
MCPORTER_CONFIG="$MCPORTER_SESSION_DIR/mcporter.json"
node - <<'NODE' "$MCPORTER_CONFIG" "$USER_DATA_DIR" "$BROWSER_URL"
const fs = require('fs');
const [configPath, userDataDir, browserUrl] = process.argv.slice(2);
const args = browserUrl
  ? ['-y', 'chrome-devtools-mcp@0.26.0', '--browserUrl', browserUrl]
  : ['-y', 'chrome-devtools-mcp@0.26.0', '--userDataDir', userDataDir, '--headless'];

fs.writeFileSync(configPath, JSON.stringify({
  mcpServers: {
    'chrome-devtools': {
      command: 'npx',
      args,
    },
  },
  imports: [],
}, null, 2));
NODE

npx -y mcporter --config "$MCPORTER_CONFIG" daemon start --log
npx -y mcporter --config "$MCPORTER_CONFIG" call chrome-devtools.list_pages
```

## Session lifecycle

Each agent session gets its own isolated daemon and Chrome instance via a
session-scoped config directory. This prevents parallel agents from interfering
with each other (navigating each other's pages, taking wrong screenshots, etc.).

### Start a session

Create a temporary config that points to the global server definition, then
start a daemon scoped to that config:

```bash
MCPORTER_SESSION_DIR=$(mktemp -d -t mcporter-session-XXXXXX)
cp ~/.mcporter/mcporter.json "$MCPORTER_SESSION_DIR/mcporter.json"
MCPORTER_CONFIG="$MCPORTER_SESSION_DIR/mcporter.json"

npx -y mcporter --config "$MCPORTER_CONFIG" daemon start --log
```

**You must pass `--config "$MCPORTER_CONFIG"` on every `mcporter` call for the
rest of this session.** All examples below include it.

### Check status

```bash
npx -y mcporter --config "$MCPORTER_CONFIG" daemon status
```

### Stop and clean up

Always stop the daemon when you are done:

```bash
npx -y mcporter --config "$MCPORTER_CONFIG" daemon stop
rm -rf "$MCPORTER_SESSION_DIR"
```

## Calling tools

With the session daemon running, every call reuses the persistent server.

### Timeout budget for browser actions

Keep Chrome actions fast and bounded:

- Pass `timeout=5000` to any Chrome tool call that supports a timeout.
- Never set a Chrome action timeout above 5 seconds unless the user explicitly asks.
- If a click, navigation, or wait still needs longer, stop after 5 seconds, report what did not become ready, and ask whether to continue.
- For JavaScript-driven clicks via `evaluate_script`, do not add sleeps longer than 5 seconds after the click; prefer `wait_for ... timeout=5000` for the expected UI change.

```bash
# List available tools
npx -y mcporter --config "$MCPORTER_CONFIG" list chrome-devtools

# Open a page
npx -y mcporter --config "$MCPORTER_CONFIG" call chrome-devtools.new_page url=https://example.com

# Take an accessibility snapshot (saves to file)
npx -y mcporter --config "$MCPORTER_CONFIG" call chrome-devtools.take_snapshot filePath=/tmp/snapshot.md

# Select a different tab
npx -y mcporter --config "$MCPORTER_CONFIG" call chrome-devtools.list_pages
npx -y mcporter --config "$MCPORTER_CONFIG" call chrome-devtools.select_page pageId=2

# Wait for text to appear
npx -y mcporter --config "$MCPORTER_CONFIG" call chrome-devtools.wait_for text="Hello" timeout=5000

# Evaluate JS in the page
npx -y mcporter --config "$MCPORTER_CONFIG" call chrome-devtools.evaluate_script 'function=() => document.title'

# Screenshot
npx -y mcporter --config "$MCPORTER_CONFIG" call chrome-devtools.take_screenshot filePath=/tmp/shot.png fullPage=true
```

## Recording video via CDP screencast frames

Use Chrome DevTools Protocol `Page.startScreencast` when you need a short
headless page recording and screenshots are not enough. This records page frames
only; it does **not** capture audio, browser chrome, OS windows, or permission
dialogs.

The bundled `scripts/record-screencast.mjs` script connects to a page CDP target,
acks each `Page.screencastFrame`, writes frames to disk, creates an ffconcat
manifest using CDP frame timestamps, and optionally stitches the frames into an
MP4 with `ffmpeg`.

### Find the CDP endpoint

For a user-managed Chrome launched with a known remote-debugging port, use that
HTTP endpoint directly:

```bash
CDP_ENDPOINT=http://127.0.0.1:9222
```

For a headless Chrome launched by `chrome-devtools-mcp`, read the
`DevToolsActivePort` file from the launched profile:

```bash
PROFILE_DIR=$(pgrep -fa "chrome-devtools-mcp/chrome-profile" \
  | sed -n 's/.*--user-data-dir=\([^ ]*chrome-profile[^ ]*\).*/\1/p' \
  | head -n 1)
PORT=$(head -n 1 "$PROFILE_DIR/DevToolsActivePort")
CDP_ENDPOINT="http://127.0.0.1:$PORT"
```

If multiple headless Chrome instances are running, inspect `pgrep -fa` output and
choose the profile that belongs to this session.

### Record and stitch

Start recording after selecting/navigating the page with `mcporter`:

```bash
node scripts/record-screencast.mjs \
  --endpoint "$CDP_ENDPOINT" \
  --target "example.com" \
  --seconds 12 \
  --frames-dir /tmp/example-cdp-frames \
  --output /tmp/example-cdp-recording.mp4
```

Omit `--seconds` to record until Ctrl-C. Omit `--output` to keep only raw frames,
`frames.json`, and `frames.ffconcat`.

To stitch manually with `ffmpeg`:

```bash
ffmpeg -y \
  -f concat -safe 0 -i /tmp/example-cdp-frames/frames.ffconcat \
  -vf 'scale=trunc(iw/2)*2:trunc(ih/2)*2' \
  -vsync vfr -c:v libx264 -pix_fmt yuv420p -movflags +faststart \
  /tmp/example-cdp-recording.mp4
```

Use the ffconcat manifest instead of `ffmpeg -framerate ... -i frame-%06d.jpg`
when possible: CDP screencast frames are timestamped and may be variable-rate,
especially when the page is idle or headless Chrome throttles rendering.

## Mobile / smartphone testing recipe

Use `emulate` to switch to a touch + mobile viewport and UA:

```bash
npx -y mcporter --config "$MCPORTER_CONFIG" call chrome-devtools.emulate \
  viewport='{"width":390,"height":844,"deviceScaleFactor":3,"isMobile":true,"hasTouch":true}' \
  userAgent='Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
```

Verify the page sees mobile-like input capabilities:

```bash
npx -y mcporter --config "$MCPORTER_CONFIG" call chrome-devtools.evaluate_script 'function=() => ({
  innerWidth: window.innerWidth,
  innerHeight: window.innerHeight,
  coarse: window.matchMedia("(pointer: coarse)").matches,
  hoverNone: window.matchMedia("(hover: none)").matches,
  ua: navigator.userAgent,
})'
```

Then reload and capture screenshots:

```bash
npx -y mcporter --config "$MCPORTER_CONFIG" call chrome-devtools.navigate_page type=reload ignoreCache=true timeout=5000
npx -y mcporter --config "$MCPORTER_CONFIG" call chrome-devtools.take_screenshot filePath=/tmp/mobile-before.png
```

## Interacting with Shadow DOM UIs

For apps that render controls inside a shadow root (e.g. `<pi-web-app>`), `evaluate_script` is often the easiest way to set input and click buttons:

```bash
npx -y mcporter --config "$MCPORTER_CONFIG" call chrome-devtools.evaluate_script 'function=() => {
  const app = document.querySelector("pi-web-app");
  const root = app?.shadowRoot;
  const prompt = root?.getElementById("prompt");
  const send = root?.getElementById("send-btn");
  if (!prompt || !send) return "no-controls";
  prompt.value = "Hi";
  prompt.dispatchEvent(new Event("input", { bubbles: true }));
  send.click();
  return "sent";
}'
```

After sending, wait and capture:

```bash
npx -y mcporter --config "$MCPORTER_CONFIG" call chrome-devtools.wait_for text="Done" timeout=5000
npx -y mcporter --config "$MCPORTER_CONFIG" call chrome-devtools.take_screenshot filePath=/tmp/mobile-after.png
npx -y mcporter --config "$MCPORTER_CONFIG" call chrome-devtools.list_console_messages includePreservedMessages=true
```

## Notes

- The daemon launches a **headless standalone Chrome** by default — no window, no dialogs.
- Each `--config` path produces a separate daemon (unique socket), so parallel sessions are fully isolated.
- After changing the global config (e.g. adding `--headless`), you must kill any existing Chrome and restart the daemon:
  `pkill -f "chrome-devtools-mcp/chrome-profile"` then restart with `daemon restart --log`.
- If the user asks to connect to their **own Chrome**, re-add with `--arg "--autoConnect"`.
  This requires Chrome 144+ with remote debugging enabled via `chrome://inspect/#remote-debugging`.
  Each new daemon start may trigger one permission dialog.

## Cleaning up orphaned processes

If a session ended without running `daemon stop` (e.g. agent crash, timeout),
the daemon and Chrome processes keep running. To find and kill them:

```bash
# List orphaned mcporter daemons
pgrep -fa mcporter

# List orphaned Chrome instances launched by chrome-devtools-mcp
pgrep -fa "chrome-devtools-mcp/chrome-profile"

# Kill all orphaned mcporter daemons
pkill -f "mcporter.*daemon"

# Kill all orphaned Chrome instances from chrome-devtools-mcp
pkill -f "chrome-devtools-mcp/chrome-profile"

# Remove leftover session config directories
rm -rf /tmp/mcporter-session-*
```
