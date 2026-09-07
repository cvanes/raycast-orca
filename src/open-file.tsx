import { Action, ActionPanel, Form, Icon } from "@raycast/api";
import { FormValidation, useForm } from "@raycast/utils";
import { useRef } from "react";
import { handOffToOrca } from "./components/feedback";
import { WorktreeDropdown } from "./components/worktree-dropdown";
import { useActiveWorktrees } from "./hooks/use-worktrees";
import { diffFile, openFile } from "./lib/api";

type Mode = "edit" | "diff";

interface Values {
  worktree: string;
  path: string;
}

export function OpenFileForm({ worktreeId }: { worktreeId?: string }) {
  const { worktrees, isLoading } = useActiveWorktrees();
  const mode = useRef<Mode>("edit");
  const { handleSubmit, itemProps } = useForm<Values>({
    async onSubmit(values) {
      await handOffToOrca("Could not open the file", () =>
        mode.current === "diff" ? diffFile(values.worktree, values.path) : openFile(values.worktree, values.path),
      );
    },
    initialValues: { worktree: worktreeId },
    validation: { worktree: FormValidation.Required, path: FormValidation.Required },
  });

  if (isLoading && worktrees.length === 0) {
    return <Form isLoading />;
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Open File"
            icon={Icon.Document}
            onSubmit={(values) => {
              mode.current = "edit";
              return handleSubmit(values as Values);
            }}
          />
          <Action.SubmitForm
            title="Open as Diff"
            icon={Icon.Code}
            onSubmit={(values) => {
              mode.current = "diff";
              return handleSubmit(values as Values);
            }}
          />
        </ActionPanel>
      }
    >
      <WorktreeDropdown {...itemProps.worktree} worktrees={worktrees} />
      <Form.TextField {...itemProps.path} title="File" placeholder="src/index.ts or an absolute path" />
    </Form>
  );
}

export default function Command() {
  return <OpenFileForm />;
}
