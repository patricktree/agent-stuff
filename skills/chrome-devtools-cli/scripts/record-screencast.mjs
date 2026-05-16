#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const DEFAULT_FPS = 30;
const DEFAULT_QUALITY = 85;
const DEFAULT_FORMAT = "jpeg";

const options = parseOptions(process.argv.slice(2));

if (!options.endpoint) {
  printUsageAndExit("Missing --endpoint.");
}

const outputDirectory = resolve(options.framesDir ?? `cdp-screencast-${Date.now()}`);
const outputVideo = options.output ? resolve(options.output) : undefined;
const frameFormat = options.format ?? DEFAULT_FORMAT;
const frameExtension = frameFormat === "jpeg" ? "jpg" : frameFormat;
const requestedFps = Number(options.fps ?? DEFAULT_FPS);
const requestedQuality = Number(options.quality ?? DEFAULT_QUALITY);
const captureSeconds = options.seconds ? Number(options.seconds) : undefined;

if (!Number.isFinite(requestedFps) || requestedFps <= 0) {
  throw new Error("--fps must be a positive number.");
}

if (!Number.isFinite(requestedQuality) || requestedQuality < 0 || requestedQuality > 100) {
  throw new Error("--quality must be a number between 0 and 100.");
}

if (captureSeconds !== undefined && (!Number.isFinite(captureSeconds) || captureSeconds <= 0)) {
  throw new Error("--seconds must be a positive number.");
}

await mkdir(outputDirectory, { recursive: true });

const pageWebSocketUrl = await resolvePageWebSocketUrl({
  endpoint: options.endpoint,
  target: options.target,
});

const frameRecords = [];
let frameIndex = 0;
let nextMessageId = 1;
let isStopping = false;
let stopRequestedAt = undefined;
const pendingCommands = new Map();
const startedAt = Date.now() / 1000;

const webSocket = new WebSocket(pageWebSocketUrl);

webSocket.addEventListener("message", (event) => {
  void handleMessage(event.data).catch((error) => {
    console.error(error);
    void stopCapture();
  });
});

webSocket.addEventListener("error", (event) => {
  console.error("WebSocket error", event);
});

await waitForOpen(webSocket);

process.on("SIGINT", () => {
  void stopCapture();
});

await sendCommand("Page.enable");
await sendCommand("Page.startScreencast", {
  format: frameFormat,
  quality: requestedQuality,
  everyNthFrame: 1,
});

console.error(`Recording CDP screencast frames to ${outputDirectory}`);

if (captureSeconds !== undefined) {
  setTimeout(() => {
    void stopCapture();
  }, captureSeconds * 1000);
}

await waitForClose(webSocket);

await writeCaptureArtifacts();

async function handleMessage(rawMessage) {
  const message = JSON.parse(String(rawMessage));

  if (message.id && pendingCommands.has(message.id)) {
    const { resolveCommand, rejectCommand } = pendingCommands.get(message.id);
    pendingCommands.delete(message.id);

    if (message.error) {
      rejectCommand(new Error(`${message.error.message}: ${message.error.data ?? ""}`));
      return;
    }

    resolveCommand(message.result);
    return;
  }

  if (message.method !== "Page.screencastFrame") {
    return;
  }

  const timestamp = message.params.metadata?.timestamp ?? Date.now() / 1000;
  const fileName = `frame-${String(frameIndex).padStart(6, "0")}.${frameExtension}`;
  const filePath = join(outputDirectory, fileName);

  await writeFile(filePath, Buffer.from(message.params.data, "base64"));
  frameRecords.push({ fileName, timestamp });
  frameIndex += 1;

  await sendCommand("Page.screencastFrameAck", {
    sessionId: message.params.sessionId,
  });
}

async function stopCapture() {
  if (isStopping) {
    return;
  }

  isStopping = true;
  stopRequestedAt = Date.now() / 1000;
  console.error("Stopping CDP screencast capture...");

  try {
    await sendCommand("Page.stopScreencast");
  } catch (error) {
    console.error(`Could not stop screencast cleanly: ${error.message}`);
  } finally {
    webSocket.close();
  }
}

function sendCommand(method, params = {}) {
  const id = nextMessageId;
  nextMessageId += 1;

  const command = { id, method, params };

  return new Promise((resolveCommand, rejectCommand) => {
    pendingCommands.set(id, { resolveCommand, rejectCommand });
    webSocket.send(JSON.stringify(command));
  });
}

async function writeCaptureArtifacts() {
  const metadataPath = join(outputDirectory, "frames.json");
  await writeFile(metadataPath, JSON.stringify(frameRecords, null, 2));

  if (frameRecords.length === 0) {
    throw new Error("No screencast frames were captured.");
  }

  const concatPath = join(outputDirectory, "frames.ffconcat");
  const concatLines = ["ffconcat version 1.0"];
  const captureEndedAt = stopRequestedAt ?? Date.now() / 1000;

  for (let index = 0; index < frameRecords.length; index += 1) {
    const currentFrame = frameRecords[index];
    const nextFrame = frameRecords[index + 1];
    const nextTimestamp = nextFrame?.timestamp ?? captureEndedAt;
    const duration = Math.max(1 / requestedFps, nextTimestamp - currentFrame.timestamp);

    concatLines.push(`file '${escapeConcatPath(join(outputDirectory, currentFrame.fileName))}'`);
    concatLines.push(`duration ${duration.toFixed(6)}`);
  }

  const finalFrame = frameRecords.at(-1);
  concatLines.push(`file '${escapeConcatPath(join(outputDirectory, finalFrame.fileName))}'`);

  await writeFile(concatPath, `${concatLines.join("\n")}\n`);

  if (outputVideo) {
    runFfmpeg({ concatPath, outputVideo });
  }

  console.error(`Captured ${frameRecords.length} frames.`);
  console.error(`Frame metadata: ${metadataPath}`);
  console.error(`FFmpeg concat file: ${concatPath}`);

  if (outputVideo) {
    console.error(`Video: ${outputVideo}`);
  }
}

function runFfmpeg({ concatPath, outputVideo }) {
  const ffmpegResult = spawnSync("ffmpeg", [
    "-y",
    "-f",
    "concat",
    "-safe",
    "0",
    "-i",
    concatPath,
    "-vf",
    "scale=trunc(iw/2)*2:trunc(ih/2)*2",
    "-vsync",
    "vfr",
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    outputVideo,
  ], {
    stdio: "inherit",
  });

  if (ffmpegResult.error) {
    throw ffmpegResult.error;
  }

  if (ffmpegResult.status !== 0) {
    throw new Error(`ffmpeg failed with exit code ${ffmpegResult.status}.`);
  }
}

async function resolvePageWebSocketUrl({ endpoint, target }) {
  if (endpoint.startsWith("ws://") || endpoint.startsWith("wss://")) {
    return endpoint;
  }

  const baseUrl = endpoint.replace(/\/$/, "");
  const response = await fetch(`${baseUrl}/json/list`);

  if (!response.ok) {
    throw new Error(`Could not list CDP targets from ${baseUrl}: ${response.status} ${response.statusText}`);
  }

  const targets = await response.json();
  const pageTargets = targets.filter((candidate) => candidate.type === "page");
  const selectedTarget = target
    ? pageTargets.find((candidate) => candidate.url?.includes(target) || candidate.title?.includes(target))
    : pageTargets[0];

  if (!selectedTarget?.webSocketDebuggerUrl) {
    const availableTargets = pageTargets
      .map((candidate) => `- ${candidate.title ?? "Untitled"} ${candidate.url ?? ""}`)
      .join("\n");

    throw new Error(`No matching page target found. Available page targets:\n${availableTargets}`);
  }

  return selectedTarget.webSocketDebuggerUrl;
}

function waitForOpen(webSocketConnection) {
  return new Promise((resolveOpen, rejectOpen) => {
    webSocketConnection.addEventListener("open", resolveOpen, { once: true });
    webSocketConnection.addEventListener("error", rejectOpen, { once: true });
  });
}

function waitForClose(webSocketConnection) {
  return new Promise((resolveClose) => {
    webSocketConnection.addEventListener("close", resolveClose, { once: true });
  });
}

function escapeConcatPath(filePath) {
  return filePath.replaceAll("'", "'\\''");
}

function parseOptions(args) {
  const parsedOptions = {};

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--help" || arg === "-h") {
      printUsageAndExit();
    }

    if (!arg.startsWith("--")) {
      throw new Error(`Unexpected positional argument: ${arg}`);
    }

    const key = arg.slice(2);
    const value = args[index + 1];

    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for ${arg}.`);
    }

    parsedOptions[key] = value;
    index += 1;
  }

  return parsedOptions;
}

function printUsageAndExit(message) {
  if (message) {
    console.error(message);
  }

  console.error(`Usage:
  node ${basename(process.argv[1])} --endpoint http://127.0.0.1:9222 --seconds 10 --output /tmp/capture.mp4

Options:
  --endpoint   CDP HTTP endpoint or page WebSocket URL.
  --target     Optional URL/title substring for selecting a page target.
  --seconds    Optional fixed capture duration. Omit to stop with Ctrl-C.
  --output     Optional MP4 output path. Requires ffmpeg on PATH.
  --frames-dir Optional directory for raw frames and metadata.
  --fps        Minimum duration fallback for duplicate/sparse timestamps. Default: ${DEFAULT_FPS}.
  --format     jpeg or png. Default: ${DEFAULT_FORMAT}.
  --quality    JPEG quality 0-100. Default: ${DEFAULT_QUALITY}.
`);

  process.exit(message ? 1 : 0);
}
