import { listHosts } from "../lib/api";
import { canCloneToHost, hostArgument } from "../lib/hosts";
import { withOrca } from "./shared/errors";

export default async function tool() {
  return withOrca(async () => ({
    hosts: (await listHosts()).map((host) => ({
      id: hostArgument(host),
      name: host.name,
      kind: host.kind,
      canClone: canCloneToHost(host),
    })),
  }));
}
