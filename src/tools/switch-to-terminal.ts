import { switchTerminal } from "../lib/api";
import { focusOrca } from "../lib/app";
import { withOrca } from "./shared/errors";

type Input = {
  /**
   * The terminal handle, for example "term_c9d7d8d1-b6c2-4071-8ae2-439dd2da422d". Handles only come
   * from list-terminals.
   */
  handle: string;
};

export default async function tool(input: Input) {
  return withOrca(async () => {
    const focus = await switchTerminal(input.handle);
    await focusOrca();
    return { handle: focus.handle, worktreeId: focus.worktreeId, switched: true };
  });
}
