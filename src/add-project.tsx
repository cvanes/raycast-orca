import { useState } from "react";
import { Action, ActionPanel, Form, Icon, Toast, showToast } from "@raycast/api";
import { usePromise, showFailureToast } from "@raycast/utils";
import { finishInOrca } from "./components/feedback";
import { revealProject } from "./lib/app";
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
      const name = added.repo?.displayName ?? added.path;
      await toast.hide();
      await finishInOrca(added.initialisedGit ? `Initialised git and added ${name}` : `Added ${name}`, () =>
        revealProject(added.path),
      );
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
