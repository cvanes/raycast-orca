import { useState } from "react";
import { Action, ActionPanel, Form, Icon, Toast, popToRoot, showToast } from "@raycast/api";
import { usePromise, showFailureToast } from "@raycast/utils";
import { openProjectInOrca } from "./components/open-project-action";
import { isGitRepo } from "./lib/git";
import { errorMessage } from "./lib/orca";
import { addProjectFromFolder } from "./lib/projects";

export function AddProjectForm() {
  const [folder, setFolder] = useState<string | undefined>();
  const [initGit, setInitGit] = useState(false);
  const { data: alreadyGit } = usePromise(async (dir?: string) => (dir ? isGitRepo(dir) : true), [folder]);
  const canInitGit = Boolean(folder) && alreadyGit === false;

  async function submit() {
    if (!folder) {
      await showFailureToast("Choose a folder first", { title: "No folder selected" });
      return;
    }
    const toast = await showToast({ style: Toast.Style.Animated, title: "Adding project" });
    try {
      const added = await addProjectFromFolder({ path: folder, initGit: canInitGit && initGit });
      toast.style = Toast.Style.Success;
      toast.title = added.initialisedGit ? "Initialised git and added project" : "Project added";
      toast.message = added.repo?.displayName ?? added.path;
      toast.primaryAction = { title: "Open in Orca", onAction: () => void openProjectInOrca(added.path) };
      await popToRoot();
    } catch (error) {
      toast.style = Toast.Style.Failure;
      toast.title = "Could not add project";
      toast.message = errorMessage(error);
    }
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Add Project" icon={Icon.Plus} onSubmit={submit} />
        </ActionPanel>
      }
    >
      <Form.FilePicker
        id="folder"
        title="Folder"
        allowMultipleSelection={false}
        canChooseDirectories
        canChooseFiles={false}
        value={folder ? [folder] : []}
        onChange={(paths) => setFolder(paths[0])}
        info="Orca infers the project identity from the folder's git remote."
      />
      {canInitGit ? (
        <Form.Checkbox
          id="initGit"
          label="Initialise as git repository"
          value={initGit}
          onChange={setInitGit}
          info="This folder is not a git repository yet. Orca registers it as a plain folder unless you run git init."
        />
      ) : null}
    </Form>
  );
}

export default function Command() {
  return <AddProjectForm />;
}
