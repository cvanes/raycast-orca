import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const GH_PATHS = ["/opt/homebrew/bin/gh", "/usr/local/bin/gh"];
const GH_TIMEOUT_MS = 20_000;

export interface GitHubRepo {
  nameWithOwner: string;
  description?: string;
  url: string;
  cloneUrl: string;
  sshUrl?: string;
  isPrivate: boolean;
  stars?: number;
  updatedAt?: string;
}

export interface GitHubRepos {
  available: boolean;
  reason?: string;
  repos: GitHubRepo[];
}

function findGh(): string | null {
  return GH_PATHS.find((candidate) => existsSync(candidate)) ?? null;
}

export async function listMyRepos(limit = 50): Promise<GitHubRepos> {
  return runGh([
    "repo",
    "list",
    "--limit",
    String(limit),
    "--json",
    "nameWithOwner,description,url,isPrivate,updatedAt,sshUrl",
  ]);
}

export async function searchRepos(query: string, limit = 30): Promise<GitHubRepos> {
  return runGh([
    "search",
    "repos",
    query,
    "--limit",
    String(limit),
    "--json",
    "fullName,description,url,stargazersCount,isPrivate,updatedAt",
  ]);
}

interface RawRepo {
  nameWithOwner?: string;
  fullName?: string;
  description?: string;
  url: string;
  sshUrl?: string;
  isPrivate?: boolean;
  stargazersCount?: number;
  updatedAt?: string;
}

async function runGh(args: string[]): Promise<GitHubRepos> {
  const gh = findGh();
  if (!gh) {
    return { available: false, reason: "The GitHub CLI (gh) is not installed.", repos: [] };
  }
  try {
    const { stdout } = await execFileAsync(gh, args, { timeout: GH_TIMEOUT_MS, maxBuffer: 8 * 1024 * 1024 });
    return { available: true, repos: (JSON.parse(stdout) as RawRepo[]).map(normalise) };
  } catch (error) {
    const detail = error as { stderr?: string; message?: string };
    return { available: false, reason: (detail.stderr || detail.message || "gh failed").trim(), repos: [] };
  }
}

function normalise(raw: RawRepo): GitHubRepo {
  const nameWithOwner = raw.nameWithOwner ?? raw.fullName ?? "";
  return {
    nameWithOwner,
    description: raw.description || undefined,
    url: raw.url,
    cloneUrl: `https://github.com/${nameWithOwner}.git`,
    sshUrl: raw.sshUrl,
    isPrivate: raw.isPrivate ?? false,
    stars: raw.stargazersCount,
    updatedAt: raw.updatedAt,
  };
}

export function githubProjectId(url: string): string | undefined {
  const match = url.trim().match(/github\.com[/:]([^/]+)\/([^/]+?)(?:\.git)?\/?$/i);
  return match ? `github:${match[1]}/${match[2]}` : undefined;
}
