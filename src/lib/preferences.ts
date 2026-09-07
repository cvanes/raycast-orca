import { homedir } from "node:os";
import { join } from "node:path";
import { getPreferenceValues } from "@raycast/api";
import { AgentId } from "./types";

interface Preferences {
  orcaPath?: string;
  defaultAgent?: AgentId | "none";
  defaultCloneDirectory?: string;
}

export function preferences(): Preferences {
  return getPreferenceValues<Preferences>();
}

export function defaultAgent(): AgentId | undefined {
  const configured = preferences().defaultAgent;
  return configured && configured !== "none" ? configured : undefined;
}

export function defaultCloneDirectory(): string {
  const configured = preferences().defaultCloneDirectory?.trim();
  return expandHome(configured || "~/Development");
}

export function expandHome(path: string): string {
  return path.startsWith("~") ? join(homedir(), path.slice(1)) : path;
}
