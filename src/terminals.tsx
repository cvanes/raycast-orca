import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { OpenOrcaAction } from "./components/open-orca-action";
import { TerminalListItem } from "./components/terminal-list-item";
import { useOrcaList } from "./hooks/use-orca-data";
import { listTerminals } from "./lib/api";
import { groupBy } from "./lib/format";
import { branchName, folderName } from "./lib/selectors";
import { Terminal } from "./lib/types";

export default function Command() {
  const { data: terminals, isLoading, revalidate } = useOrcaList<Terminal>(() => listTerminals());

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Search terminals">
      {terminals.length === 0 && !isLoading ? (
        <List.EmptyView
          icon={Icon.Terminal}
          title="No terminals"
          description="Orca has no live terminals right now."
          actions={
            <ActionPanel>
              <OpenOrcaAction />
              <Action title="Refresh" icon={Icon.ArrowClockwise} onAction={revalidate} />
            </ActionPanel>
          }
        />
      ) : (
        groupBy(terminals, sectionTitle).map(([title, items]) => (
          <List.Section key={title} title={title} subtitle={`${items.length}`}>
            {items.map((terminal) => (
              <TerminalListItem key={terminal.handle} terminal={terminal} revalidate={revalidate} />
            ))}
          </List.Section>
        ))
      )}
    </List>
  );
}

function sectionTitle(terminal: Terminal): string {
  return `${folderName(terminal.worktreePath)} · ${branchName(terminal.branch)}`;
}
