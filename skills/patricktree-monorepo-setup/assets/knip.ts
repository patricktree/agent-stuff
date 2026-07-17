import type { KnipConfig } from "knip";

const config: KnipConfig = {
  $schema: "./node_modules/knip/schema.json",
  ignore: [
    /* ignore the patricktree-stack packages themselves, since they are not part of this monorepo */
    ".patricktree-stack/**",
  ],
  workspaces: {
    ".": {
      ignoreDependencies: [
        "husky",
        "@emnapi/core",
        "@emnapi/runtime",
        /* oxlint doesn't resolve dependencies correctly, we need it in the root node_modules */
        "eslint-plugin-react-you-might-not-need-an-effect",
      ],
    },
  },
};

export default config;
