import { Tool } from "@raycast/api";
import { createWorktree } from "../lib/api";
import { slimWorktree } from "../lib/format";
import { defaultAgent } from "../lib/preferences";
import { AgentId } from "../lib/types";
import { withOrca } from "./shared/errors";
import { repoLabel, resolveRepo } from "./shared/resolve";

type Input = {
  /**
   * Name of the new worktree, for example "fix-links". Orca also derives the branch name from it,
   * so keep it short and use hyphens instead of spaces.
   */
  name: string;
  /**
   * The id of the project to branch from, taken from the `id` field of list-projects, for example
   * "708c994c-a14d-4af5-82a6-2cd05d3b390a". Preferred over repoName.
   */
  repoId?: string;
  /**
   * The display name of the project to branch from, for example "web-app". Only use this when
   * you do not have the id; it is matched against the Orca project list.
   */
  repoName?: string;
  /**
   * The agent to start in the first terminal of the worktree. Pass "none" to create an empty
   * worktree. When omitted the user's default agent preference is used.
   */
  agent?: "claude" | "codex" | "omp" | "pi" | "grok" | "none";
  /**
   * The task to give the agent, written as an instruction, for example "Tidy up the broken links in
   * the notes". Ignored when no agent is started.
   */
  prompt?: string;
  /**
   * Branch or ref to branch from, for example "main". Defaults to the project's default branch.
   */
  baseBranch?: string;
  /**
   * Optional note to store on the worktree, shown next to it in the Orca sidebar.
   */
  comment?: string;
  /**
   * Whether Orca should reveal the new worktree in its user interface. Defaults to true.
   */
  activate?: boolean;
};

export default async function tool(input: Input) {
  return withOrca(async () => {
    const repo = await resolveRepo(input);
    const agent = chosenAgent(input.agent);
    const result = await createWorktree({
      name: input.name,
      repo: repo.id,
      agent,
      prompt: agent ? input.prompt : undefined,
      baseBranch: input.baseBranch,
      comment: input.comment,
      noParent: true,
      activate: input.activate ?? true,
    });
    return {
      worktree: slimWorktree(result.worktree),
      repo: repo.displayName,
      agent: agent ?? "none",
      agentTerminalHandle: result.agentTerminalHandle ?? undefined,
      startupTerminalHandle: result.startupTerminal?.handle,
    };
  });
}

export const confirmation: Tool.Confirmation<Input> = async (input) => {
  const agent = chosenAgent(input.agent);
  return {
    message: `Create the worktree "${input.name}"?`,
    info: [
      { name: "Project", value: await repoLabel(input) },
      { name: "Agent", value: agent ?? "none" },
      { name: "Prompt", value: agent ? input.prompt : undefined },
      { name: "Base branch", value: input.baseBranch },
      { name: "Comment", value: input.comment },
    ],
  };
};

function chosenAgent(requested: Input["agent"]): AgentId | undefined {
  if (!requested) {
    return defaultAgent();
  }
  return requested === "none" ? undefined : requested;
}
