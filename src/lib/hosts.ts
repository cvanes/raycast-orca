import { Host } from "./types";

export function canCloneToHost(host: Host): boolean {
  return host.kind !== "ssh";
}

export function hostArgument(host: Host): string {
  return host.selector.replace(/^--host\s+/, "").trim() || host.id;
}
