import { Action, ActionPanel, Form, Icon } from "@raycast/api";
import { useForm } from "@raycast/utils";
import { handOffToOrca } from "./components/feedback";
import { WorktreeDropdown } from "./components/worktree-dropdown";
import { useActiveWorktrees } from "./hooks/use-worktrees";
import { createTab } from "./lib/api";

interface Values {
  worktree: string;
  url: string;
}

interface Props {
  worktreeId?: string;
}

export function OpenBrowserTabForm({ worktreeId }: Props) {
  const { worktrees, isLoading } = useActiveWorktrees();
  const { handleSubmit, itemProps } = useForm<Values>({
    async onSubmit(values) {
      const url = normaliseUrl(values.url);
      await handOffToOrca("Could not open the tab", () => createTab(values.worktree, { url }));
    },
    initialValues: { worktree: worktreeId },
    validation: {
      worktree: (value) => (value ? undefined : "Pick a worktree"),
      url: (value) => (value && value.trim().length > 0 ? undefined : "Enter a URL"),
    },
  });

  if (isLoading && worktrees.length === 0) {
    return <Form isLoading />;
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Open Tab" icon={Icon.Globe} onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <WorktreeDropdown {...itemProps.worktree} worktrees={worktrees} />
      <Form.TextField {...itemProps.url} title="URL" placeholder="onorca.dev" />
    </Form>
  );
}

function normaliseUrl(url: string): string {
  const trimmed = url.trim();
  return /^[a-z][a-z0-9+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export default function Command() {
  return <OpenBrowserTabForm />;
}
