import { Action, ActionPanel, Alert, Color, Icon, Keyboard, List, confirmAlert } from "@raycast/api";
import { getFavicon } from "@raycast/utils";
import { handOffToOrca, runWithToast } from "./components/feedback";
import { OpenBrowserTabForm } from "./open-browser-tab";
import { OpenOrcaAction } from "./components/open-orca-action";
import { useOrcaList } from "./hooks/use-orca-data";
import { useActiveWorktrees } from "./hooks/use-worktrees";
import { closeTab, listTabs, switchTab } from "./lib/api";
import { groupBy } from "./lib/format";
import { shortenWorktreeId } from "./lib/selectors";
import { BrowserTab } from "./lib/types";

export default function Command() {
  const { data: tabs, isLoading, revalidate } = useOrcaList<BrowserTab>(() => listTabs("all"));
  const { worktrees } = useActiveWorktrees();
  const names = new Map(worktrees.map((worktree) => [worktree.worktreeId, worktree.displayName]));

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Search browser tabs">
      {tabs.length === 0 && !isLoading ? (
        <List.EmptyView
          icon={Icon.Globe}
          title="No browser tabs"
          description="The Orca browser has no tabs open. Open one to get started."
          actions={
            <ActionPanel>
              <Action.Push title="New Tab" icon={Icon.Plus} target={<OpenBrowserTabForm />} />
              <OpenOrcaAction />
              <Action title="Refresh" icon={Icon.ArrowClockwise} onAction={revalidate} />
            </ActionPanel>
          }
        />
      ) : (
        groupBy(tabs, (tab) => names.get(tab.worktreeId) ?? shortenWorktreeId(tab.worktreeId)).map(([title, items]) => (
          <List.Section key={title} title={title} subtitle={`${items.length}`}>
            {items.map((tab) => (
              <TabItem key={tab.browserPageId} tab={tab} revalidate={revalidate} />
            ))}
          </List.Section>
        ))
      )}
    </List>
  );
}

function TabItem({ tab, revalidate }: { tab: BrowserTab; revalidate: () => void }) {
  return (
    <List.Item
      icon={getFavicon(tab.url, { fallback: Icon.Globe })}
      title={tab.title || tab.url}
      subtitle={tab.url}
      accessories={accessories(tab)}
      actions={
        <ActionPanel>
          <ActionPanel.Section>
            <Action
              title="Switch to Tab"
              icon={Icon.Window}
              onAction={() =>
                handOffToOrca("Could not switch to the tab", () =>
                  switchTab(tab.worktreeId, { page: tab.browserPageId, focus: true }),
                )
              }
            />
            <Action.Push
              title="New Tab"
              icon={Icon.Plus}
              shortcut={Keyboard.Shortcut.Common.New}
              target={<OpenBrowserTabForm worktreeId={tab.worktreeId} />}
            />
            <Action.CopyToClipboard title="Copy URL" content={tab.url} shortcut={Keyboard.Shortcut.Common.Copy} />
            <Action.OpenInBrowser url={tab.url} shortcut={Keyboard.Shortcut.Common.Open} />
          </ActionPanel.Section>
          <ActionPanel.Section>
            <Action
              title="Refresh"
              icon={Icon.ArrowClockwise}
              shortcut={Keyboard.Shortcut.Common.Refresh}
              onAction={revalidate}
            />
            <Action
              title="Close Tab"
              icon={Icon.XMarkCircle}
              style={Action.Style.Destructive}
              shortcut={Keyboard.Shortcut.Common.Remove}
              onAction={() => closeWithConfirmation(tab, revalidate)}
            />
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
}

function accessories(tab: BrowserTab): List.Item.Accessory[] {
  const active: List.Item.Accessory[] = tab.active ? [{ tag: { value: "active", color: Color.Green } }] : [];
  const failed: List.Item.Accessory[] = tab.loadError
    ? [{ icon: { source: Icon.Warning, tintColor: Color.Red }, tooltip: tab.loadError }]
    : [];
  return [...failed, ...active, { text: `#${tab.index + 1}` }];
}

async function closeWithConfirmation(tab: BrowserTab, onClosed: () => void): Promise<void> {
  const confirmed = await confirmAlert({
    title: `Close ${tab.title || tab.url}?`,
    message: "The tab is closed in the Orca browser.",
    icon: Icon.XMarkCircle,
    primaryAction: { title: "Close Tab", style: Alert.ActionStyle.Destructive },
  });
  if (!confirmed) {
    return;
  }
  const closed = await runWithToast(
    { pending: "Closing tab", success: "Tab closed", failure: "Could not close the tab" },
    () => closeTab(tab.worktreeId, { page: tab.browserPageId }),
  );
  if (closed) {
    onClosed();
  }
}
