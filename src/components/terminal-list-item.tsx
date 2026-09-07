import { Action, ActionPanel, Alert, Color, Icon, Keyboard, List, confirmAlert } from "@raycast/api";
import { closeTerminal } from "../lib/api";
import { agentIcon, relativeTime, truncate } from "../lib/format";
import { Terminal } from "../lib/types";
import { runWithToast } from "./feedback";
import { OpenOrcaAction } from "./open-orca-action";
import { RenameTerminalForm } from "./rename-terminal-form";
import { SendTextForm } from "./send-text-form";
import { SwitchToTerminalAction } from "./switch-to-terminal-action";
import { TerminalOutputDetail } from "./terminal-output-detail";

export function TerminalListItem({ terminal, revalidate }: { terminal: Terminal; revalidate: () => void }) {
  return (
    <List.Item
      icon={agentIcon(terminal.agentIdentity)}
      title={terminal.title || terminal.handle}
      subtitle={truncate(terminal.preview, 80)}
      accessories={accessories(terminal)}
      actions={
        <ActionPanel>
          <ActionPanel.Section>
            <SwitchToTerminalAction handle={terminal.handle} />
            <Action.Push
              title="Read Output"
              icon={Icon.Eye}
              shortcut={Keyboard.Shortcut.Common.ToggleQuickLook}
              target={<TerminalOutputDetail terminal={terminal} />}
            />
            <Action.Push
              title="Send Text"
              icon={Icon.Text}
              shortcut={{ modifiers: ["cmd"], key: "t" }}
              target={<SendTextForm terminals={[terminal]} defaultHandle={terminal.handle} />}
            />
          </ActionPanel.Section>
          <ActionPanel.Section>
            <Action.Push
              title="Rename Terminal"
              icon={Icon.Pencil}
              shortcut={Keyboard.Shortcut.Common.Edit}
              target={<RenameTerminalForm handle={terminal.handle} title={terminal.title} onRenamed={revalidate} />}
            />
            <Action.CopyToClipboard
              title="Copy Handle"
              content={terminal.handle}
              shortcut={Keyboard.Shortcut.Common.Copy}
            />
            <Action.CopyToClipboard
              title="Copy Worktree Path"
              content={terminal.worktreePath}
              shortcut={Keyboard.Shortcut.Common.CopyPath}
            />
          </ActionPanel.Section>
          <ActionPanel.Section>
            <Action
              title="Refresh"
              icon={Icon.ArrowClockwise}
              shortcut={Keyboard.Shortcut.Common.Refresh}
              onAction={revalidate}
            />
            <OpenOrcaAction />
            <Action
              title="Close Terminal"
              icon={Icon.XMarkCircle}
              style={Action.Style.Destructive}
              shortcut={Keyboard.Shortcut.Common.Remove}
              onAction={() => closeWithConfirmation(terminal, revalidate)}
            />
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
}

function accessories(terminal: Terminal): List.Item.Accessory[] {
  const agent: List.Item.Accessory[] = terminal.agentIdentity
    ? [{ tag: { value: terminal.agentIdentity, color: Color.Purple } }]
    : [];
  const connection: List.Item.Accessory[] = terminal.connected
    ? []
    : [{ icon: { source: Icon.CircleDisabled, tintColor: Color.Red }, tooltip: "Disconnected" }];
  return [...agent, ...connection, { text: relativeTime(terminal.lastOutputAt), tooltip: "Last output" }];
}

async function closeWithConfirmation(terminal: Terminal, onClosed: () => void): Promise<void> {
  const confirmed = await confirmAlert({
    title: `Close ${terminal.title || terminal.handle}?`,
    message: "The terminal and whatever runs inside it are killed.",
    icon: Icon.XMarkCircle,
    primaryAction: { title: "Close Terminal", style: Alert.ActionStyle.Destructive },
  });
  if (!confirmed) {
    return;
  }
  const closed = await runWithToast(
    { pending: "Closing terminal", success: "Terminal closed", failure: "Could not close the terminal" },
    () => closeTerminal(terminal.handle),
  );
  if (closed) {
    onClosed();
  }
}
