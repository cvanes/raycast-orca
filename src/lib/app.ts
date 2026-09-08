import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createTerminal, listTerminals, open, status, switchTerminal } from "./api";
import { pathSelector } from "./selectors";

const execFileAsync = promisify(execFile);

export async function focusOrca(): Promise<void> {
  await execFileAsync("/usr/bin/open", ["-a", "Orca"]);
}

export async function openOrca(): Promise<void> {
  const current = await status().catch(() => undefined);
  if (!current?.app.running || !current.runtime.reachable) {
    await open();
  }
  await focusOrca();
}

export async function revealProject(path: string): Promise<void> {
  const terminals = await listTerminals({ worktree: pathSelector(path) }).catch(() => []);
  const target = terminals.find((terminal) => terminal.connected) ?? terminals[0];
  if (target) {
    await switchTerminal(target.handle).catch(() => undefined);
  }
  await focusOrca();
}

export async function revealWorktree(worktree: string): Promise<void> {
  const terminals = await listTerminals({ worktree });
  const target = terminals.find((terminal) => terminal.connected) ?? terminals[0];
  if (target) {
    await switchTerminal(target.handle);
  } else {
    await createTerminal({ worktree, focus: true });
  }
  await focusOrca();
}
