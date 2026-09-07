import { Tool } from "@raycast/api";
import { closeTab } from "../lib/api";
import { invalidInput, withOrca } from "./shared/errors";
import { resolveWorktreeId, worktreeLabel } from "./shared/resolve";

type Input = {
  /**
   * The worktree whose embedded browser owns the tab. Prefer a full worktree id
   * `<repoId>::<absolutePath>` from list-worktrees; a worktree display name is also accepted.
   */
  worktreeId: string;
  /**
   * The `browserPageId` of the tab to close, from list-browser-tabs. Preferred over index.
   */
  browserPageId?: string;
  /**
   * The zero based `index` of the tab to close, from list-browser-tabs. Only use this when you do
   * not have a browserPageId.
   */
  index?: number;
};

export default async function tool(input: Input) {
  return withOrca(async () => {
    requireTab(input);
    const worktreeId = await resolveWorktreeId(input.worktreeId);
    const result = await closeTab(worktreeId, { page: input.browserPageId, index: input.index });
    return { closed: result.closed ?? true, browserPageId: input.browserPageId, index: input.index, worktreeId };
  });
}

export const confirmation: Tool.Confirmation<Input> = async (input) => ({
  message: `Close this browser tab in "${worktreeLabel(input.worktreeId)}"?`,
  info: [
    { name: "Page", value: input.browserPageId },
    { name: "Index", value: input.index === undefined ? undefined : String(input.index) },
  ],
});

function requireTab(input: Input): void {
  if (!input.browserPageId && input.index === undefined) {
    throw invalidInput("Pass browserPageId or index. Call list-browser-tabs to find them.");
  }
}
