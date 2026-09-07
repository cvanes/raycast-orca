import { Tool } from "@raycast/api";
import { slimRepo } from "../lib/format";
import { defaultCloneDirectory, expandHome } from "../lib/preferences";
import { cloneProject } from "../lib/projects";
import { withOrca } from "./shared/errors";

type Input = {
  /**
   * Clone URL of the repository, either https or ssh, for example
   * "https://github.com/raycast/extensions.git". Use search-github-repos to turn a repo name into
   * a clone URL when the user does not give one.
   */
  url: string;
  /**
   * Parent directory to clone into, for example "/Users/me/Development". A leading "~" is
   * expanded. The repository is cloned into a subfolder of it named after the repository. Defaults
   * to the clone directory configured in the extension preferences.
   */
  destination?: string;
  /**
   * Id of the host to clone on, from list-hosts. Defaults to "local", this machine. SSH hosts
   * cannot be cloned to from here.
   */
  hostId?: string;
  /**
   * Display name for the project in Orca. Defaults to the repository name.
   */
  displayName?: string;
};

function destinationOf(input: Input): string {
  const configured = input.destination?.trim();
  return configured ? expandHome(configured) : defaultCloneDirectory();
}

export default async function tool(input: Input) {
  return withOrca(async () => {
    const cloned = await cloneProject({
      source: { url: input.url },
      hostId: input.hostId,
      destination: destinationOf(input),
      displayName: input.displayName,
    });
    return {
      path: cloned.path,
      projectId: cloned.projectId,
      clonedByOrca: cloned.clonedByOrca,
      repo: cloned.repo ? slimRepo(cloned.repo) : undefined,
    };
  });
}

export const confirmation: Tool.Confirmation<Input> = async (input) => ({
  message: `Clone ${input.url} into ${destinationOf(input)}?`,
  info: [
    { name: "Clone URL", value: input.url },
    { name: "Destination", value: destinationOf(input) },
    { name: "Host", value: input.hostId ?? "local" },
    { name: "Display name", value: input.displayName },
  ],
});
