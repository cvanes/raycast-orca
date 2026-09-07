import { List } from "@raycast/api";
import { activityColour, agentActivity, relativeTime, truncate, workspaceStatusIcon } from "../lib/format";
import { branchName } from "../lib/selectors";
import { WorktreeAgent, WorktreeSummary } from "../lib/types";

const FENCE = "````";

export function WorktreeDetail({ worktree }: { worktree: WorktreeSummary }) {
  const activity = agentActivity(worktree);
  return (
    <List.Item.Detail
      markdown={detailMarkdown(worktree)}
      metadata={
        <List.Item.Detail.Metadata>
          <List.Item.Detail.Metadata.Label title="Repo" text={worktree.repo} />
          <List.Item.Detail.Metadata.Label title="Branch" text={branchName(worktree.branch)} />
          <List.Item.Detail.Metadata.Label title="Path" text={worktree.path} />
          <List.Item.Detail.Metadata.Label
            title="Workspace Status"
            text={worktree.workspaceStatus}
            icon={workspaceStatusIcon(worktree.workspaceStatus)}
          />
          <List.Item.Detail.Metadata.TagList title="Agents">
            <List.Item.Detail.Metadata.TagList.Item text={activity} color={activityColour(activity)} />
          </List.Item.Detail.Metadata.TagList>
          <List.Item.Detail.Metadata.Label title="Live Terminals" text={String(worktree.liveTerminalCount)} />
          <List.Item.Detail.Metadata.Label
            title="Last Activity"
            text={relativeTime(worktree.lastOutputAt ?? worktree.lastActivityAt)}
          />
          {worktree.comment ? <List.Item.Detail.Metadata.Label title="Comment" text={worktree.comment} /> : null}
        </List.Item.Detail.Metadata>
      }
    />
  );
}

function detailMarkdown(worktree: WorktreeSummary): string {
  const preview = worktree.preview?.trim();
  return [
    `## ${worktree.displayName}`,
    worktree.comment ? `> ${worktree.comment}` : undefined,
    "### Agents",
    worktree.agents.length > 0 ? worktree.agents.map(agentMarkdown).join("\n") : "No agents are attached.",
    preview ? ["### Latest Output", FENCE, preview, FENCE].join("\n") : undefined,
  ]
    .filter(Boolean)
    .join("\n\n");
}

function agentMarkdown(agent: WorktreeAgent): string {
  const task = truncate(agent.taskTitle ?? agent.prompt, 160) ?? "no task title";
  const message = truncate(agent.lastAssistantMessage, 240);
  const tool = agent.toolName ? ` (${agent.toolName})` : "";
  return [`- **${agent.agentType}** · ${agent.state}${tool} · ${task}`, message ? `  - ${message}` : undefined]
    .filter(Boolean)
    .join("\n");
}
