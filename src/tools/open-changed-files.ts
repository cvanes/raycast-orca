import { openChangedFiles } from "../lib/api";
import { focusOrca } from "../lib/app";
import { withOrca } from "./shared/errors";
import { resolveWorktreeId } from "./shared/resolve";

const MAX_REPORTED_PATHS = 50;

type Input = {
  /**
   * The worktree whose git-changed files should be opened. Prefer a full worktree id
   * `<repoId>::<absolutePath>` from list-worktrees; a worktree display name is also accepted.
   */
  worktreeId: string;
  /**
   * "edit" opens each file in the editor, "diff" opens each git diff, "both" opens both. Defaults
   * to "diff".
   */
  mode?: "edit" | "diff" | "both";
};

export default async function tool(input: Input) {
  return withOrca(async () => {
    const worktreeId = await resolveWorktreeId(input.worktreeId);
    const mode = input.mode ?? "diff";
    const result = await openChangedFiles(worktreeId, { mode });
    const paths = (result.opened ?? []).map((file) => file.path);
    await focusOrca();
    return {
      worktreeId,
      mode: result.mode ?? mode,
      count: paths.length,
      paths: paths.slice(0, MAX_REPORTED_PATHS),
    };
  });
}
