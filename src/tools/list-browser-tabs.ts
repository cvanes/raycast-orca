import { listTabs } from "../lib/api";
import { slimBrowserTab } from "../lib/format";
import { withOrca } from "./shared/errors";
import { resolveWorktreeId } from "./shared/resolve";

type Input = {
  /**
   * Optional worktree filter. Prefer a full worktree id `<repoId>::<absolutePath>` from
   * list-worktrees; a worktree display name is also accepted. Omit to list the tabs of every
   * worktree.
   */
  worktreeId?: string;
};

export default async function tool(input: Input) {
  return withOrca(async () => {
    const worktree = input.worktreeId ? await resolveWorktreeId(input.worktreeId) : "all";
    return { tabs: (await listTabs(worktree)).map(slimBrowserTab) };
  });
}
