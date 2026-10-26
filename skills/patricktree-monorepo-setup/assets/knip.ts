import type { KnipConfig } from "knip";

const config: KnipConfig = {
  $schema: "./node_modules/knip/schema.json",
  ignore: [
    /* ignore the patricktree-stack packages themselves, since they are not part of this monorepo */
    ".patricktree-stack/**",
  ],
  workspaces: {
    ".": {
      /* Zizmor is an external validation tool installed through uvx, not a Node dependency */
      ignoreBinaries: ["uvx"],
      ignoreDependencies: ["husky", "@emnapi/core", "@emnapi/runtime"],
    },
  },
};

export default config;
