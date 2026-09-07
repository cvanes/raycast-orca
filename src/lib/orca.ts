import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { promisify } from "node:util";
import { preferences } from "./preferences";
import { OrcaEnvelope, OrcaErrorPayload } from "./types";

const execFileAsync = promisify(execFile);

const DEFAULT_BINARY = "/usr/local/bin/orca";
const BUNDLED_BINARY = "/Applications/Orca.app/Contents/Resources/bin/orca";
const MAX_BUFFER = 20 * 1024 * 1024;
const DEFAULT_TIMEOUT_MS = 30_000;

export class OrcaError extends Error {
  readonly code: string;
  readonly data?: unknown;

  constructor(payload: OrcaErrorPayload) {
    super(payload.message);
    this.name = "OrcaError";
    this.code = payload.code;
    this.data = payload.data;
  }
}

export interface RunOptions {
  timeoutMs?: number;
}

function resolveBinary(preferred?: string): string {
  const candidates = [preferred?.trim(), DEFAULT_BINARY, BUNDLED_BINARY].filter((candidate): candidate is string =>
    Boolean(candidate),
  );
  return candidates.find((candidate) => existsSync(candidate)) ?? candidates[0];
}

function parseEnvelope<T>(stdout: string): OrcaEnvelope<T> | undefined {
  try {
    return JSON.parse(stdout) as OrcaEnvelope<T>;
  } catch {
    return undefined;
  }
}

function processFailure(error: unknown): OrcaError {
  const shell = error as { stdout?: string; stderr?: string; code?: string; message?: string };
  const envelope = parseEnvelope<unknown>(shell.stdout ?? "");
  if (envelope?.error) {
    return new OrcaError(envelope.error);
  }
  const detail = (shell.stderr || shell.stdout || shell.message || "orca failed").trim();
  const code = shell.code === "ETIMEDOUT" ? "timeout" : "cli_error";
  return new OrcaError({ code, message: detail });
}

export async function orca<T>(args: string[], options: RunOptions = {}): Promise<T> {
  const binary = resolveBinary(preferences().orcaPath);
  let stdout: string;
  try {
    const result = await execFileAsync(binary, [...args, "--json"], {
      maxBuffer: MAX_BUFFER,
      timeout: options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    });
    stdout = result.stdout;
  } catch (error) {
    throw processFailure(error);
  }

  const envelope = parseEnvelope<T>(stdout);
  if (!envelope) {
    throw new OrcaError({ code: "unparseable_response", message: stdout.slice(0, 500) || "orca returned no output" });
  }
  if (!envelope.ok) {
    throw new OrcaError(envelope.error ?? { code: "unknown_error", message: "orca reported a failure" });
  }
  return envelope.result as T;
}

const RUNTIME_UNAVAILABLE_CODES = ["runtime_unavailable", "runtime_unreachable", "app_not_running", "not_connected"];

export function isRuntimeUnavailable(error: unknown): boolean {
  if (!(error instanceof OrcaError)) {
    return false;
  }
  if (RUNTIME_UNAVAILABLE_CODES.includes(error.code)) {
    return true;
  }
  return /not running|unreachable|no runtime|connect/i.test(error.message);
}

export function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}
