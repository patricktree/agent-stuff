{
  "name": "@{{scope}}/monorepo-root",
  "private": true,
  "files": [
    "./patches/**",
    "./.pnpmfile.cjs",
    "./.pnpmfile.mjs",
    "./pnpm-lock.yaml",
    "./pnpm-workspace.yaml",
    "./postinstall.sh"
  ],
  "type": "module",
  "scripts": {
    "build": "turbo run turbo:build",
    "build:watch": "turbo watch turbo:build",
    "clean": "pnpm run --parallel clean && pnpm exec del-cli \"**/node_modules\" \"**/.turbo\"",
    "declutter": "knip",
    "docs:check": "markdownlint-cli2 && pnpm run docs:check:mermaid",
    "docs:check:mermaid": "mermaid-check",
    "fix": "pnpm run format && pnpm run lint:fix",
    "format": "oxfmt .",
    "format:check": "oxfmt --check .",
    "lint": "turbo run turbo:lint",
    "lint:fix": "turbo run turbo:lint:fix",
    "postinstall": "sh ./postinstall.sh",
    "submodule:check": "submodule-check staged",
    "test": "turbo run turbo:test",
    "validate": "pnpm run validate:fast && pnpm run validate:extended",
    "validate:extended": "pnpm run zizmor",
    "validate:fast": "pnpm run submodule:check && pnpm run format:check && pnpm run docs:check && turbo run turbo:build turbo:lint turbo:test --output-logs=errors-only && pnpm run declutter",
    "zizmor": "uvx zizmor@1.31.1 --gh-token \"$(gh auth token)\" ."
  },
  "devDependencies": {
    "@emnapi/core": "^1.11.3",
    "@emnapi/runtime": "^1.11.3",
    "@patricktree-stack/config-oxfmt": "workspace:*",
    "@patricktree-stack/mermaid-check": "workspace:*",
    "@patricktree-stack/submodule-check": "workspace:*",
    "del-cli": "^8.0.1",
    "eslint-plugin-react-you-might-not-need-an-effect": "^1.0.2",
    "husky": "^9.1.7",
    "knip": "^6.43.0",
    "markdownlint-cli2": "^0.24.0",
    "markdownlint-rule-relative-links": "^5.1.4",
    "oxfmt": "catalog:",
    "oxlint": "catalog:",
    "oxlint-tsgolint": "catalog:",
    "turbo": "^2.11.10"
  },
  "devEngines": {
    "runtime": {
      "name": "node",
      "version": "{{nodeVersion}}",
      "onFail": "download"
    }
  },
  "engines": {
    "pnpm": "{{pnpmVersion}}"
  },
  "packageManager": "pnpm@{{pnpmVersion}}"
}
