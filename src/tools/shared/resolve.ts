import { listRepos, psWorktrees, showTerminal } from "../../lib/api";
import { branchName, folderName, worktreePath } from "../../lib/selectors";
import { Repo, WorktreeSummary } from "../../lib/types";
import { notFound } from "./errors";

export interface RepoRef {
  repoId?: string;
  repoName?: string;
}

export async function resolveWorktreeId(worktreeIdOrName: string): Promise<string> {
  const wanted = worktreeIdOrName.trim();
  if (wanted.includes("::")) {
    return wanted;
  }
  const match = matchWorktree(await psWorktrees(), wanted.toLowerCase());
  if (!match) {
    throw notFound(`No worktree matches "${wanted}". Call list-worktrees and pass the id it returns.`);
  }
  return match.worktreeId;
}

export async function resolveRepo(ref: RepoRef): Promise<Repo> {
  const wanted = (ref.repoId ?? ref.repoName)?.trim();
  if (!wanted) {
    throw notFound("A project is required. Call list-projects and pass the id it returns as repoId.");
  }
  const repos = await listRepos();
  const match = repos.find((repo) => repo.id === wanted) ?? matchRepoName(repos, wanted.toLowerCase());
  if (!match) {
    throw notFound(`No project matches "${wanted}". Call list-projects to see the registered projects.`);
  }
  return match;
}

export async function repoLabel(ref: RepoRef): Promise<string> {
  const resolved = await resolveRepo(ref)
    .then((repo) => repo.displayName)
    .catch(() => undefined);
  return resolved ?? ref.repoName ?? ref.repoId ?? "unknown project";
}

export function worktreeLabel(worktreeIdOrName: string): string {
  return worktreeIdOrName.includes("::") ? worktreePath(worktreeIdOrName) : worktreeIdOrName;
}

export async function terminalLabel(handle: string): Promise<string> {
  const terminal = await showTerminal(handle).catch(() => undefined);
  if (!terminal) {
    return handle;
  }
  return `${terminal.title} (${folderName(worktreePath(terminal.worktreeId))})`;
}

function matchWorktree(worktrees: WorktreeSummary[], needle: string): WorktreeSummary | undefined {
  return (
    worktrees.find((worktree) => worktree.displayName.toLowerCase() === needle) ??
    worktrees.find((worktree) => worktree.path.toLowerCase() === needle) ??
    worktrees.find((worktree) => branchName(worktree.branch).toLowerCase() === needle) ??
    worktrees.find((worktree) => worktree.repo.toLowerCase() === needle) ??
    worktrees.find((worktree) => `${worktree.repo}/${worktree.displayName}`.toLowerCase().includes(needle))
  );
}

function matchRepoName(repos: Repo[], needle: string): Repo | undefined {
  return (
    repos.find((repo) => repo.displayName.toLowerCase() === needle) ??
    repos.find((repo) => repo.path.toLowerCase() === needle) ??
    repos.find((repo) => repo.displayName.toLowerCase().includes(needle))
  );
}
