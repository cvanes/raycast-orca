import { showWorktree } from "../lib/api";
import { slimWorktree } from "../lib/format";
import { withOrca } from "./shared/errors";
import { resolveWorktreeId } from "./shared/resolve";

type Input = {
  /**
   * The worktree to look up. Prefer a full worktree id `<repoId>::<absolutePath>` from
   * list-worktrees, for example
   * "ff3f23c4-8ce3-414e-8ead-f1861459e8b6::/Users/me/Development/acme/docs-site". A worktree
   * display name such as "fix-links" is also accepted and resolved for you.
   */
  worktreeId: string;
};

export default async function tool(input: Input) {
  return withOrca(async () => {
    const worktreeId = await resolveWorktreeId(input.worktreeId);
    return { worktree: slimWorktree(await showWorktree(worktreeId)) };
  });
}
