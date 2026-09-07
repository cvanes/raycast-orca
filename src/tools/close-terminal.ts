import { Action, Tool } from "@raycast/api";
import { closeTerminal } from "../lib/api";
import { withOrca } from "./shared/errors";
import { terminalLabel } from "./shared/resolve";

type Input = {
  /**
   * The terminal handle, for example "term_c9d7d8d1-b6c2-4071-8ae2-439dd2da422d". Handles only come
   * from list-terminals.
   */
  handle: string;
};

export default async function tool(input: Input) {
  return withOrca(async () => {
    const result = await closeTerminal(input.handle);
    return { handle: result.handle, closed: true, ptyKilled: result.ptyKilled };
  });
}

export const confirmation: Tool.Confirmation<Input> = async (input) => ({
  style: Action.Style.Destructive,
  message: `Close the terminal "${await terminalLabel(input.handle)}"? Anything running in it is killed.`,
  info: [{ name: "Terminal", value: input.handle }],
});
