import { Action, Icon } from "@raycast/api";
import { switchTerminal } from "../lib/api";
import { handOffToOrca } from "./feedback";

export function SwitchToTerminalAction({ handle }: { handle: string }) {
  return (
    <Action
      title="Switch to Terminal"
      icon={Icon.Window}
      onAction={() => handOffToOrca("Could not switch to the terminal", () => switchTerminal(handle))}
    />
  );
}
