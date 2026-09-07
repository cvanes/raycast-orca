import { Icon, List } from "@raycast/api";
import { activityColour, agentActivity, relativeTime, workspaceStatusIcon } from "../lib/format";
import { branchName } from "../lib/selectors";
import { WorktreeSummary } from "../lib/types";
import { WorktreeActions } from "./worktree-actions";
import { WorktreeDetail } from "./worktree-detail";

interface Props {
  worktree: WorktreeSummary;
  showDetail: boolean;
  onToggleDetail: () => void;
  revalidate: () => void;
}

export function WorktreeListItem({ worktree, showDetail, onToggleDetail, revalidate }: Props) {
  return (
    <List.Item
      icon={workspaceStatusIcon(worktree.workspaceStatus)}
      title={worktree.displayName}
      subtitle={showDetail ? undefined : branchName(worktree.branch)}
      keywords={[worktree.repo, branchName(worktree.branch)]}
      accessories={accessories(worktree, showDetail)}
      detail={showDetail ? <WorktreeDetail worktree={worktree} /> : undefined}
      actions={<WorktreeActions worktree={worktree} revalidate={revalidate} onToggleDetail={onToggleDetail} />}
    />
  );
}

function accessories(worktree: WorktreeSummary, showDetail: boolean): List.Item.Accessory[] {
  const activity = agentActivity(worktree);
  const tag: List.Item.Accessory = {
    tag: { value: activity, color: activityColour(activity) },
    tooltip: `Agent status: ${activity}`,
  };
  if (showDetail) {
    return [tag];
  }
  const terminals: List.Item.Accessory[] =
    worktree.liveTerminalCount > 0
      ? [{ icon: Icon.Terminal, text: String(worktree.liveTerminalCount), tooltip: "Live terminals" }]
      : [];
  const lastActivity: List.Item.Accessory = {
    text: relativeTime(worktree.lastOutputAt ?? worktree.lastActivityAt),
    tooltip: "Last activity",
  };
  return [tag, ...terminals, lastActivity];
}
