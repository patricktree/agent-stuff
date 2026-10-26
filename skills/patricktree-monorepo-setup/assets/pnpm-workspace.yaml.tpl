packages:
  - apps/*
  - libs/*
  - qa-utils/*
  - tooling/*
  # Opt in to additional .patricktree-stack projects only when the consuming repo uses them.
  - .patricktree-stack/tooling/config-oxfmt
  - .patricktree-stack/tooling/config-oxlint
  - .patricktree-stack/tooling/config-turbo-typescript
  - .patricktree-stack/tooling/config-typescript
  - .patricktree-stack/tooling/config-vitest
  - .patricktree-stack/tooling/mermaid-check
  - .patricktree-stack/tooling/submodule-check

allowBuilds:
  better-sqlite3: true
  esbuild: true
  msgpackr-extract: true
  protobufjs: true
  unrs-resolver: true

catalog:
  "@typescript/native": "npm:typescript@^7.0.2"
  "@types/node": ^26.6.5
  oxfmt: ^0.74.0
  oxlint: ^1.89.0
  oxlint-tsgolint: ^7.0.2005
  typescript: "npm:@typescript/typescript6@^6.0.2"
  vite: ^8.3.5
  vitest: ^4.1.11

packageExtensions:
  eslint-plugin-react-you-might-not-need-an-effect@1.0.2:
    # "eslint-plugin-react-you-might-not-need-an-effect" defines eslint as peer dependency, but that is not required when used by oxlint --> make it optional
    peerDependenciesMeta:
      eslint:
        optional: true

# handle peer dependencies in a strict way
autoInstallPeers: false
resolvePeersFromWorkspaceRoot: false
strictPeerDependencies: true
dedupePeerDependents: false

# enforce specific Node.js and pnpm version (https://pnpm.io/npmrc#engine-strict)
engineStrict: true

# disable update notifier (https://pnpm.io/npmrc#update-notifier)
updateNotifier: false

# workspace-concurrency=0 will use amount of cores of the host to run tasks concurrently (https://pnpm.io/cli/recursive#--workspace-concurrency)
workspaceConcurrency: 0
