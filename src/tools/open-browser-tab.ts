import { createTab } from "../lib/api";
import { focusOrca } from "../lib/app";
import { withOrca } from "./shared/errors";
import { resolveWorktreeId } from "./shared/resolve";

type Input = {
  /**
   * The URL to open. A bare domain such as "onorca.dev" works; Orca adds the scheme.
   */
  url: string;
  /**
   * The worktree whose embedded browser should open the tab. Prefer a full worktree id
   * `<repoId>::<absolutePath>` from list-worktrees; a worktree display name is also accepted.
   */
  worktreeId: string;
};

export default async function tool(input: Input) {
  return withOrca(async () => {
    const worktreeId = await resolveWorktreeId(input.worktreeId);
    const result = await createTab(worktreeId, { url: input.url });
    await focusOrca();
    return { browserPageId: result.browserPageId, url: input.url, worktreeId };
  });
}
