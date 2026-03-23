---
name: pnpm
description: "pnpm workspace and package-manager configuration. Use when setting up pnpm, configuring packageManager or engines.pnpm, editing pnpm-workspace.yaml, enabling Corepack, or replacing npx with pnpm dlx."
---

# pnpm

## Package Manager Setup

- Use **pnpm** with Corepack.
- Use `pnpm dlx` instead of `npx` to run one-off packages (for example `pnpm dlx create-next-app`).
- Set `package.json#packageManager` and `package.json#engines.pnpm` to the latest pnpm version.

Find the latest pnpm version via `npm view pnpm version`.

```json
{
  "packageManager": "pnpm@<latest-version>",
  "engines": {
    "pnpm": "<latest-version>"
  }
}
```

Enable Corepack:

```bash
corepack enable
pnpm --version # must print the latest version
```

## `pnpm-workspace.yaml`

Create or update `pnpm-workspace.yaml` with these settings:

```yaml
# enforce specific Node.js and pnpm version (https://pnpm.io/npmrc#engine-strict)
engineStrict: true

# handle peer dependencies in a strict way
autoInstallPeers: false
dedupePeerDependents: false
strictPeerDependencies: true
resolvePeersFromWorkspaceRoot: false

# https://pnpm.io/npmrc#update-notifier
updateNotifier: false

# workspace-concurrency=0 will use amount of cores of the host to run tasks concurrently (see https://pnpm.io/cli/recursive#--workspace-concurrency)
workspaceConcurrency: 0
```
