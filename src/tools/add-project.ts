import { Tool } from "@raycast/api";
import { slimRepo } from "../lib/format";
import { expandHome } from "../lib/preferences";
import { addProjectFromFolder } from "../lib/projects";
import { withOrca } from "./shared/errors";

type Input = {
  /**
   * Path of the folder to register with Orca, for example "/Users/me/Development/my-app".
   * A leading "~" is expanded to the home directory. The folder has to exist already.
   */
  path: string;
  /**
   * Set to true to run `git init` in the folder first when it is not a git repository yet.
   * Defaults to false, which registers a non-git folder as a plain folder project.
   */
  initGit?: boolean;
};

export default async function tool(input: Input) {
  return withOrca(async () => {
    const added = await addProjectFromFolder({ path: expandHome(input.path), initGit: input.initGit });
    return {
      path: added.path,
      initialisedGit: added.initialisedGit,
      repo: added.repo ? slimRepo(added.repo) : undefined,
    };
  });
}

export const confirmation: Tool.Confirmation<Input> = async (input) => ({
  message: `Register "${expandHome(input.path)}" with Orca as a project?`,
  info: [
    { name: "Folder", value: expandHome(input.path) },
    { name: "Initialise git", value: input.initGit ? "yes" : undefined },
  ],
});
