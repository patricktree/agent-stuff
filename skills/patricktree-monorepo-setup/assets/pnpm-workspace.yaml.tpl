packages:
  - apps/*
  - libs/*
  - qa-utils/*
  - tooling/*
  # Opt in to additional .patricktree-stack projects only when the consuming repo uses them.
  - .patricktree-stack/tooling/config-oxfmt

allowBuilds:
  better-sqlite3: true
  esbuild: true
  msgpackr-extract: true
  protobufjs: true
  unrs-resolver: true

catalog:
  oxfmt: ^0.58.0
  oxlint: ^1.72.0
  oxlint-tsgolint: ^7.0.2001

packageExtensions:
  eslint-plugin-react-you-might-not-need-an-effect@1.0.1:
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
