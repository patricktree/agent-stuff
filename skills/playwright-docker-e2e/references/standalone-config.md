# Standalone `playwright.config.ts`

For projects without `@patricktree-stack/config-playwright`. This mirrors what `createPlaywrightDockerConfig` does in patricktree-stack.

## Key ideas

- **Prebuilt server image**: derive a small image from the stock Playwright image with Playwright preinstalled, build it once per version, and run `playwright run-server` from it. Installing Playwright with `npx` on every start takes 30–130 s inside the container, beyond Playwright's 30 s `webServer` timeout, and longer when several test runs start at once; the prebuilt image starts in about a second.
- **Two `webServer` entries** (array form): one for the app server, one for the Docker Playwright Server.
- **Port capture via stdout regex**: the Docker server prints its ws URL; a named capture group injects the port into `process.env`, which `connectOptions.wsEndpoint` reads.
- **`PWDEBUG` escape hatch**: when `PWDEBUG=1`, skip the Docker server and `connectOptions` so local browsers work for interactive debugging.
- **`snapshotPathTemplate`** uses a fixed `docker` suffix instead of `{platform}` to avoid per-OS baseline directories.

## Config

```ts
/* eslint-disable n/no-process-env -- config reads env vars directly */
import { defineConfig, devices } from "@playwright/test";
import module from "node:module";

const PLAYWRIGHT_SERVER_PORT_ENV = "PLAYWRIGHT_SERVER_PORT";
const SERVER_IMAGE_NAME = "<project>/playwright-server";

const isDebug = process.env.PWDEBUG === "1";
const isCI = !!process.env.CI;
const useDocker = !isDebug;

// The Docker image tag must match the installed @playwright/test version.
const { version: playwrightVersion } = module.createRequire(import.meta.url)(
  "@playwright/test/package.json",
) as { version: string };

function createPlaywrightServerCommand(version: string): string {
  const serverImage = `${SERVER_IMAGE_NAME}:v${version}`;
  const dockerfileLines = [
    `FROM mcr.microsoft.com/playwright:v${version}-noble`,
    "WORKDIR /opt/playwright-server",
    `RUN npm install --no-audit --no-fund playwright@${version}`,
  ];
  const buildServerImage = `printf '%s\\n' ${dockerfileLines.map((line) => `'${line}'`).join(" ")} | docker build --quiet --tag ${serverImage} -`;

  // Build the image only when it is missing; concurrent first runs build identical images.
  return [
    `{ docker image inspect ${serverImage} >/dev/null 2>&1 || ${buildServerImage}; }`,
    `docker run --rm --init --user pwuser --network host ${serverImage} ./node_modules/.bin/playwright run-server --host 0.0.0.0`,
  ].join(" && ");
}

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
            command: createPlaywrightServerCommand(playwrightVersion),
            wait: {
              stdout: new RegExp(
                String.raw`Listening on ws:\/\/0\.0\.0\.0:(?<${PLAYWRIGHT_SERVER_PORT_ENV}>\d+)`,
              ),
            },
            stdout: "pipe" as const,
            stderr: "pipe" as const,
            // The first run on a machine builds the server image.
            timeout: 120_000,
            gracefulShutdown: {
              signal: "SIGTERM" as const,
              timeout: 10_000,
            },
            // Each run starts its own server; the port is only known from this server's stdout.
            reuseExistingServer: false,
          },
        ]
      : []),
  ],
});
```

## Adapting the config

| What to change     | Where                                                           |
| ------------------ | --------------------------------------------------------------- |
| Server image name  | `SERVER_IMAGE_NAME`: replace `<project>` with the project name  |
| App server command | First `webServer` entry: use your dev/preview command and port  |
| Browser projects   | `projects` array: add Firefox/WebKit if needed                  |
| Snapshot tolerance | `expect.toHaveScreenshot.maxDiffPixelRatio`                     |
