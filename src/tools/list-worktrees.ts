import { psWorktrees } from "../lib/api";
import { slimWorktreeSummary } from "../lib/format";
import { WorktreeSummary } from "../lib/types";
import { withOrca } from "./shared/errors";

type Input = {
  /**
   * Optional project filter. Either a repo id from list-projects, for example
   * "ff3f23c4-8ce3-414e-8ead-f1861459e8b6", or part of a project display name, for example
   * "docs-site". Omit to list the worktrees of every project.
   */
  repo?: string;
  /**
   * Set to true to include archived worktrees. Defaults to false, which lists only live ones.
   */
  includeArchived?: boolean;
};

export default async function tool(input: Input) {
  return withOrca(async () => {
    const worktrees = await psWorktrees();
    return { worktrees: matching(worktrees, input).map(slimWorktreeSummary) };
  });
}

function matching(worktrees: WorktreeSummary[], input: Input): WorktreeSummary[] {
  const needle = input.repo?.trim().toLowerCase();
  return worktrees.filter((worktree) => {
    if (worktree.isArchived && !input.includeArchived) {
      return false;
    }
    if (!needle) {
      return true;
    }
    return worktree.repoId.toLowerCase() === needle || worktree.repo.toLowerCase().includes(needle);
  });
}
