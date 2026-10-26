# patricktree-stack `playwright.config.ts`

For projects on patricktree-stack. Add `"@patricktree-stack/config-playwright": "workspace:*"` to `devDependencies` and build on its `createPlaywrightDockerConfig` (`@patricktree-stack/config-playwright/playwright-docker`). It owns the Docker Playwright Server: server command, port capture, `connectOptions`, snapshot path, workers, and the `PWDEBUG` switch. Read its source for the current options; keep the server command there rather than copying it into the project.

```ts
import { createPlaywrightDockerConfig } from "@patricktree-stack/config-playwright/playwright-docker";
import { defineConfig, devices } from "@playwright/test";

const dockerConfig = createPlaywrightDockerConfig();
const dockerWebServers =
  dockerConfig.webServer === undefined
    ? []
    : Array.isArray(dockerConfig.webServer)
      ? dockerConfig.webServer
      : [dockerConfig.webServer];

export default defineConfig({
  ...dockerConfig,
  testDir: "./tests",
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  use: {
    // Spread the shared `use`; without it `connectOptions` is lost and tests run against local browsers.
    ...dockerConfig.use,
    baseURL: "http://localhost:4173",
  },
  webServer: [
    ...dockerWebServers,
    // App server (adjust command/port to your project)
    { command: "pnpm preview --port 4173 --strict-port", port: 4173 },
  ],
});
```
