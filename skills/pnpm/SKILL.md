---
name: pnpm
description: "pnpm workspace and package-manager configuration. Use when setting up pnpm, checking pnpm availability, configuring packageManager or engines.pnpm, editing pnpm-workspace.yaml, or replacing npx with pnpm dlx."
---

# pnpm

## Package Manager Setup

- Before running `pnpm` commands, check whether `pnpm` is available with `command -v pnpm`.
- If `pnpm` is unavailable, stop and tell the developer to install it globally with `curl -fsSL https://get.pnpm.io/install.sh | sh -`; do not run the installer yourself.
- Use `pnpm dlx` instead of `npx` to run one-off packages (for example `pnpm dlx create-next-app`).
- Pin the exact latest pnpm version (`npm view pnpm version`) in both `package.json#packageManager` and `package.json#engines.pnpm`.
- Pin Node.js with `package.json#devEngines.runtime`, a caret range on the latest Node.js LTS version (from <https://nodejs.org/dist/index.json>) with `"onFail": "download"`, so pnpm installs that Node.js and runs scripts with it.

```json
{
  "devEngines": {
    "runtime": {
      "name": "node",
      "version": "^<latest-node-lts-version>",
      "onFail": "download"
    }
  },
  "engines": {
    "pnpm": "<latest-pnpm-version>"
  },
  "packageManager": "pnpm@<latest-pnpm-version>"
}
```

## `pnpm-workspace.yaml`

Create or update `pnpm-workspace.yaml` with these settings:

```yaml
# enforce specific Node.js and pnpm version (https://pnpm.io/settings/cli#enginestrict)
engineStrict: true

# handle peer dependencies in a strict way
autoInstallPeers: false
dedupePeerDependents: false
strictPeerDependencies: true
resolvePeersFromWorkspaceRoot: false

# https://pnpm.io/settings/other#updatenotifier
updateNotifier: false

# workspace-concurrency=0 will use amount of cores of the host to run tasks concurrently (see https://pnpm.io/cli/recursive#--workspace-concurrency)
workspaceConcurrency: 0
```
