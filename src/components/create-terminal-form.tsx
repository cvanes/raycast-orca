import { Action, ActionPanel, Form, Icon, useNavigation } from "@raycast/api";
import { useForm } from "@raycast/utils";
import { createTerminal } from "../lib/api";
import { handOffToOrca, runWithToast } from "./feedback";

interface Values {
  title: string;
  command: string;
  focus: boolean;
}

export function CreateTerminalForm({ worktreeId, onCreated }: { worktreeId: string; onCreated?: () => void }) {
  const { pop } = useNavigation();
  const { handleSubmit, itemProps } = useForm<Values>({
    async onSubmit(values) {
      const create = () =>
        createTerminal({
          worktree: worktreeId,
          title: values.title || undefined,
          command: values.command || undefined,
          focus: values.focus,
        });
      if (values.focus) {
        await handOffToOrca("Could not create terminal", create);
        return;
      }
      const created = await runWithToast(
        { pending: "Creating terminal", success: "Terminal created", failure: "Could not create terminal" },
        create,
      );
      if (created) {
        onCreated?.();
        pop();
      }
    },
    initialValues: { focus: true },
  });

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Create Terminal" icon={Icon.Terminal} onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField {...itemProps.title} title="Title" placeholder="Optional terminal title" />
      <Form.TextField {...itemProps.command} title="Command" placeholder="Optional command to run" />
      <Form.Checkbox {...itemProps.focus} label="Focus the terminal in Orca" />
    </Form>
  );
}
