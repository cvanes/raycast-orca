import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { useState } from "react";
import { OpenOrcaAction } from "./components/open-orca-action";
import { WorktreeListItem } from "./components/worktree-list-item";
import { CreateWorktreeForm } from "./create-worktree";
import { useWorktrees } from "./hooks/use-worktrees";
import { agentActivity, groupBy } from "./lib/format";
import { WorktreeSummary } from "./lib/types";

type Filter = "all" | "working" | "waiting" | "archived";

export default function Command() {
  const { worktrees, isLoading, revalidate } = useWorktrees();
  const [filter, setFilter] = useState<Filter>("all");
  const [showDetail, setShowDetail] = useState(false);
  const visible = filterWorktrees(worktrees, filter);

  return (
    <List
      isLoading={isLoading}
      isShowingDetail={showDetail && visible.length > 0}
      searchBarPlaceholder="Search worktrees"
      searchBarAccessory={
        <List.Dropdown tooltip="Filter worktrees" value={filter} onChange={(value) => setFilter(value as Filter)}>
          <List.Dropdown.Item value="all" title="All Worktrees" icon={Icon.List} />
          <List.Dropdown.Item value="working" title="With Running Agents" icon={Icon.CircleProgress} />
          <List.Dropdown.Item value="waiting" title="Waiting for Input" icon={Icon.QuestionMark} />
          <List.Dropdown.Item value="archived" title="Archived" icon={Icon.Tray} />
        </List.Dropdown>
      }
    >
      {visible.length === 0 && !isLoading ? (
        <List.EmptyView
          icon={Icon.Layers}
          title="No worktrees"
          description="Start Orca or create a worktree to get going."
          actions={
            <ActionPanel>
              <Action.Push title="Create Worktree" icon={Icon.Plus} target={<CreateWorktreeForm />} />
              <OpenOrcaAction />
              <Action title="Refresh" icon={Icon.ArrowClockwise} onAction={revalidate} />
            </ActionPanel>
          }
        />
      ) : (
        groupBy(visible, (worktree) => worktree.repo).map(([repo, items]) => (
          <List.Section key={repo} title={repo} subtitle={`${items.length}`}>
            {items.map((worktree) => (
              <WorktreeListItem
                key={worktree.worktreeId}
                worktree={worktree}
                showDetail={showDetail}
                onToggleDetail={() => setShowDetail((current) => !current)}
                revalidate={revalidate}
              />
            ))}
          </List.Section>
        ))
      )}
    </List>
  );
}

function filterWorktrees(worktrees: WorktreeSummary[], filter: Filter): WorktreeSummary[] {
  if (filter === "archived") {
    return worktrees.filter((worktree) => worktree.isArchived);
  }
  const active = worktrees.filter((worktree) => !worktree.isArchived);
  if (filter === "all") {
    return active;
  }
  return active.filter((worktree) => agentActivity(worktree) === filter);
}
