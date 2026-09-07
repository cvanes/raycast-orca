import { Action, ActionPanel, Form, Icon, useNavigation } from "@raycast/api";
import { FormValidation, useForm } from "@raycast/utils";
import { renameTerminal } from "../lib/api";
import { runWithToast } from "./feedback";

interface Values {
  title: string;
}

export function RenameTerminalForm({
  handle,
  title,
  onRenamed,
}: {
  handle: string;
  title: string;
  onRenamed: () => void;
}) {
  const { pop } = useNavigation();
  const { handleSubmit, itemProps } = useForm<Values>({
    async onSubmit(values) {
      const renamed = await runWithToast(
        { pending: "Renaming terminal", success: "Terminal renamed", failure: "Could not rename terminal" },
        () => renameTerminal(handle, values.title),
      );
      if (renamed) {
        onRenamed();
        pop();
      }
    },
    initialValues: { title },
    validation: { title: FormValidation.Required },
  });

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Rename Terminal" icon={Icon.Pencil} onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField {...itemProps.title} title="Title" placeholder="Terminal title" />
    </Form>
  );
}
