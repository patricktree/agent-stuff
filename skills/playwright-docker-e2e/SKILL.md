---
name: playwright-docker-e2e
description: "Set up Playwright E2E tests using a Docker-based Playwright Server for consistent visual snapshots across machines and CI. Use when adding E2E tests, configuring Playwright with Docker, setting up visual regression testing, or wiring snapshot-stable cross-platform browser testing."
---

# Playwright E2E via Docker Playwright Server

Run Playwright tests against browsers inside a Docker container so visual snapshots are byte-identical across macOS, Linux, and CI.

Reference: <https://patricktree.me/blog/consistent-visual-assertions-via-playwright-server-in-docker>

## Prerequisites

- Docker Desktop with **host networking** enabled (Settings → Resources → Network → "Enable host networking").
- Node.js project with a dev/preview server (e.g. Vite).

## 1. Install

```bash
pnpm add -D @playwright/test
```

Pin the Playwright version — the npm package and Docker image **must** match.

Find the installed version:

```bash
pnpm ls @playwright/test --depth 0
```

## 2. `playwright.config.ts`

Key ideas:

- **Two `webServer` entries** (array form): one for the app server, one for the Docker Playwright Server.
- **Port capture via stdout regex**: the Docker server prints its ws URL; a named capture group injects the port into `process.env`.
- **`PWDEBUG` escape hatch**: when `PWDEBUG=1`, skip Docker server + `connectOptions` so local browsers work for interactive debugging.
- **`snapshotPathTemplate`** uses a fixed `docker` suffix instead of `{platform}` to avoid per-OS baseline directories.

```ts
/* eslint-disable n/no-process-env -- config reads env vars directly */
import { defineConfig, devices } from "@playwright/test";

const PLAYWRIGHT_VERSION = "<version>"; // must match Docker image tag
const PLAYWRIGHT_SERVER_PORT_ENV = "PLAYWRIGHT_SERVER_PORT";

const isDebug = process.env.PWDEBUG === "1";
const isCI = !!process.env.CI;
const useDocker = !isDebug;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  reporter: isCI
    ? [["html", { open: "never" }], ["github"]]
    : [["html", { open: "never" }]],

  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        channel: "chromium",
      },
    },
  ],

  snapshotPathTemplate: `{testDir}/../snapshots/{testFilePath}/{arg}-{projectName}-${
    useDocker ? "docker" : "{platform}"
  }{ext}`,

  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.03,
    },
  },

  use: {
    baseURL: "http://localhost:4173",
    trace: "on-first-retry",

    connectOptions: useDocker
      ? {
          wsEndpoint: `ws://127.0.0.1:${
            process.env[PLAYWRIGHT_SERVER_PORT_ENV] ?? ""
          }/`,
        }
      : undefined,
  },

  webServer: [
    // App server (adjust command/port to your project)
    {
      command: "pnpm preview --port 4173 --strict-port",
      port: 4173,
      reuseExistingServer: !isCI,
    },
    // Docker Playwright Server (skipped when PWDEBUG=1)
    ...(useDocker
      ? [
          {
            command: `docker run --rm --init --workdir /home/pwuser --user pwuser --network host mcr.microsoft.com/playwright:v${PLAYWRIGHT_VERSION}-noble /bin/sh -c "npx -y playwright@${PLAYWRIGHT_VERSION} run-server --host 0.0.0.0"`,
            wait: {
              stdout: new RegExp(
                String.raw`Listening on ws:\/\/0\.0\.0\.0:(?<${PLAYWRIGHT_SERVER_PORT_ENV}>\d+)`,
              ),
            },
            stdout: "pipe" as const,
            stderr: "pipe" as const,
            timeout: 60_000,
            gracefulShutdown: {
              signal: "SIGTERM" as const,
              timeout: 10_000,
            },
            reuseExistingServer: !isCI,
          },
        ]
      : []),
  ],
});
```

### Adapting the config

| What to change     | Where                                                                                  |
| ------------------ | -------------------------------------------------------------------------------------- |
| Playwright version | `PLAYWRIGHT_VERSION` constant — keep in sync with `@playwright/test` in `package.json` |
| App server command | First `webServer` entry — use your dev/preview command and port                        |
| Browser projects   | `projects` array — add Firefox/WebKit if needed                                        |
| Snapshot tolerance | `expect.toHaveScreenshot.maxDiffPixelRatio`                                            |

## 3. TypeScript setup

The config and test files need tsconfig coverage.

**Add `playwright.config.ts` to the node tsconfig** (e.g. `tsconfig.node.json`):

```json
{
  "include": ["playwright.config.ts"]
}
```

**Create `tsconfig.e2e.json`** for test files, use the base metioned in <../typescript-project-setup/SKILL.md> and:

- set `noEmit: true` since Playwright runs tests directly from source
- add `"node"` to `tsconfig.json#compilerOptions.types`

**Reference it from the root tsconfig:**

```json
{
  "references": [
    /* ...other references */
    { "path": "./tsconfig.e2e.json" }
  ]
}
```

## 4. `package.json` scripts

```json
{
  "scripts": {
    "test:e2e": "docker pull mcr.microsoft.com/playwright:v<version>-noble && pnpm build && npx playwright test",
    "test:e2e:update": "docker pull mcr.microsoft.com/playwright:v<version>-noble && pnpm build && npx playwright test --update-snapshots",
    "test:e2e:ui": "PWDEBUG=1 pnpm build && npx playwright test --ui"
  }
}
```

The `docker pull` is a no-op after the first run; it ensures the image is present.

## 5. `.gitignore`

Add Playwright artifacts:

```gitignore
# Playwright
/test-results/
/playwright-report/
/blob-report/
```

**Do commit** the `snapshots/` directory — these are the baseline images.

## 6. Writing tests

Place tests in `tests/`.

### Selector strategy

Prefer **ARIA selectors** (`page.getByRole`, `page.getByLabel`, `page.getByText`) over data-attribute locators. They mirror how assistive technology sees the page, so tests double as accessibility checks.

| Priority | Method | Example |
| --- | --- | --- |
| 1 | `getByRole` | `page.getByRole("main")`, `page.getByRole("complementary", { name: "App sidebar" })` |
| 2 | `getByLabel` / `getByText` | `page.getByLabel("Email")`, `page.getByText("Submit")` |
| 3 | `getByTestId` / data attrs | `page.getByTestId("chart")` — only when no semantic role applies |

When an element lacks a suitable implicit role (e.g. a `<div>` sidebar), improve the component's semantics first (use `<aside>`, `<nav>`, `<main>`, add `aria-label`) instead of reaching for `data-testid`.

### Example smoke test

```ts
import { expect, test } from "@playwright/test";

test.describe("smoke tests", () => {
  test("app loads with main layout", async ({ page }) => {
    await page.goto("/");

    // Sidebar (aside with aria-label) renders
    await expect(
      page.getByRole("complementary", { name: "App sidebar" }),
    ).toBeVisible();

    // Main content area renders
    await expect(page.getByRole("main")).toBeVisible();
  });

  test("visual: homepage", async ({ page }) => {
    await page.goto("/");

    // Wait for layout to settle before screenshot
    await expect(page.getByRole("main")).toBeVisible();

    await expect(page).toHaveScreenshot("homepage.png");
  });
});
```

### Visual snapshot tips

- First run: use `--update-snapshots` to generate baselines.
- Subsequent runs compare against committed baselines.
- `maxDiffPixelRatio: 0.03` tolerates minor anti-aliasing differences.

## 7. Running

```bash
# Full E2E run
pnpm test:e2e

# Update snapshots after intentional visual changes
pnpm test:e2e:update

# Debug with local browser + Playwright UI mode
pnpm test:e2e:ui

# Debug a single test with local browser
PWDEBUG=1 npx playwright test --headed -g "test name"
```

## How it works

1. `playwright test` starts two web servers (array form):
   - **Vite preview** on port 4173 (the app under test).
   - **Docker Playwright Server** — a container running `playwright run-server`, printing its ws URL to stdout.
2. Playwright captures the port from stdout via the named regex group `PLAYWRIGHT_SERVER_PORT`.
3. Tests connect to the Docker browser via `connectOptions.wsEndpoint`.
4. Screenshots render identically regardless of host OS because the browser runs inside Docker (Ubuntu).
5. `PWDEBUG=1` disables the Docker server and `connectOptions`, so Playwright falls back to local browsers for interactive debugging.
