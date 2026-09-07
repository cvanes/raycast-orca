import { Action, ActionPanel, Form, Icon, useNavigation } from "@raycast/api";
import { FormValidation, useForm } from "@raycast/utils";
import { sendToTerminal } from "../lib/api";
import { agentIcon } from "../lib/format";
import { Terminal } from "../lib/types";
import { runWithToast } from "./feedback";

interface Values {
  handle: string;
  text: string;
  enter: boolean;
  interrupt: boolean;
}

interface Props {
  terminals: Terminal[];
  defaultHandle?: string;
  isLoading?: boolean;
}

export function SendTextForm({ terminals, defaultHandle, isLoading }: Props) {
  const { pop } = useNavigation();
  const { handleSubmit, itemProps } = useForm<Values>({
    async onSubmit(values) {
      const sent = await runWithToast(
        { pending: "Sending text", success: "Text sent", failure: "Could not send text" },
        () => sendToTerminal(values.handle, values.text, { enter: values.enter, interrupt: values.interrupt }),
      );
      if (sent) {
        pop();
      }
    },
    initialValues: { handle: defaultHandle, enter: true, interrupt: false },
    validation: { handle: FormValidation.Required, text: FormValidation.Required },
  });

  return (
    <Form
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Send Text" icon={Icon.ArrowRight} onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      {terminals.length === 0 && !isLoading ? (
        <Form.Description text="This worktree has no live terminals. Create one first." />
      ) : null}
      <Form.Dropdown {...itemProps.handle} title="Terminal">
        {terminals.map((terminal) => (
          <Form.Dropdown.Item
            key={terminal.handle}
            value={terminal.handle}
            title={terminal.title || terminal.handle}
            icon={agentIcon(terminal.agentIdentity)}
          />
        ))}
      </Form.Dropdown>
      <Form.TextArea {...itemProps.text} title="Text" placeholder="What should the agent do next?" />
      <Form.Checkbox {...itemProps.enter} label="Press Enter after sending" />
      <Form.Checkbox {...itemProps.interrupt} label="Interrupt whatever is running first" />
    </Form>
  );
}
