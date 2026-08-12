import childProcess from "node:child_process";

import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { complete, type UserMessage } from "@earendil-works/pi-ai/compat";

type Status = "waiting" | "busy" | "error";

const STATUS_SYMBOLS = {
	waiting: "🟢",
	busy: "🟡",
	error: "🔴",
} as const satisfies Record<Status, string>;

const FALLBACK_LABEL = "pi";
const MAX_LABEL_LENGTH = 30;
const TMUX_TARGET_PANE = process.env.TMUX && process.env.TMUX_PANE ? process.env.TMUX_PANE : undefined;
const ORIGINAL_WINDOW_NAME_OPTION = "@pi-original-window-name";
const ORIGINAL_AUTOMATIC_RENAME_OPTION = "@pi-original-automatic-rename";
const LABEL_PROMPT = `Generate a concise session title for a coding-agent conversation from the user's first request.

Rules:
- Return only the title, no quotes, no punctuation wrapper, no explanation.
- Max 30 visible characters.
- Use sentence-style capitalization: capitalize the first word only.
- Keep established proper nouns and acronyms as-is, such as Pi, tmux, Postgres, TypeScript, API, UI, and README.
- Prefer concrete task language over generic wording.
- Do not include emoji, status symbols, secrets, URLs, emails, or file paths unless essential.
- Do not include words like "please", "can you", "I want", or "Pi" unless they are essential to the task.`;

export default function (pi: ExtensionAPI) {
	let currentStatus: Status = "waiting";
	let sessionGeneration = 0;
	let isGeneratingLabel = false;
	let originalWindowName: string | undefined;
	let originalAutomaticRename: string | undefined;

	pi.on("session_start", async () => {
		currentStatus = "waiting";
		sessionGeneration += 1;
		isGeneratingLabel = false;
		originalWindowName = getOrCaptureWindowOption(ORIGINAL_WINDOW_NAME_OPTION, getCurrentWindowName());
		originalAutomaticRename = getOrCaptureWindowOption(
			ORIGINAL_AUTOMATIC_RENAME_OPTION,
			getWindowOption("automatic-rename"),
		);
		disableAutomaticRename();
		renameWindow(currentStatus, getLabel(pi));
	});

	pi.on("input", async (event, ctx) => {
		currentStatus = "busy";
		renameWindow(currentStatus, getLabel(pi));

		if (!pi.getSessionName() && !isGeneratingLabel && isSubstantiveUserInput(event.text)) {
			isGeneratingLabel = true;
			const generation = sessionGeneration;
			void generateLabel(ctx, event.text).then((generatedLabel) => {
				if (generation !== sessionGeneration) return;

				isGeneratingLabel = false;
				if (!generatedLabel) return;
				if (pi.getSessionName()) return;

				pi.setSessionName(generatedLabel);
				renameWindow(currentStatus, generatedLabel);
			});
		}
	});

	pi.on("agent_start", async () => {
		currentStatus = "busy";
		renameWindow(currentStatus, getLabel(pi));
	});

	pi.on("agent_end", async (_event, ctx) => {
		currentStatus = ctx.hasPendingMessages() ? "busy" : "waiting";
		renameWindow(currentStatus, getLabel(pi));
	});

	pi.on("session_info_changed", async () => {
		renameWindow(currentStatus, getLabel(pi));
	});

	pi.on("session_shutdown", async (event) => {
		sessionGeneration += 1;
		isGeneratingLabel = false;

		if (event.reason !== "quit") return;

		if (originalWindowName) {
			runTmuxSync(["rename-window", "-t", TMUX_TARGET_PANE!, originalWindowName]);
		}
		if (originalAutomaticRename) {
			runTmuxSync([
				"set-window-option",
				"-t",
				TMUX_TARGET_PANE!,
				"automatic-rename",
				originalAutomaticRename,
			]);
		}

		runTmuxSync(["set-window-option", "-t", TMUX_TARGET_PANE!, "-u", ORIGINAL_WINDOW_NAME_OPTION]);
		runTmuxSync([
			"set-window-option",
			"-t",
			TMUX_TARGET_PANE!,
			"-u",
			ORIGINAL_AUTOMATIC_RENAME_OPTION,
		]);
	});
}

function getLabel(pi: ExtensionAPI): string {
	return pi.getSessionName() ?? FALLBACK_LABEL;
}

function disableAutomaticRename(): void {
	setWindowOption("automatic-rename", "off");
}

function renameWindow(status: Status, label: string): void {
	runTmux(["rename-window", "-t", TMUX_TARGET_PANE!, `${STATUS_SYMBOLS[status]} ${label}`]);
}

function getCurrentWindowName(): string | undefined {
	return readTmux(["display-message", "-p", "-t", TMUX_TARGET_PANE!, "#W"]);
}

function getWindowOption(optionName: string): string | undefined {
	return readTmux(["show-window-options", "-v", "-t", TMUX_TARGET_PANE!, optionName]);
}

function getOrCaptureWindowOption(optionName: string, value: string | undefined): string | undefined {
	const existingValue = getWindowOption(optionName);
	if (existingValue) return existingValue;
	if (!value) return undefined;

	setWindowOption(optionName, value);
	return value;
}

function setWindowOption(optionName: string, value: string): void {
	runTmux(["set-window-option", "-t", TMUX_TARGET_PANE!, optionName, value]);
}

function readTmux(args: string[]): string | undefined {
	if (!TMUX_TARGET_PANE) return undefined;

	try {
		const result = childProcess.spawnSync("tmux", args, {
			encoding: "utf8",
			stdio: ["ignore", "pipe", "ignore"],
		});
		if (result.status !== 0) return undefined;

		return result.stdout.trim() || undefined;
	} catch {
		return undefined;
	}
}

function runTmux(args: string[]): void {
	if (!TMUX_TARGET_PANE) return;

	try {
		const tmux = childProcess.spawn("tmux", args, {
			stdio: "ignore",
			detached: true,
		});

		tmux.on("error", () => {
			// This integration is best-effort UI polish; failures must never affect Pi.
		});
		tmux.unref();
	} catch {
		// This integration is best-effort UI polish; failures must never affect Pi.
	}
}

function runTmuxSync(args: string[]): void {
	if (!TMUX_TARGET_PANE) return;

	try {
		childProcess.spawnSync("tmux", args, {
			stdio: "ignore",
		});
	} catch {
		// This integration is best-effort UI polish; failures must never affect Pi.
	}
}

function isSubstantiveUserInput(input: string): boolean {
	const trimmedInput = input.trim();
	return Boolean(trimmedInput) && !trimmedInput.startsWith("/") && !trimmedInput.startsWith("!");
}

async function generateLabel(ctx: ExtensionContext, input: string): Promise<string | undefined> {
	if (!ctx.model) return undefined;

	try {
		const auth = await ctx.modelRegistry.getApiKeyAndHeaders(ctx.model);
		if (!auth.ok || !auth.apiKey) return undefined;

		const userMessage: UserMessage = {
			role: "user",
			content: [{ type: "text", text: input }],
			timestamp: Date.now(),
		};

		const response = await complete(
			ctx.model,
			{ systemPrompt: LABEL_PROMPT, messages: [userMessage] },
			{ apiKey: auth.apiKey, headers: auth.headers, env: auth.env, signal: ctx.signal },
		);

		if (response.stopReason === "aborted") return undefined;

		const text = response.content
			.filter((content): content is { type: "text"; text: string } => content.type === "text")
			.map((content) => content.text)
			.join(" ");

		return normalizeGeneratedLabel(text);
	} catch {
		return undefined;
	}
}

function normalizeGeneratedLabel(input: string): string | undefined {
	const withoutWrapper = input
		.replace(/```[\s\S]*?```/g, " ")
		.replace(/^[\s"'`“”‘’]+/, "")
		.replace(/[\s"'`“”‘’.:;!?]+$/, "")
		.replace(/\s+/g, " ")
		.trim();

	if (!withoutWrapper) return undefined;

	const characters = Array.from(withoutWrapper);
	if (characters.length <= MAX_LABEL_LENGTH) return withoutWrapper;

	return `${characters.slice(0, MAX_LABEL_LENGTH).join("").trimEnd()}...`;
}
