import { Action, Icon } from "@raycast/api";
import { revealWorktree } from "../lib/app";
import { pathSelector } from "../lib/selectors";
import { handOffToOrca } from "./feedback";

export function openProjectInOrca(path: string): Promise<void> {
  return revealWorktree(pathSelector(path));
}

export function OpenProjectAction({ path }: { path: string }) {
  return (
    <Action
      title="Open in Orca"
      icon={Icon.AppWindow}
      onAction={() => handOffToOrca("Could not open Orca", () => openProjectInOrca(path))}
    />
  );
}
