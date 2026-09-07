import { Tool } from "@raycast/api";
import { createTerminal } from "../lib/api";
import { focusOrca } from "../lib/app";
import { withOrca } from "./shared/errors";
import { resolveWorktreeId, worktreeLabel } from "./shared/resolve";

type Input = {
  /**
   * The worktree to create the terminal in. Prefer a full worktree id `<repoId>::<absolutePath>`
   * from list-worktrees; a worktree display name is also accepted and resolved for you.
   */
  worktreeId: string;
  /**
   * Title for the new terminal, for example "tests".
   */
  title?: string;
  /**
   * Shell command to run in the new terminal, for example "npm test". Omit for an idle shell.
   */
  command?: string;
  /**
   * Set to true to bring Orca to the front and reveal the new terminal. Defaults to false.
   */
  focus?: boolean;
};

export default async function tool(input: Input) {
  return withOrca(async () => {
    const worktree = await resolveWorktreeId(input.worktreeId);
    const terminal = await createTerminal({
      worktree,
      title: input.title,
      command: input.command,
      focus: input.focus,
    });
    if (input.focus) {
      await focusOrca();
    }
    return {
      terminal: {
        handle: terminal.handle,
        title: terminal.title,
        worktreeId: terminal.worktreeId,
        surface: terminal.surface,
      },
    };
  });
}

export const confirmation: Tool.Confirmation<Input> = async (input) => ({
  message: `Create a terminal in "${worktreeLabel(input.worktreeId)}"?`,
  info: [
    { name: "Worktree", value: worktreeLabel(input.worktreeId) },
    { name: "Title", value: input.title },
    { name: "Command", value: input.command },
  ],
});
