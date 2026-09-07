import { listTerminals } from "../lib/api";
import { slimTerminal } from "../lib/format";
import { withOrca } from "./shared/errors";
import { resolveWorktreeId } from "./shared/resolve";

type Input = {
  /**
   * Optional worktree filter. Prefer a full worktree id `<repoId>::<absolutePath>` from
   * list-worktrees; a worktree display name such as "docs-site" is also accepted. Omit to list the
   * terminals of every worktree.
   */
  worktreeId?: string;
  /**
   * Maximum number of terminals to return. Omit for all of them.
   */
  limit?: number;
};

export default async function tool(input: Input) {
  return withOrca(async () => {
    const worktree = input.worktreeId ? await resolveWorktreeId(input.worktreeId) : undefined;
    const terminals = await listTerminals({ worktree, limit: input.limit });
    return { terminals: terminals.map(slimTerminal) };
  });
}
