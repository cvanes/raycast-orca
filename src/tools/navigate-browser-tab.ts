import { gotoUrl } from "../lib/api";
import { focusOrca } from "../lib/app";
import { withOrca } from "./shared/errors";
import { resolveWorktreeId } from "./shared/resolve";

type Input = {
  /**
   * The URL to navigate to. A bare domain such as "onorca.dev" works; Orca adds the scheme.
   */
  url: string;
  /**
   * The worktree whose embedded browser should navigate. Prefer a full worktree id
   * `<repoId>::<absolutePath>` from list-worktrees; a worktree display name is also accepted.
   */
  worktreeId: string;
  /**
   * The `browserPageId` of the tab to navigate, from list-browser-tabs. Omit to navigate the active
   * tab of that worktree.
   */
  browserPageId?: string;
};

export default async function tool(input: Input) {
  return withOrca(async () => {
    const worktreeId = await resolveWorktreeId(input.worktreeId);
    const result = await gotoUrl(worktreeId, input.url, { page: input.browserPageId });
    await focusOrca();
    return { url: result.url ?? input.url, title: result.title, browserPageId: input.browserPageId, worktreeId };
  });
}
