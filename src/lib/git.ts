import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const SYSTEM_GIT = "/usr/bin/git";

function gitBinary(): string {
  return existsSync(SYSTEM_GIT) ? SYSTEM_GIT : "git";
}

export async function isGitRepo(dir: string): Promise<boolean> {
  if (existsSync(join(dir, ".git"))) {
    return true;
  }
  try {
    const { stdout } = await execFileAsync(gitBinary(), ["-C", dir, "rev-parse", "--is-inside-work-tree"]);
    return stdout.trim() === "true";
  } catch {
    return false;
  }
}

export async function gitInit(dir: string): Promise<void> {
  await execFileAsync(gitBinary(), ["init", dir]);
}

export function repoNameFromUrl(url: string): string {
  const trimmed = url.trim().replace(/\/+$/, "");
  const lastSegment = trimmed.split(/[/:]/).pop() ?? "";
  return lastSegment.replace(/\.git$/, "");
}

export async function gitClone(url: string, parentDir: string, name?: string): Promise<string> {
  const target = join(parentDir, name ?? repoNameFromUrl(url));
  await execFileAsync(gitBinary(), ["clone", url, target], { timeout: 10 * 60_000 });
  return target;
}
