import { Action, Icon } from "@raycast/api";
import { openOrcaWithToast } from "./feedback";

export function OpenOrcaAction() {
  return <Action title="Open Orca" icon={Icon.AppWindow} onAction={openOrcaWithToast} />;
}
