import { useState } from "react";
import { Action, ActionPanel, Form, Icon, List, Toast, popToRoot, showToast } from "@raycast/api";
import { useCachedPromise, showFailureToast } from "@raycast/utils";
import { openProjectInOrca } from "./components/open-project-action";
import { useOrcaList } from "./hooks/use-orca-data";
import { listHosts } from "./lib/api";
import { repoNameFromUrl } from "./lib/git";
import { GitHubRepo, listMyRepos, searchRepos } from "./lib/github";
import { canCloneToHost, hostArgument } from "./lib/hosts";
import { errorMessage } from "./lib/orca";
import { defaultCloneDirectory } from "./lib/preferences";
import { cloneProject } from "./lib/projects";
import { Host } from "./lib/types";

const SEARCH_MIN_LENGTH = 2;

function looksLikeCloneUrl(text: string): boolean {
  return /^(https?:\/\/|ssh:\/\/|git@)/.test(text);
}

export function CloneProjectList() {
  const [searchText, setSearchText] = useState("");
  const query = searchText.trim();
  const isSearching = query.length >= SEARCH_MIN_LENGTH;
  const { data, isLoading } = useCachedPromise(
    (text: string) => (text.length >= SEARCH_MIN_LENGTH ? searchRepos(text) : listMyRepos()),
    [query],
    { keepPreviousData: true },
  );

  return (
    <List
      isLoading={isLoading}
      filtering={false}
      throttle
      onSearchTextChange={setSearchText}
      searchBarPlaceholder="Search GitHub, or paste a clone URL"
    >
      <List.Section title="Clone by URL">
        <List.Item
          icon={Icon.Link}
          title="Clone from URL…"
          subtitle={looksLikeCloneUrl(query) ? query : "Paste an https or ssh clone URL"}
          actions={
            <ActionPanel>
              <Action.Push
                title="Continue"
                icon={Icon.ArrowRight}
                target={<CloneForm url={looksLikeCloneUrl(query) ? query : ""} />}
              />
            </ActionPanel>
          }
        />
      </List.Section>
      {data && !data.available ? (
        <List.Section title="GitHub">
          <List.Item
            icon={Icon.Warning}
            title="GitHub search is unavailable"
            subtitle={data.reason ?? "Install the GitHub CLI (gh) and run gh auth login to search repositories."}
          />
        </List.Section>
      ) : (
        <List.Section title={isSearching ? "GitHub Search" : "Your Repositories"}>
          {(data?.repos ?? []).map((repo) => (
            <RepoItem key={repo.nameWithOwner} repo={repo} />
          ))}
        </List.Section>
      )}
    </List>
  );
}

function RepoItem({ repo }: { repo: GitHubRepo }) {
  return (
    <List.Item
      icon={repo.isPrivate ? Icon.Lock : Icon.Box}
      title={repo.nameWithOwner}
      subtitle={repo.description}
      accessories={[
        ...(repo.stars ? [{ icon: Icon.Star, text: String(repo.stars) }] : []),
        ...(repo.updatedAt ? [{ date: new Date(repo.updatedAt) }] : []),
      ]}
      actions={
        <ActionPanel>
          <Action.Push
            title="Clone Repository"
            icon={Icon.Download}
            target={<CloneForm url={repo.cloneUrl} displayName={repo.nameWithOwner.split("/")[1]} />}
          />
          <Action.OpenInBrowser url={repo.url} />
          <Action.CopyToClipboard title="Copy Clone URL" content={repo.cloneUrl} />
        </ActionPanel>
      }
    />
  );
}

interface CloneFormValues {
  url: string;
  hostId: string;
  destination: string[];
  displayName: string;
}

function CloneForm({ url, displayName }: { url: string; displayName?: string }) {
  const { data: hosts, isLoading } = useOrcaList<Host>(listHosts);
  const cloneHosts = hosts.filter(canCloneToHost);

  async function submit(values: CloneFormValues) {
    const cloneUrl = values.url.trim();
    const destination = values.destination[0];
    if (!cloneUrl || !destination) {
      await showFailureToast("A clone URL and a destination directory are required", { title: "Missing details" });
      return;
    }
    const toast = await showToast({
      style: Toast.Style.Animated,
      title: "Cloning repository",
      message: repoNameFromUrl(cloneUrl),
    });
    try {
      const cloned = await cloneProject({
        source: { url: cloneUrl },
        hostId: values.hostId,
        destination,
        displayName: values.displayName.trim() || undefined,
      });
      toast.style = Toast.Style.Success;
      toast.title = "Project cloned";
      toast.message = cloned.path;
      toast.primaryAction = { title: "Open in Orca", onAction: () => void openProjectInOrca(cloned.path) };
      await popToRoot();
    } catch (error) {
      toast.style = Toast.Style.Failure;
      toast.title = "Could not clone repository";
      toast.message = errorMessage(error);
    }
  }

  return (
    <Form
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Clone Repository" icon={Icon.Download} onSubmit={submit} />
        </ActionPanel>
      }
    >
      <Form.TextField id="url" title="Clone URL" placeholder="https://github.com/owner/repo.git" defaultValue={url} />
      <Form.Dropdown
        id="hostId"
        title="Host"
        info="SSH hosts are not listed: cloning to one has to be set up in the Orca app."
      >
        {cloneHosts.map((host) => (
          <Form.Dropdown.Item
            key={host.id}
            value={hostArgument(host)}
            title={host.name}
            icon={host.kind === "local" ? Icon.Desktop : Icon.Cloud}
          />
        ))}
      </Form.Dropdown>
      <Form.FilePicker
        id="destination"
        title="Destination"
        allowMultipleSelection={false}
        canChooseDirectories
        canChooseFiles={false}
        defaultValue={[defaultCloneDirectory()]}
        info="Parent directory. The repository is cloned into a subfolder named after it."
      />
      <Form.TextField id="displayName" title="Display Name" placeholder="Optional" defaultValue={displayName} />
    </Form>
  );
}

export default function Command() {
  return <CloneProjectList />;
}
