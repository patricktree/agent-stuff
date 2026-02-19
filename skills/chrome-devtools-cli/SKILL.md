---
name: chrome-devtools-cli
description: CLI to interact with Chrome Devtools (CDP). Use to automate browser tasks, take screenshots, evaluate scripts, or explore page structure, and more. Use standalone (i.e. with new profile) or connect to the user's Chrome ("autoConnect"). Use when you want to automate browser interactions, take screenshots, evaluate scripts, or explore page structure via CDP.
---

## Setup (once per machine)

Register the server in the home-scoped mcporter config with **headless Chrome** by default:

```bash
npx -y mcporter config add chrome-devtools \
  --command "npx" --arg "-y" --arg "chrome-devtools-mcp@0.17.1" --arg "--headless" \
  --scope home
```

This writes to `~/.mcporter/mcporter.json`. Only needed once.

> **Pin the version!** Always use a specific version (currently `0.17.1`). The `@latest` tag has shipped broken builds in the past (e.g. `0.17.2` was missing its `build/` directory).

Use headless mode (`--headless`) unless you specifically need to see the browser window (e.g. for visual debugging). Headless is faster, uses less resources, and works in environments without a display.

## Session lifecycle

Start the daemon so chrome-devtools-mcp stays running (single CDP connection → **no repeated permission dialogs**):

```bash
npx -y mcporter daemon start --log
```

Check status / stop:

```bash
npx -y mcporter daemon status
npx -y mcporter daemon stop
```

## Calling tools

With the daemon running, every call reuses the persistent server:

```bash
# List available tools
npx -y mcporter list chrome-devtools

# Open a page
npx -y mcporter call chrome-devtools.new_page url=https://example.com

# Take an accessibility snapshot (saves to file)
npx -y mcporter call chrome-devtools.take_snapshot filePath=/tmp/snapshot.md

# Select a different tab
npx -y mcporter call chrome-devtools.list_pages
npx -y mcporter call chrome-devtools.select_page pageId=2

# Wait for text to appear
npx -y mcporter call chrome-devtools.wait_for text="Hello" timeout=5000

# Evaluate JS in the page
npx -y mcporter call chrome-devtools.evaluate_script 'function=() => document.title'

# Screenshot
npx -y mcporter call chrome-devtools.take_screenshot filePath=/tmp/shot.png fullPage=true
```

## Mobile / smartphone testing recipe

Use `emulate` to switch to a touch + mobile viewport and UA:

```bash
npx -y mcporter call chrome-devtools.emulate \
  viewport='{"width":390,"height":844,"deviceScaleFactor":3,"isMobile":true,"hasTouch":true}' \
  userAgent='Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
```

Verify the page sees mobile-like input capabilities:

```bash
npx -y mcporter call chrome-devtools.evaluate_script 'function=() => ({
  innerWidth: window.innerWidth,
  innerHeight: window.innerHeight,
  coarse: window.matchMedia("(pointer: coarse)").matches,
  hoverNone: window.matchMedia("(hover: none)").matches,
  ua: navigator.userAgent,
})'
```

Then reload and capture screenshots:

```bash
npx -y mcporter call chrome-devtools.navigate_page type=reload ignoreCache=true timeout=10000
npx -y mcporter call chrome-devtools.take_screenshot filePath=/tmp/mobile-before.png
```

## Interacting with Shadow DOM UIs

For apps that render controls inside a shadow root (e.g. `<pi-web-app>`), `evaluate_script` is often the easiest way to set input and click buttons:

```bash
npx -y mcporter call chrome-devtools.evaluate_script 'function=() => {
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
sleep 8
npx -y mcporter call chrome-devtools.take_screenshot filePath=/tmp/mobile-after.png
npx -y mcporter call chrome-devtools.list_console_messages includePreservedMessages=true
```

## Notes

- The daemon launches a **headless standalone Chrome** by default — no window, no dialogs.
- After changing the config (e.g. adding `--headless`), you must kill any existing Chrome and restart the daemon:
  `pkill -f "chrome-devtools-mcp/chrome-profile"` then `npx -y mcporter daemon restart --log`.
- If Chrome from a previous session is still running, use the same kill + restart sequence.
- If the user asks to connect to their **own Chrome**, re-add with `--arg "--autoConnect"`.
  This requires Chrome 144+ with remote debugging enabled via `chrome://inspect/#remote-debugging`.
  Each new daemon start may trigger one permission dialog.
