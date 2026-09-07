import { Action, Tool } from "@raycast/api";
import { removeWorktree } from "../lib/api";
import { withOrca } from "./shared/errors";
import { resolveWorktreeId, worktreeLabel } from "./shared/resolve";

type Input = {
  /**
   * The worktree to remove. Prefer a full worktree id `<repoId>::<absolutePath>` from
   * list-worktrees. A worktree display name such as "fix-links" is also accepted and resolved for
   * you.
   */
  worktreeId: string;
  /**
   * Set to true to remove the worktree even when it has uncommitted changes or live terminals.
   * Defaults to false.
   */
  force?: boolean;
};

export default async function tool(input: Input) {
  return withOrca(async () => {
    const worktreeId = await resolveWorktreeId(input.worktreeId);
    const result = await removeWorktree(worktreeId, { force: input.force });
    return {
      removed: result.removed ?? true,
      worktreeId: result.worktreeId ?? worktreeId,
      branchDeleted: result.branchDeleted,
    };
  });
}

export const confirmation: Tool.Confirmation<Input> = async (input) => ({
  style: Action.Style.Destructive,
  message: `Remove the worktree "${worktreeLabel(input.worktreeId)}"? This deletes its checkout and tries to delete its branch.`,
  info: [
    { name: "Worktree", value: worktreeLabel(input.worktreeId) },
    { name: "Force", value: input.force ? "yes" : undefined },
  ],
});
