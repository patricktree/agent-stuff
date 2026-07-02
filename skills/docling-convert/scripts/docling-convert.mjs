#!/usr/bin/env node
import childProcess from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const SKILL_ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const DEFAULT_IMAGE = 'agent-docling-convert:2026-07-02';
const DEFAULT_IMAGE_ARCHIVE = path.join(SKILL_ROOT, '.cache', 'docker-images', 'agent-docling-convert-2026-07-02.tar');
const SUPPORTED_EXTENSIONS = new Set(['.pdf', '.docx', '.pptx', '.xlsx']);
const FORMAT_EXTENSIONS = new Map([
  ['md', '.md'],
  ['text', '.txt'],
  ['html', '.html'],
]);

function main() {
  const { options, passthroughArgs } = parseArgs(process.argv.slice(2));
  validateOptions(options);
  ensureDockerAvailable();

  const inputPath = path.resolve(options.input);
  const inputStats = statFile(inputPath);
  if (!inputStats.isFile()) {
    fail(`Input must be a file: ${inputPath}`);
  }

  const extension = path.extname(inputPath).toLowerCase();
  if (!SUPPORTED_EXTENSIONS.has(extension) && !options.force) {
    fail(
      `Unsupported input extension '${extension || '(none)'}'. Supported: ${Array.from(SUPPORTED_EXTENSIONS).join(', ')}. Pass --force to let Docling try it anyway.`,
    );
  }

  const imageName = process.env.DOCLING_DOCKER_IMAGE || DEFAULT_IMAGE;
  ensureImageAvailable(imageName);

  const outputPlan = createOutputPlan({ inputPath, options });
  ensureOutputDoesNotExist(outputPlan, options.overwrite);
  fs.mkdirSync(outputPlan.containerOutputHostDir, { recursive: true });

  const dockerArgs = createDockerArgs({
    imageName,
    inputPath,
    outputPlan,
    options,
    passthroughArgs,
  });

  run('docker', dockerArgs, { stdio: 'inherit' });
  finalizeOutputPlan(outputPlan, options);
  printSummary(outputPlan, options);
}

function parseArgs(args) {
  const options = {
    format: 'md',
    includeJson: false,
    force: false,
    overwrite: false,
  };
  const passthroughIndex = args.indexOf('--');
  const wrapperArgs = passthroughIndex === -1 ? args : args.slice(0, passthroughIndex);
  const passthroughArgs = passthroughIndex === -1 ? [] : args.slice(passthroughIndex + 1);

  for (let index = 0; index < wrapperArgs.length; index += 1) {
    const arg = wrapperArgs[index];
    switch (arg) {
      case '--input':
        options.input = readValue(wrapperArgs, ++index, arg);
        break;
      case '--out-dir':
        options.outDir = readValue(wrapperArgs, ++index, arg);
        break;
      case '--output':
        options.output = readValue(wrapperArgs, ++index, arg);
        break;
      case '--format':
        options.format = readValue(wrapperArgs, ++index, arg);
        break;
      case '--json':
        options.includeJson = true;
        break;
      case '--force':
        options.force = true;
        break;
      case '--overwrite':
        options.overwrite = true;
        break;
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
      default:
        fail(`Unknown argument: ${arg}. Use -- to pass Docling CLI arguments through.`);
    }
  }

  return { options, passthroughArgs };
}

function readValue(args, index, flag) {
  const value = args[index];
  if (!value || value.startsWith('--')) {
    fail(`${flag} requires a value.`);
  }
  return value;
}

function validateOptions(options) {
  if (!options.input) {
    fail('--input is required.');
  }
  if (Boolean(options.outDir) === Boolean(options.output)) {
    fail('Pass exactly one of --out-dir or --output.');
  }
  if (!FORMAT_EXTENSIONS.has(options.format)) {
    fail(`Unsupported --format '${options.format}'. Supported: ${Array.from(FORMAT_EXTENSIONS.keys()).join(', ')}.`);
  }
  if (options.output && path.extname(options.output) !== FORMAT_EXTENSIONS.get(options.format)) {
    fail(`--output must end in '${FORMAT_EXTENSIONS.get(options.format)}' for --format ${options.format}.`);
  }
}

function ensureDockerAvailable() {
  run('docker', ['--version'], { stdio: 'ignore' }, 'Docker is required but was not found on PATH.');
  run('docker', ['info'], { stdio: 'ignore' }, 'Docker is installed but the daemon is not running or is not reachable.');
}

function ensureImageAvailable(imageName) {
  const buildMode = process.env.DOCLING_DOCKER_BUILD || 'missing';
  if (!['never', 'missing', 'always'].includes(buildMode)) {
    fail("DOCLING_DOCKER_BUILD must be one of: never, missing, always.");
  }

  const imageExists = commandSucceeds('docker', ['image', 'inspect', imageName]);
  if (!imageExists && imageName === DEFAULT_IMAGE && fs.existsSync(DEFAULT_IMAGE_ARCHIVE) && buildMode !== 'always') {
    run('docker', ['load', '--input', DEFAULT_IMAGE_ARCHIVE], { stdio: 'inherit' });
    if (commandSucceeds('docker', ['image', 'inspect', imageName])) {
      return;
    }
  }

  const shouldBuildDefaultImage = imageName === DEFAULT_IMAGE && (buildMode === 'always' || (!commandSucceeds('docker', ['image', 'inspect', imageName]) && buildMode === 'missing'));

  if (shouldBuildDefaultImage) {
    run('docker', ['build', '--tag', imageName, SKILL_ROOT], { stdio: 'inherit' });
    saveDefaultImageArchive(imageName);
    return;
  }

  if (imageName === DEFAULT_IMAGE && commandSucceeds('docker', ['image', 'inspect', imageName])) {
    saveDefaultImageArchive(imageName);
    return;
  }

  if (!commandSucceeds('docker', ['image', 'inspect', imageName])) {
    fail(
      `Docker image '${imageName}' is not available. Use the default image so this script can build it, build/pull the image yourself, or set DOCLING_DOCKER_BUILD=missing.`,
    );
  }
}

function saveDefaultImageArchive(imageName) {
  const archiveMode = process.env.DOCLING_DOCKER_ARCHIVE || 'missing';
  if (!['never', 'missing', 'always'].includes(archiveMode)) {
    fail("DOCLING_DOCKER_ARCHIVE must be one of: never, missing, always.");
  }
  if (archiveMode === 'never') {
    return;
  }
  if (archiveMode === 'missing' && fs.existsSync(DEFAULT_IMAGE_ARCHIVE)) {
    return;
  }

  fs.mkdirSync(path.dirname(DEFAULT_IMAGE_ARCHIVE), { recursive: true });
  run('docker', ['save', '--output', DEFAULT_IMAGE_ARCHIVE, imageName], { stdio: 'inherit' });
}

function createOutputPlan({ inputPath, options }) {
  const inputStem = path.basename(inputPath, path.extname(inputPath));
  if (options.outDir) {
    const documentOutputDir = path.resolve(options.outDir, inputStem);
    return {
      mode: 'directory',
      containerOutputHostDir: documentOutputDir,
      finalPrimaryPath: path.join(documentOutputDir, `${inputStem}${FORMAT_EXTENSIONS.get(options.format)}`),
      finalDirectory: documentOutputDir,
    };
  }

  const finalPrimaryPath = path.resolve(options.output);
  const finalDirectory = path.dirname(finalPrimaryPath);
  fs.mkdirSync(finalDirectory, { recursive: true });
  return {
    mode: 'file',
    containerOutputHostDir: fs.mkdtempSync(path.join(finalDirectory, '.docling-convert-')),
    finalPrimaryPath,
    finalDirectory,
  };
}

function ensureOutputDoesNotExist(outputPlan, shouldOverwrite) {
  if (shouldOverwrite) {
    if (outputPlan.mode === 'directory') {
      fs.rmSync(outputPlan.finalDirectory, { recursive: true, force: true });
    } else {
      fs.rmSync(outputPlan.finalPrimaryPath, { force: true });
      fs.rmSync(sidecarPath(outputPlan.finalPrimaryPath, '.json'), { force: true });
      fs.rmSync(artifactPath(outputPlan.finalPrimaryPath), { recursive: true, force: true });
    }
    return;
  }

  const pathsToCheck = outputPlan.mode === 'directory'
    ? [outputPlan.finalDirectory]
    : [outputPlan.finalPrimaryPath, sidecarPath(outputPlan.finalPrimaryPath, '.json'), artifactPath(outputPlan.finalPrimaryPath)];

  for (const candidatePath of pathsToCheck) {
    if (fs.existsSync(candidatePath)) {
      fail(`Output already exists: ${candidatePath}. Pass --overwrite to replace it.`);
    }
  }
}

function createDockerArgs({ imageName, inputPath, outputPlan, options, passthroughArgs }) {
  const inputDir = path.dirname(inputPath);
  const inputBase = path.basename(inputPath);
  const containerInputPath = `/input/${inputBase}`;
  const dockerArgs = [
    'run',
    '--rm',
    '--network', process.env.DOCLING_DOCKER_NETWORK || 'none',
    '--env', 'HOME=/tmp',
    '--env', 'USER=docling',
    '--env', 'TORCHINDUCTOR_CACHE_DIR=/tmp/torchinductor',
    '--env', 'HF_HOME=/tmp/huggingface',
  ];

  const dockerUser = process.env.DOCLING_DOCKER_USER || currentDockerUser();
  if (dockerUser !== 'default') {
    dockerArgs.push('--user', dockerUser);
  }

  dockerArgs.push(
    '--volume', `${inputDir}:/input:ro`,
    '--volume', `${outputPlan.containerOutputHostDir}:/output:rw`,
    imageName,
    '--to', options.format,
  );

  if (options.includeJson) {
    dockerArgs.push('--to', 'json');
  }

  dockerArgs.push(
    '--image-export-mode', 'referenced',
    '--artifacts-path', '/opt/docling/models',
    '--output', '/output',
    ...passthroughArgs,
    containerInputPath,
  );

  return dockerArgs;
}

function finalizeOutputPlan(outputPlan, options) {
  if (outputPlan.mode === 'directory') {
    return;
  }

  fs.mkdirSync(outputPlan.finalDirectory, { recursive: true });
  const convertedPrimaryPath = findFirstFile(outputPlan.containerOutputHostDir, FORMAT_EXTENSIONS.get(options.format));
  if (!convertedPrimaryPath) {
    fail(`Docling did not produce a ${options.format} file in ${outputPlan.containerOutputHostDir}.`);
  }
  fs.renameSync(convertedPrimaryPath, outputPlan.finalPrimaryPath);

  if (options.includeJson) {
    const convertedJsonPath = findFirstFile(outputPlan.containerOutputHostDir, '.json');
    if (convertedJsonPath) {
      fs.renameSync(convertedJsonPath, sidecarPath(outputPlan.finalPrimaryPath, '.json'));
    }
  }

  const remainingEntries = fs.readdirSync(outputPlan.containerOutputHostDir);
  if (remainingEntries.length > 0) {
    const artifactsDir = artifactPath(outputPlan.finalPrimaryPath);
    fs.mkdirSync(artifactsDir, { recursive: true });
    for (const entry of remainingEntries) {
      fs.renameSync(path.join(outputPlan.containerOutputHostDir, entry), path.join(artifactsDir, entry));
    }
  }

  fs.rmSync(outputPlan.containerOutputHostDir, { recursive: true, force: true });
}

function findFirstFile(directory, extension) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && path.extname(entry.name) === extension)
    .map((entry) => path.join(directory, entry.name))
    .sort();
  return files[0];
}

function printSummary(outputPlan, options) {
  const summary = {
    primaryOutput: outputPlan.finalPrimaryPath,
  };
  if (options.includeJson) {
    summary.jsonSidecar = outputPlan.mode === 'directory'
      ? 'written in output directory when Docling emits JSON'
      : sidecarPath(outputPlan.finalPrimaryPath, '.json');
  }
  console.log(JSON.stringify(summary, null, 2));
}

function currentDockerUser() {
  if (process.platform === 'win32') {
    return 'default';
  }
  return `${os.userInfo().uid}:${os.userInfo().gid}`;
}

function sidecarPath(primaryPath, extension) {
  return path.join(path.dirname(primaryPath), `${path.basename(primaryPath, path.extname(primaryPath))}${extension}`);
}

function artifactPath(primaryPath) {
  return path.join(path.dirname(primaryPath), `${path.basename(primaryPath, path.extname(primaryPath))}-artifacts`);
}

function statFile(filePath) {
  try {
    return fs.statSync(filePath);
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      fail(`Input does not exist: ${filePath}`);
    }
    throw error;
  }
}

function commandSucceeds(command, args) {
  const result = childProcess.spawnSync(command, args, { stdio: 'ignore' });
  return result.status === 0;
}

function run(command, args, options = {}, failureMessage = undefined) {
  const result = childProcess.spawnSync(command, args, options);
  if (result.error) {
    fail(failureMessage || `${command} failed: ${result.error.message}`);
  }
  if (result.status !== 0) {
    fail(failureMessage || `${command} exited with status ${result.status}.`);
  }
}

function printHelp() {
  console.log(`Usage:
  node scripts/docling-convert.mjs --input <file.pdf|docx|pptx|xlsx> (--out-dir <dir> | --output <file.md>) [options] [-- <docling args>]

Options:
  --input <path>      Input PDF, DOCX, PPTX, or XLSX file.
  --out-dir <dir>    Output root. Creates <dir>/<input-stem>/.
  --output <path>    Exact primary output file path.
  --format <format>  Primary format: md, text, html. Default: md.
  --json             Also request Docling JSON output.
  --force            Allow unsupported input extensions.
  --overwrite        Replace existing output.

Environment:
  DOCLING_DOCKER_IMAGE    Override Docker image. Default: ${DEFAULT_IMAGE}
  DOCLING_DOCKER_BUILD    never | missing | always. Default: missing
  DOCLING_DOCKER_ARCHIVE  never | missing | always. Default: missing
  DOCLING_DOCKER_NETWORK  Docker network mode. Default: none
  DOCLING_DOCKER_USER     UID:GID or default. Default: current user on macOS/Linux
`);
}

function fail(message) {
  console.error(`docling-convert: ${message}`);
  process.exit(1);
}

main();
