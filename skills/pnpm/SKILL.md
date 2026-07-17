---
name: pnpm
description: "pnpm workspace and package-manager configuration. Use when setting up pnpm, checking pnpm availability, configuring packageManager or engines.pnpm, editing pnpm-workspace.yaml, or replacing npx with pnpm dlx."
---

# pnpm

## Package Manager Setup

- Use **pnpm**.
- Before running `pnpm` commands, check whether `pnpm` is available with `command -v pnpm`.
- If `pnpm` is unavailable, stop and tell the developer to install it globally with `curl -fsSL https://get.pnpm.io/install.sh | sh -`; do not run the installer yourself.
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

Check local pnpm availability:

```bash
command -v pnpm
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
