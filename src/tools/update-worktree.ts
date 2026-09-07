import { Tool } from "@raycast/api";
import { setWorktree } from "../lib/api";
import { slimWorktree } from "../lib/format";
import { invalidInput, withOrca } from "./shared/errors";
import { resolveWorktreeId, worktreeLabel } from "./shared/resolve";

type Input = {
  /**
   * The worktree to update. Prefer a full worktree id `<repoId>::<absolutePath>` from
   * list-worktrees. A worktree display name such as "first-iteration-codex" is also accepted and
   * resolved for you.
   */
  worktreeId: string;
  /**
   * New display name for the worktree. Omit to leave it unchanged.
   */
  displayName?: string;
  /**
   * New note to store on the worktree. Pass an empty string to clear it. Omit to leave it
   * unchanged.
   */
  comment?: string;
  /**
   * New workspace status. Omit to leave it unchanged.
   */
  workspaceStatus?: "todo" | "in-progress" | "in-review" | "completed";
};

export default async function tool(input: Input) {
  return withOrca(async () => {
    requireChange(input);
    const worktreeId = await resolveWorktreeId(input.worktreeId);
    const worktree = await setWorktree(worktreeId, {
      displayName: input.displayName,
      comment: input.comment,
      workspaceStatus: input.workspaceStatus,
    });
    return { worktree: slimWorktree(worktree) };
  });
}

export const confirmation: Tool.Confirmation<Input> = async (input) => ({
  message: `Update the worktree "${worktreeLabel(input.worktreeId)}"?`,
  info: [
    { name: "New name", value: input.displayName },
    { name: "Comment", value: input.comment },
    { name: "Workspace status", value: input.workspaceStatus },
  ],
});

function requireChange(input: Input): void {
  if (!input.displayName && input.comment === undefined && !input.workspaceStatus) {
    throw invalidInput("Nothing to update. Pass displayName, comment or workspaceStatus.");
  }
}
