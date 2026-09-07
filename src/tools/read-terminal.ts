import { readTerminal } from "../lib/api";
import { slimTerminalRead } from "../lib/format";
import { withOrca } from "./shared/errors";

const DEFAULT_MAX_LINES = 200;
const HARD_MAX_LINES = 500;

type Input = {
  /**
   * The terminal handle, for example "term_c9d7d8d1-b6c2-4071-8ae2-439dd2da422d". Handles only come
   * from list-terminals.
   */
  handle: string;
  /**
   * "screen" returns the rendered screen, which is what you want for questions about what a
   * session or agent shows right now. "scrollback" returns the accumulated output instead, which
   * suits reading what a command emitted over time; page through it with `cursor`. Defaults to
   * "screen". The `source` field of the result says which one you got.
   */
  mode?: "screen" | "scrollback";
  /**
   * Maximum number of lines to return, between 1 and 500. Defaults to 200.
   */
  maxLines?: number;
  /**
   * Scrollback only: the `nextCursor` value from a previous read, to continue where it stopped.
   */
  cursor?: string;
};

export default async function tool(input: Input) {
  return withOrca(async () => {
    const maxLines = clamp(input.maxLines ?? DEFAULT_MAX_LINES, 1, HARD_MAX_LINES);
    const screen = (input.mode ?? "screen") === "screen";
    const read = await readTerminal(input.handle, {
      screen,
      limit: screen ? undefined : maxLines,
      cursor: screen ? undefined : input.cursor,
    });
    return slimTerminalRead(read, maxLines);
  });
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(Math.round(value), min), max);
}
