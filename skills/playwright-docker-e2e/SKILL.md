---
name: playwright-docker-e2e
description: "Set up Playwright E2E tests that run against a Playwright Server in Docker, so screenshot baselines match across macOS, Linux, and CI. Use when adding Playwright or E2E tests, setting up visual regression tests (`toHaveScreenshot`), or fixing screenshots that differ per OS."
---

# Playwright E2E via Docker Playwright Server

Tests run on the host, but the browser runs inside a Docker container (`playwright run-server`), so visual snapshots are byte-identical across macOS, Linux, and CI. `PWDEBUG=1` skips Docker and falls back to local browsers for interactive debugging.

Rationale: <https://patricktree.me/blog/consistent-visual-assertions-via-playwright-server-in-docker>

## Prerequisites

- Docker Desktop with **host networking** enabled (Settings → Resources → Network → "Enable host networking").
- Node.js project with a dev/preview server (e.g. Vite).

## 1. Install

```bash
pnpm add -D @playwright/test
```

The Docker image tag must match the installed `@playwright/test` version. Both config variants read the version from the installed package, so upgrading the dependency is the only step.

## 2. `playwright.config.ts`

Read the config reference for the project's setup and follow it:

- Projects on patricktree-stack (the repository has a `.patricktree-stack` submodule): [`references/patricktree-stack-config.md`](references/patricktree-stack-config.md).
- All other projects: [`references/standalone-config.md`](references/standalone-config.md).

## 3. TypeScript setup

- Add `playwright.config.ts` to the `include` of the Node tsconfig (e.g. `tsconfig.node.json`).
- Create `tsconfig.e2e.json` for `tests/`, extending the base from the `typescript-project-setup` skill, with `noEmit: true` (Playwright runs tests from source) and `"node"` in `compilerOptions.types`.
- Add `{ "path": "./tsconfig.e2e.json" }` to the root tsconfig's `references`.

## 4. `package.json` scripts

```json
{
  "scripts": {
    "test:e2e": "pnpm build && playwright test",
    "test:e2e:update": "pnpm build && playwright test --update-snapshots",
    "test:e2e:ui": "pnpm build && playwright test --ui"
  }
}
```

The server command builds its image on first use, so the scripts need no `docker pull`. UI mode works against the Docker browser; the Inspector does not, so `playwright test --debug` (which sets `PWDEBUG=1`) falls back to local browsers.

## 5. `.gitignore`

Ignore `/test-results/`, `/playwright-report/`, and `/blob-report/`. Commit `snapshots/`: it holds the baseline images. When moving an existing suite to this setup, regenerate all baselines with `pnpm test:e2e:update`; host-rendered baselines will not match.

## 6. Writing tests

Place tests in `tests/`. Locate elements by ARIA role, label, or text (`getByRole`, `getByLabel`, `getByText`) so tests double as accessibility checks. When an element has no suitable role (e.g. a `<div>` sidebar), improve the component's semantics first (`<aside>`, `<nav>`, `<main>`, `aria-label`); use `getByTestId` only when no semantic role applies.

```ts
import { expect, test } from "@playwright/test";

test("visual: homepage", async ({ page }) => {
  await page.goto("/");

  // Wait for layout to settle before the screenshot
  await expect(
    page.getByRole("complementary", { name: "App sidebar" }),
  ).toBeVisible();
  await expect(page.getByRole("main")).toBeVisible();

  await expect(page).toHaveScreenshot("homepage.png");
});
```
