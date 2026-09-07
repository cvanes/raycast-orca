import { Tool } from "@raycast/api";
import { sendToTerminal } from "../lib/api";
import { truncate } from "../lib/format";
import { withOrca } from "./shared/errors";
import { terminalLabel } from "./shared/resolve";

type Input = {
  /**
   * The terminal handle, for example "term_c9d7d8d1-b6c2-4071-8ae2-439dd2da422d". Handles only come
   * from list-terminals. When the terminal has an `agentIdentity` the text is typed to that agent.
   */
  handle: string;
  /**
   * The text to type into the terminal: a shell command for a plain shell, or an instruction for a
   * running agent, for example "Run the tests and fix anything that fails".
   */
  text: string;
  /**
   * Whether to press Enter after the text so it is submitted. Defaults to true.
   */
  enter?: boolean;
  /**
   * Set to true to interrupt whatever the terminal is doing before typing, which is needed when an
   * agent is mid-task. Defaults to false.
   */
  interrupt?: boolean;
};

export default async function tool(input: Input) {
  return withOrca(async () => {
    const result = await sendToTerminal(input.handle, input.text, {
      enter: input.enter ?? true,
      interrupt: input.interrupt,
    });
    return { handle: result.handle, accepted: result.accepted, bytesWritten: result.bytesWritten };
  });
}

export const confirmation: Tool.Confirmation<Input> = async (input) => ({
  message: `Send this text to the terminal "${await terminalLabel(input.handle)}"?`,
  info: [
    { name: "Text", value: truncate(input.text, 300) },
    { name: "Press Enter", value: input.enter === false ? "no" : "yes" },
    { name: "Interrupt first", value: input.interrupt ? "yes" : undefined },
  ],
});
