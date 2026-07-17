#!/usr/bin/env node

import childProcess from "node:child_process";
import fs from "node:fs";
import fsPromises from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import url from "node:url";

const PATRICKTREE_STACK = {
  branch: "main",
  path: ".patricktree-stack",
  url: "https://github.com/patricktree/patricktree-stack",
};

const MANAGED_FILES = [
  { asset: "package.json.tpl", target: "package.json", isTemplate: true },
  { asset: "pnpm-workspace.yaml.tpl", target: "pnpm-workspace.yaml", isTemplate: true },
  { asset: "turbo.jsonc", target: "turbo.jsonc" },
  { asset: "postinstall.sh", target: "postinstall.sh", mode: 0o755 },
  { asset: "oxfmt.config.ts.tpl", target: "oxfmt.config.ts", isTemplate: true },
  { asset: "oxlint.config.ts", target: "oxlint.config.ts" },
  { asset: "knip.ts", target: "knip.ts" },
  { asset: "pre-commit", target: ".husky/pre-commit" },
  { asset: "settings.json", target: ".vscode/settings.json" },
];

const SCRIPT_DIRECTORY = path.dirname(url.fileURLToPath(import.meta.url));
const ASSETS_DIRECTORY = path.resolve(SCRIPT_DIRECTORY, "../assets");

export function deriveNodeMajor(nodeVersion) {
  const match = /^(?:\^|~)?v?(\d+)(?:\.\d+){0,2}(?:-[0-9A-Za-z.-]+)?$/.exec(nodeVersion);
  if (match === null) {
    throw new Error(
      `Unsupported Node.js version '${nodeVersion}'. Use one exact major line, for example '^24.18.0'.`,
    );
  }

  const nodeMajor = Number.parseInt(match[1], 10);
  if (!Number.isSafeInteger(nodeMajor) || nodeMajor < 1) {
    throw new Error(`Invalid Node.js major in '${nodeVersion}'.`);
  }

  return nodeMajor;
}

export function validatePnpmVersion(pnpmVersion) {
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(pnpmVersion)) {
    throw new Error(
      `Unsupported pnpm version '${pnpmVersion}'. Use an exact semantic version, for example '11.1.0'.`,
    );
  }
}

export function validateScope(scope) {
  if (!/^[a-z0-9][a-z0-9._-]*$/.test(scope)) {
    throw new Error(
      `Invalid package scope '${scope}'. Use lowercase letters, numbers, periods, underscores, or hyphens.`,
    );
  }
}

export function inferScope(targetDirectory) {
  const inferredScope = path
    .basename(targetDirectory)
    .toLowerCase()
    .replaceAll(/[^a-z0-9._-]+/g, "-")
    .replaceAll(/^[._-]+|[._-]+$/g, "");

  validateScope(inferredScope);
  return inferredScope;
}

function parseArguments(arguments_) {
  const options = {};

  for (let index = 0; index < arguments_.length; index += 1) {
    const argument = arguments_[index];
    if (argument === "--help" || argument === "-h") {
      options.help = true;
      continue;
    }

    if (!["--mode", "--target", "--node-version", "--pnpm-version", "--scope"].includes(argument)) {
      throw new Error(`Unknown argument '${argument}'.`);
    }

    const value = arguments_[index + 1];
    if (value === undefined || value.startsWith("--")) {
      throw new Error(`Missing value for '${argument}'.`);
    }

    options[argument.slice(2)] = value;
    index += 1;
  }

  if (options.help === true) {
    return options;
  }

  for (const requiredOption of ["mode", "target", "node-version", "pnpm-version"]) {
    if (options[requiredOption] === undefined) {
      throw new Error(`Missing required argument '--${requiredOption}'.`);
    }
  }

  if (!["plan", "apply"].includes(options.mode)) {
    throw new Error("'--mode' must be either 'plan' or 'apply'.");
  }

  return options;
}

function printHelp() {
  process.stdout.write(`Usage:
  node scripts/scaffold.mjs --mode <plan|apply> --target <path> \\
    --node-version <single-major-version> --pnpm-version <exact-version> [--scope <scope>]

Examples:
  node scripts/scaffold.mjs --mode plan --target . \\
    --node-version '^24.18.0' --pnpm-version '11.1.0' --scope 'pv-analysis'
`);
}

function runGit(targetDirectory, arguments_, options = {}) {
  return childProcess.spawnSync("git", ["-C", targetDirectory, ...arguments_], {
    encoding: "utf8",
    stdio: options.inherit === true ? "inherit" : "pipe",
  });
}

function runGitChecked(targetDirectory, arguments_, options = {}) {
  const result = runGit(targetDirectory, arguments_, options);
  if (result.status !== 0) {
    const detail = result.stderr?.trim() || result.stdout?.trim() || `exit code ${result.status}`;
    throw new Error(`git ${arguments_.join(" ")} failed: ${detail}`);
  }
  return result.stdout?.trim() ?? "";
}

async function assertTargetIsGitRoot(targetDirectory) {
  const targetStats = await fsPromises.stat(targetDirectory).catch(() => undefined);
  if (targetStats?.isDirectory() !== true) {
    throw new Error(`Target '${targetDirectory}' is not a directory.`);
  }

  const gitRoot = runGitChecked(targetDirectory, ["rev-parse", "--show-toplevel"]);
  const [realTargetDirectory, realGitRoot] = await Promise.all([
    fsPromises.realpath(targetDirectory),
    fsPromises.realpath(gitRoot),
  ]);
  if (realGitRoot !== realTargetDirectory) {
    throw new Error(`Target '${targetDirectory}' is not the Git repository root '${gitRoot}'.`);
  }
}

function renderTemplate(content, replacements) {
  let renderedContent = content;
  for (const [placeholder, replacement] of Object.entries(replacements)) {
    renderedContent = renderedContent.replaceAll(`{{${placeholder}}}`, replacement);
  }
  return renderedContent;
}

async function renderManagedFiles(replacements) {
  return Promise.all(
    MANAGED_FILES.map(async (managedFile) => {
      const assetPath = path.join(ASSETS_DIRECTORY, managedFile.asset);
      const assetContent = await fsPromises.readFile(assetPath, "utf8");
      return {
        ...managedFile,
        content:
          managedFile.isTemplate === true
            ? renderTemplate(assetContent, replacements)
            : assetContent,
      };
    }),
  );
}

async function inspectManagedFiles(targetDirectory, renderedFiles) {
  const actions = [];
  const conflicts = [];

  for (const renderedFile of renderedFiles) {
    const targetPath = path.join(targetDirectory, renderedFile.target);
    const existingContent = await fsPromises.readFile(targetPath, "utf8").catch((error) => {
      if (error.code === "ENOENT") {
        return undefined;
      }
      throw error;
    });

    if (existingContent === undefined) {
      actions.push({ action: "write-file", path: renderedFile.target });
      continue;
    }

    if (existingContent !== renderedFile.content) {
      conflicts.push({
        path: renderedFile.target,
        reason: "Existing managed file differs from the generated baseline.",
      });
      continue;
    }

    if (renderedFile.mode !== undefined) {
      const stats = await fsPromises.stat(targetPath);
      if ((stats.mode & 0o777) !== renderedFile.mode) {
        actions.push({
          action: "chmod",
          mode: renderedFile.mode.toString(8),
          path: renderedFile.target,
        });
      }
    }
  }

  return { actions, conflicts };
}

async function inspectGitignore(targetDirectory) {
  const fragment = await fsPromises.readFile(
    path.join(ASSETS_DIRECTORY, "gitignore.fragment"),
    "utf8",
  );
  const requiredLines = fragment.split("\n").filter((line) => line !== "" && !line.startsWith("#"));
  const gitignorePath = path.join(targetDirectory, ".gitignore");
  const existingContent = await fsPromises.readFile(gitignorePath, "utf8").catch((error) => {
    if (error.code === "ENOENT") {
      return "";
    }
    throw error;
  });
  const existingLines = new Set(existingContent.split("\n"));
  const missingPatterns = requiredLines.filter((line) => !existingLines.has(line));
  const missingPatternSet = new Set(missingPatterns);
  const fragmentToAppend = fragment
    .trim()
    .split("\n\n")
    .map((group) => {
      const lines = group.split("\n");
      const missingLines = lines.filter((line) => missingPatternSet.has(line));
      if (missingLines.length === 0) {
        return undefined;
      }

      const heading = lines.find((line) => line.startsWith("#"));
      return heading === undefined
        ? missingLines.join("\n")
        : [heading, ...missingLines].join("\n");
    })
    .filter((group) => group !== undefined)
    .join("\n\n");

  return {
    action:
      missingPatterns.length === 0
        ? undefined
        : {
            action: "update-gitignore",
            missingPatterns,
            path: ".gitignore",
          },
    existingContent,
    fragmentToAppend: fragmentToAppend === "" ? "" : `${fragmentToAppend}\n`,
  };
}

async function readGitmoduleValue(targetDirectory, key) {
  const gitmodulesPath = path.join(targetDirectory, ".gitmodules");
  if (!fs.existsSync(gitmodulesPath)) {
    return undefined;
  }

  const result = childProcess.spawnSync("git", ["config", "-f", gitmodulesPath, "--get", key], {
    encoding: "utf8",
  });
  if (result.status === 1) {
    return undefined;
  }
  if (result.status !== 0) {
    throw new Error(`Unable to inspect .gitmodules: ${result.stderr.trim()}`);
  }
  return result.stdout.trim();
}

async function inspectSubmodule(targetDirectory) {
  const configuredPath = await readGitmoduleValue(
    targetDirectory,
    `submodule.${PATRICKTREE_STACK.path}.path`,
  );
  const configuredUrl = await readGitmoduleValue(
    targetDirectory,
    `submodule.${PATRICKTREE_STACK.path}.url`,
  );
  const configuredBranch = await readGitmoduleValue(
    targetDirectory,
    `submodule.${PATRICKTREE_STACK.path}.branch`,
  );
  const submodulePath = path.join(targetDirectory, PATRICKTREE_STACK.path);
  const submoduleExists = fs.existsSync(submodulePath);
  const conflicts = [];

  if (configuredPath === undefined) {
    if (submoduleExists) {
      conflicts.push({
        path: PATRICKTREE_STACK.path,
        reason: "Directory exists but is not registered in .gitmodules.",
      });
      return { conflicts };
    }
    return {
      action: {
        action: "add-submodule",
        branch: PATRICKTREE_STACK.branch,
        path: PATRICKTREE_STACK.path,
        url: PATRICKTREE_STACK.url,
      },
      conflicts,
    };
  }

  if (configuredPath !== PATRICKTREE_STACK.path) {
    conflicts.push({
      path: ".gitmodules",
      reason: `Unexpected submodule path '${configuredPath}'.`,
    });
  }
  if (configuredUrl !== PATRICKTREE_STACK.url) {
    conflicts.push({ path: ".gitmodules", reason: `Unexpected submodule URL '${configuredUrl}'.` });
  }
  if (configuredBranch !== PATRICKTREE_STACK.branch) {
    conflicts.push({
      path: ".gitmodules",
      reason: `Unexpected submodule branch '${configuredBranch}'.`,
    });
  }
  if (conflicts.length > 0) {
    return { conflicts };
  }

  const status = runGit(targetDirectory, ["submodule", "status", PATRICKTREE_STACK.path]);
  if (status.status !== 0 || status.stdout.startsWith("-")) {
    return {
      action: { action: "initialize-submodule", path: PATRICKTREE_STACK.path },
      conflicts,
    };
  }

  return { conflicts };
}

export async function buildSetupPlan({ nodeVersion, pnpmVersion, scope, target }) {
  const targetDirectory = path.resolve(target);
  await assertTargetIsGitRoot(targetDirectory);
  const nodeMajor = deriveNodeMajor(nodeVersion);
  validatePnpmVersion(pnpmVersion);
  const resolvedScope = scope ?? inferScope(targetDirectory);
  validateScope(resolvedScope);

  const replacements = {
    nodeMajor: String(nodeMajor),
    nodeVersion,
    pnpmVersion,
    scope: resolvedScope,
  };
  const renderedFiles = await renderManagedFiles(replacements);
  const managedFileInspection = await inspectManagedFiles(targetDirectory, renderedFiles);
  const gitignoreInspection = await inspectGitignore(targetDirectory);
  const submoduleInspection = await inspectSubmodule(targetDirectory);
  const actions = [...managedFileInspection.actions];

  if (gitignoreInspection.action !== undefined) {
    actions.push(gitignoreInspection.action);
  }
  if (submoduleInspection.action !== undefined) {
    actions.unshift(submoduleInspection.action);
  }

  const conflicts = [...managedFileInspection.conflicts, ...submoduleInspection.conflicts];
  return {
    actions,
    configuration: {
      nodeMajor,
      nodeVersion,
      pnpmVersion,
      scope: resolvedScope,
      target: targetDirectory,
      typesNodeVersion: `^${nodeMajor}`,
    },
    conflicts,
    gitignoreInspection,
    renderedFiles,
    valid: conflicts.length === 0,
  };
}

async function applyGitignore(targetDirectory, inspection) {
  if (inspection.action === undefined) {
    return;
  }

  const gitignorePath = path.join(targetDirectory, ".gitignore");
  const separator =
    inspection.existingContent === "" || inspection.existingContent.endsWith("\n\n")
      ? ""
      : inspection.existingContent.endsWith("\n")
        ? "\n"
        : "\n\n";
  await fsPromises.writeFile(
    gitignorePath,
    `${inspection.existingContent}${separator}${inspection.fragmentToAppend}`,
  );
}

async function applySetupPlan(plan) {
  const targetDirectory = plan.configuration.target;
  const submoduleAction = plan.actions.find((action) =>
    ["add-submodule", "initialize-submodule"].includes(action.action),
  );

  if (submoduleAction?.action === "add-submodule") {
    runGitChecked(
      targetDirectory,
      [
        "submodule",
        "add",
        "-b",
        PATRICKTREE_STACK.branch,
        PATRICKTREE_STACK.url,
        PATRICKTREE_STACK.path,
      ],
      { inherit: true },
    );
  } else if (submoduleAction?.action === "initialize-submodule") {
    runGitChecked(targetDirectory, ["submodule", "update", "--init", PATRICKTREE_STACK.path], {
      inherit: true,
    });
  }

  for (const renderedFile of plan.renderedFiles) {
    const targetPath = path.join(targetDirectory, renderedFile.target);
    const existingContent = await fsPromises.readFile(targetPath, "utf8").catch((error) => {
      if (error.code === "ENOENT") {
        return undefined;
      }
      throw error;
    });

    if (existingContent === undefined) {
      await fsPromises.mkdir(path.dirname(targetPath), { recursive: true });
      await fsPromises.writeFile(targetPath, renderedFile.content);
    }
    if (renderedFile.mode !== undefined) {
      await fsPromises.chmod(targetPath, renderedFile.mode);
    }
  }

  await applyGitignore(targetDirectory, plan.gitignoreInspection);
}

function publicPlan(plan, mode) {
  return {
    actions: plan.actions,
    configuration: plan.configuration,
    conflicts: plan.conflicts,
    mode,
    valid: plan.valid,
  };
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  if (options.help === true) {
    printHelp();
    return;
  }

  const plan = await buildSetupPlan({
    nodeVersion: options["node-version"],
    pnpmVersion: options["pnpm-version"],
    scope: options.scope,
    target: options.target,
  });

  if (!plan.valid) {
    process.stdout.write(`${JSON.stringify(publicPlan(plan, options.mode), undefined, 2)}\n`);
    process.exitCode = 2;
    return;
  }

  if (options.mode === "apply") {
    await applySetupPlan(plan);
  }

  process.stdout.write(`${JSON.stringify(publicPlan(plan, options.mode), undefined, 2)}\n`);
}

const isDirectExecution =
  process.argv[1] !== undefined &&
  path.resolve(process.argv[1]) === url.fileURLToPath(import.meta.url);

if (isDirectExecution) {
  main().catch((error) => {
    process.stderr.write(
      `${JSON.stringify({ error: error instanceof Error ? error.message : String(error), valid: false })}\n`,
    );
    process.exitCode = 1;
  });
}
