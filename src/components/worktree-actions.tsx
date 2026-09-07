import { Action, ActionPanel, Alert, Icon, Keyboard, confirmAlert } from "@raycast/api";
import { showFailureToast } from "@raycast/utils";
import { CreateWorktreeForm } from "../create-worktree";
import { removeWorktree, setWorktree } from "../lib/api";
import { revealWorktree } from "../lib/app";
import { workspaceStatusIcon } from "../lib/format";
import { errorMessage } from "../lib/orca";
import { WORKSPACE_STATUSES, WorktreeSummary } from "../lib/types";
import { CreateTerminalForm } from "./create-terminal-form";
import { EditWorktreeForm } from "./edit-worktree-form";
import { handOffToOrca, runWithToast } from "./feedback";
import { OpenBrowserTabForm } from "../open-browser-tab";
import { OpenFileForm } from "../open-file";
import { SendPromptForm } from "./send-prompt-form";

interface Props {
  worktree: WorktreeSummary;
  revalidate: () => void;
  onToggleDetail: () => void;
}

export function WorktreeActions({ worktree, revalidate, onToggleDetail }: Props) {
  return (
    <ActionPanel>
      <ActionPanel.Section>
        <Action
          title="Open in Orca"
          icon={Icon.AppWindow}
          onAction={() => handOffToOrca("Could not open Orca", () => revealWorktree(worktree.worktreeId))}
        />
        <Action.Push
          title="Send Prompt to Agent"
          icon={Icon.Message}
          shortcut={{ modifiers: ["cmd", "shift"], key: "p" }}
          target={<SendPromptForm worktreeId={worktree.worktreeId} />}
        />
        <Action.Push
          title="New Terminal"
          icon={Icon.Terminal}
          shortcut={Keyboard.Shortcut.Common.New}
          target={<CreateTerminalForm worktreeId={worktree.worktreeId} onCreated={revalidate} />}
        />
        <Action
          title="Toggle Details"
          icon={Icon.Sidebar}
          shortcut={{ modifiers: ["cmd", "shift"], key: "d" }}
          onAction={onToggleDetail}
        />
      </ActionPanel.Section>

      <ActionPanel.Section>
        <Action.Push
          title="Edit Worktree"
          icon={Icon.Pencil}
          shortcut={Keyboard.Shortcut.Common.Edit}
          target={<EditWorktreeForm worktree={worktree} onSaved={revalidate} />}
        />
        <ActionPanel.Submenu
          title="Set Workspace Status"
          icon={Icon.CircleProgress}
          shortcut={Keyboard.Shortcut.Common.Duplicate}
        >
          {WORKSPACE_STATUSES.map((status) => (
            <Action
              key={status}
              title={status}
              icon={workspaceStatusIcon(status)}
              onAction={async () => {
                const saved = await runWithToast(
                  { pending: "Updating status", success: `Status set to ${status}`, failure: "Could not set status" },
                  () => setWorktree(worktree.worktreeId, { workspaceStatus: status }),
                );
                if (saved) {
                  revalidate();
                }
              }}
            />
          ))}
        </ActionPanel.Submenu>
        <Action.Push
          title="Open File in Orca"
          icon={Icon.Document}
          shortcut={Keyboard.Shortcut.Common.Open}
          target={<OpenFileForm worktreeId={worktree.worktreeId} />}
        />
        <Action.Push
          title="Open Browser Tab"
          icon={Icon.Globe}
          shortcut={{ modifiers: ["cmd"], key: "b" }}
          target={<OpenBrowserTabForm worktreeId={worktree.worktreeId} />}
        />
      </ActionPanel.Section>

      <ActionPanel.Section>
        <Action.ShowInFinder path={worktree.path} />
        <Action.CopyToClipboard
          title="Copy Path"
          content={worktree.path}
          shortcut={Keyboard.Shortcut.Common.CopyPath}
        />
        <Action.CopyToClipboard
          title="Copy Worktree ID"
          content={worktree.worktreeId}
          shortcut={Keyboard.Shortcut.Common.Copy}
        />
      </ActionPanel.Section>

      <ActionPanel.Section>
        <Action.Push
          title="Create Worktree"
          icon={Icon.Plus}
          shortcut={{ modifiers: ["cmd", "shift"], key: "n" }}
          target={<CreateWorktreeForm repoId={worktree.repoId} />}
        />
        <Action
          title="Refresh"
          icon={Icon.ArrowClockwise}
          shortcut={Keyboard.Shortcut.Common.Refresh}
          onAction={revalidate}
        />
        <Action
          title="Remove Worktree"
          icon={Icon.Trash}
          style={Action.Style.Destructive}
          shortcut={Keyboard.Shortcut.Common.Remove}
          onAction={() => removeWithConfirmation(worktree, revalidate)}
        />
      </ActionPanel.Section>
    </ActionPanel>
  );
}

async function removeWithConfirmation(worktree: WorktreeSummary, onRemoved: () => void): Promise<void> {
  const confirmed = await confirmAlert({
    title: `Remove ${worktree.displayName}?`,
    message: "This deletes the checkout and tries to delete its branch.",
    icon: Icon.Trash,
    primaryAction: { title: "Remove", style: Alert.ActionStyle.Destructive },
  });
  if (!confirmed) {
    return;
  }
  try {
    await removeWorktree(worktree.worktreeId);
    onRemoved();
  } catch (error) {
    await forceRemove(worktree, error, onRemoved);
  }
}

async function forceRemove(worktree: WorktreeSummary, error: unknown, onRemoved: () => void): Promise<void> {
  const forced = await confirmAlert({
    title: "Removal failed",
    message: `${errorMessage(error)}\n\nRemove it forcefully?`,
    icon: Icon.Trash,
    primaryAction: { title: "Force Remove", style: Alert.ActionStyle.Destructive },
  });
  if (!forced) {
    await showFailureToast(error, { title: "Could not remove worktree" });
    return;
  }
  const removed = await runWithToast(
    { pending: "Removing worktree", success: "Worktree removed", failure: "Could not remove worktree" },
    () => removeWorktree(worktree.worktreeId, { force: true }),
  );
  if (removed) {
    onRemoved();
  }
}
