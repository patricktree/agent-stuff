import assert from "node:assert/strict";
import childProcess from "node:child_process";
import fs from "node:fs";
import fsPromises from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import url from "node:url";

import { buildSetupPlan, deriveNodeMajor, inferScope, validatePnpmVersion } from "./scaffold.mjs";

const SCRIPT_PATH = path.join(path.dirname(url.fileURLToPath(import.meta.url)), "scaffold.mjs");

test("derives the @types/node major from one Node.js major line", () => {
  assert.equal(deriveNodeMajor("^24.18.0"), 24);
  assert.equal(deriveNodeMajor("22.14.0"), 22);
  assert.equal(deriveNodeMajor("v20"), 20);
});

test("rejects a composite Node.js range", () => {
  assert.throws(() => deriveNodeMajor(">=22 <25"), /Unsupported Node\.js version/);
});

test("requires an exact pnpm version", () => {
  assert.doesNotThrow(() => validatePnpmVersion("11.1.0"));
  assert.throws(() => validatePnpmVersion("^11.1.0"), /exact semantic version/);
});

test("infers a normalized scope from the repository directory", () => {
  assert.equal(inferScope("/tmp/PV Analysis"), "pv-analysis");
});

test("plans aligned setup files without mutating the repository", async () => {
  const targetDirectory = await createTemporaryGitRepository("ground-setup-plan-");

  try {
    const plan = await buildSetupPlan({
      nodeVersion: "^24.18.0",
      pnpmVersion: "11.1.0",
      scope: "example-project",
      target: targetDirectory,
    });

    assert.equal(plan.valid, true);
    assert.equal(plan.configuration.typesNodeVersion, "^24");
    assert.equal(fs.existsSync(path.join(targetDirectory, "package.json")), false);
    assert.match(
      plan.renderedFiles.find((file) => file.target === "package.json").content,
      /"packageManager": "pnpm@11\.1\.0"/,
    );
    assert.match(
      plan.renderedFiles.find((file) => file.target === "pnpm-workspace.yaml").content,
      /"@types\/node": \^24/,
    );
  } finally {
    await fsPromises.rm(targetDirectory, { force: true, recursive: true });
  }
});

test("plans only missing gitignore patterns", async () => {
  const targetDirectory = await createTemporaryGitRepository("ground-setup-gitignore-");

  try {
    await fsPromises.writeFile(path.join(targetDirectory, ".gitignore"), "**/node_modules\n");
    const plan = await buildSetupPlan({
      nodeVersion: "^24.18.0",
      pnpmVersion: "11.1.0",
      scope: "example-project",
      target: targetDirectory,
    });

    assert.doesNotMatch(plan.gitignoreInspection.fragmentToAppend, /\*\*\/node_modules/);
    assert.match(plan.gitignoreInspection.fragmentToAppend, /\*\*\/\.DS_Store/);
    assert.match(plan.gitignoreInspection.fragmentToAppend, /\*\*\/dist/);
  } finally {
    await fsPromises.rm(targetDirectory, { force: true, recursive: true });
  }
});

test("reports a conflicting managed file", async () => {
  const targetDirectory = await createTemporaryGitRepository("ground-setup-conflict-");

  try {
    await fsPromises.writeFile(path.join(targetDirectory, "package.json"), "{}\n");
    const result = childProcess.spawnSync(
      process.execPath,
      [
        SCRIPT_PATH,
        "--mode",
        "plan",
        "--target",
        targetDirectory,
        "--node-version",
        "^24.18.0",
        "--pnpm-version",
        "11.1.0",
        "--scope",
        "example-project",
      ],
      { encoding: "utf8" },
    );

    assert.equal(result.status, 2);
    const output = JSON.parse(result.stdout);
    assert.equal(output.valid, false);
    assert.deepEqual(output.conflicts, [
      {
        path: "package.json",
        reason: "Existing managed file differs from the generated baseline.",
      },
    ]);
  } finally {
    await fsPromises.rm(targetDirectory, { force: true, recursive: true });
  }
});

async function createTemporaryGitRepository(prefix) {
  const targetDirectory = await fsPromises.mkdtemp(path.join(os.tmpdir(), prefix));
  const result = childProcess.spawnSync("git", ["init", targetDirectory], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  return targetDirectory;
}
