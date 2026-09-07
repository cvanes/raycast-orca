import { Action, ActionPanel, Color, Form, Icon, Toast, showToast, useNavigation } from "@raycast/api";
import { FormValidation, showFailureToast, useForm } from "@raycast/utils";
import { handOffToOrca } from "./components/feedback";
import { useOrcaList } from "./hooks/use-orca-data";
import { createWorktree, listRepos } from "./lib/api";
import { revealWorktree } from "./lib/app";
import { defaultAgent } from "./lib/preferences";
import { branchName } from "./lib/selectors";
import { AGENT_IDS, AgentId, Repo } from "./lib/types";

const NO_AGENT = "none";

interface Values {
  repo: string;
  name: string;
  agent: string;
  prompt: string;
  baseBranch: string;
  comment: string;
  reveal: boolean;
}

export function CreateWorktreeForm({ repoId }: { repoId?: string }) {
  const { pop } = useNavigation();
  const { data: repos, isLoading } = useOrcaList<Repo>(listRepos);
  const { handleSubmit, itemProps, values } = useForm<Values>({
    onSubmit: (submitted) => submit(submitted, pop),
    initialValues: { repo: repoId, agent: defaultAgent() ?? NO_AGENT, reveal: true },
    validation: { repo: FormValidation.Required, name: FormValidation.Required },
  });

  if (isLoading && repos.length === 0) {
    return <Form isLoading />;
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Create Worktree" icon={Icon.Plus} onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.Dropdown {...itemProps.repo} title="Project">
        {repos.map((repo) => (
          <Form.Dropdown.Item
            key={repo.id}
            value={repo.id}
            title={repo.displayName}
            icon={{ source: Icon.Folder, tintColor: repo.badgeColor ?? Color.SecondaryText }}
          />
        ))}
      </Form.Dropdown>
      <Form.TextField {...itemProps.name} title="Name" placeholder="fix-broken-links" />
      <Form.Dropdown {...itemProps.agent} title="Agent">
        <Form.Dropdown.Item value={NO_AGENT} title="No agent" icon={Icon.Terminal} />
        {AGENT_IDS.map((agent) => (
          <Form.Dropdown.Item key={agent} value={agent} title={agent} icon={Icon.Stars} />
        ))}
      </Form.Dropdown>
      {values.agent && values.agent !== NO_AGENT ? (
        <Form.TextArea {...itemProps.prompt} title="Prompt" placeholder="What should the agent work on?" />
      ) : null}
      <Form.TextField {...itemProps.baseBranch} title="Base Branch" placeholder="Defaults to the project default" />
      <Form.TextField {...itemProps.comment} title="Comment" placeholder="Optional note shown in Orca" />
      <Form.Checkbox {...itemProps.reveal} label="Reveal the new worktree in Orca" />
    </Form>
  );
}

async function submit(values: Values, pop: () => void): Promise<void> {
  const toast = await showToast({ style: Toast.Style.Animated, title: `Creating ${values.name}` });
  try {
    const agent = values.agent === NO_AGENT ? undefined : (values.agent as AgentId);
    const result = await createWorktree({
      name: values.name,
      repo: values.repo,
      agent,
      prompt: agent && values.prompt ? values.prompt : undefined,
      baseBranch: values.baseBranch || undefined,
      comment: values.comment || undefined,
      noParent: true,
      activate: values.reveal,
    });
    toast.style = Toast.Style.Success;
    toast.title = `Created ${result.worktree.displayName}`;
    toast.message = branchName(result.worktree.branch);
    toast.primaryAction = {
      title: "Open in Orca",
      onAction: () => handOffToOrca("Could not open Orca", () => revealWorktree(result.worktree.id)),
    };
    pop();
  } catch (error) {
    await toast.hide();
    await showFailureToast(error, { title: "Could not create worktree" });
  }
}

export default function Command() {
  return <CreateWorktreeForm />;
}
