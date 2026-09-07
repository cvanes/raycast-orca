import { Action, ActionPanel, Form, Icon, useNavigation } from "@raycast/api";
import { FormValidation, useForm } from "@raycast/utils";
import { setWorktree } from "../lib/api";
import { workspaceStatusIcon } from "../lib/format";
import { WORKSPACE_STATUSES, WorktreeSummary } from "../lib/types";
import { runWithToast } from "./feedback";

interface Values {
  displayName: string;
  comment: string;
  workspaceStatus: string;
}

export function EditWorktreeForm({ worktree, onSaved }: { worktree: WorktreeSummary; onSaved: () => void }) {
  const { pop } = useNavigation();
  const statuses = WORKSPACE_STATUSES.includes(worktree.workspaceStatus)
    ? WORKSPACE_STATUSES
    : [...WORKSPACE_STATUSES, worktree.workspaceStatus];

  const { handleSubmit, itemProps } = useForm<Values>({
    async onSubmit(values) {
      const saved = await runWithToast(
        { pending: "Saving worktree", success: "Worktree updated", failure: "Could not update worktree" },
        () =>
          setWorktree(worktree.worktreeId, {
            displayName: values.displayName,
            comment: values.comment,
            workspaceStatus: values.workspaceStatus,
          }),
      );
      if (saved) {
        onSaved();
        pop();
      }
    },
    initialValues: {
      displayName: worktree.displayName,
      comment: worktree.comment,
      workspaceStatus: worktree.workspaceStatus,
    },
    validation: { displayName: FormValidation.Required },
  });

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Save Worktree" icon={Icon.Check} onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField {...itemProps.displayName} title="Display Name" />
      <Form.TextArea {...itemProps.comment} title="Comment" placeholder="What is this worktree for?" />
      <Form.Dropdown {...itemProps.workspaceStatus} title="Workspace Status">
        {statuses.map((status) => (
          <Form.Dropdown.Item key={status} value={status} title={status} icon={workspaceStatusIcon(status)} />
        ))}
      </Form.Dropdown>
    </Form>
  );
}
