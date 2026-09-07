import { diffFile, openFile } from "../lib/api";
import { focusOrca } from "../lib/app";
import { withOrca } from "./shared/errors";
import { resolveWorktreeId } from "./shared/resolve";

type Input = {
  /**
   * The worktree that owns the file. Prefer a full worktree id `<repoId>::<absolutePath>` from
   * list-worktrees; a worktree display name is also accepted and resolved for you.
   */
  worktreeId: string;
  /**
   * Path of the file, either relative to the worktree root such as "src/lib/api.ts" or an absolute
   * path inside the worktree.
   */
  path: string;
  /**
   * "edit" opens the file in the Orca editor, "diff" opens its git diff. Defaults to "edit".
   */
  mode?: "edit" | "diff";
  /**
   * Diff mode only: set to true to diff the staged version of the file. Defaults to false.
   */
  staged?: boolean;
};

export default async function tool(input: Input) {
  return withOrca(async () => {
    const worktreeId = await resolveWorktreeId(input.worktreeId);
    const mode = input.mode ?? "edit";
    const result =
      mode === "diff"
        ? await diffFile(worktreeId, input.path, { staged: input.staged })
        : await openFile(worktreeId, input.path);
    await focusOrca();
    return {
      opened: result.opened ?? true,
      path: result.relativePath ?? input.path,
      kind: result.kind,
      mode,
      worktreeId,
    };
  });
}
