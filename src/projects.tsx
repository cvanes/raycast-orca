import { Action, ActionPanel, Color, Icon, Image, Keyboard, List } from "@raycast/api";
import { AddProjectForm } from "./add-project";
import { CloneProjectList } from "./clone-project";
import { OpenProjectAction } from "./components/open-project-action";
import { CreateWorktreeForm } from "./create-worktree";
import { useOrcaList } from "./hooks/use-orca-data";
import { listRepos } from "./lib/api";
import { Repo } from "./lib/types";

export default function Command() {
  const { data: repos, isLoading, revalidate } = useOrcaList<Repo>(listRepos);

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Search projects">
      <List.EmptyView
        icon={Icon.Folder}
        title="No projects yet"
        description="Add a folder that is already on disk, or clone a repository from GitHub."
        actions={
          <ActionPanel>
            <CreateProjectActions onCreated={revalidate} />
          </ActionPanel>
        }
      />
      {repos.map((repo) => (
        <ProjectItem key={repo.id} repo={repo} onCreated={revalidate} />
      ))}
    </List>
  );
}

function ProjectItem({ repo, onCreated }: { repo: Repo; onCreated: () => void }) {
  return (
    <List.Item
      icon={projectIcon(repo)}
      title={repo.displayName}
      subtitle={repo.path}
      accessories={accessories(repo)}
      actions={
        <ActionPanel>
          <Action.Push title="Create Worktree Here" icon={Icon.Plus} target={<CreateWorktreeForm repoId={repo.id} />} />
          <OpenProjectAction path={repo.path} />
          <Action.ShowInFinder path={repo.path} />
          <Action.CopyToClipboard title="Copy Path" content={repo.path} shortcut={Keyboard.Shortcut.Common.Copy} />
          <ActionPanel.Section>
            <CreateProjectActions onCreated={onCreated} />
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
}

function CreateProjectActions({ onCreated }: { onCreated: () => void }) {
  return (
    <>
      <Action.Push
        title="Add Project from Folder…"
        icon={Icon.NewFolder}
        target={<AddProjectForm />}
        onPop={onCreated}
        shortcut={Keyboard.Shortcut.Common.New}
      />
      <Action.Push
        title="Clone Project from GitHub…"
        icon={Icon.Download}
        target={<CloneProjectList />}
        onPop={onCreated}
        shortcut={{ modifiers: ["cmd", "shift"], key: "n" }}
      />
    </>
  );
}

function projectIcon(repo: Repo): Image.ImageLike {
  const source = repo.repoIcon?.src;
  return source && /^(https:\/\/|data:)/.test(source) ? { source } : Icon.Folder;
}

function accessories(repo: Repo): List.Item.Accessory[] {
  const remote = repo.gitRemoteIdentity?.canonicalKey;
  return [
    ...(remote ? [{ icon: Icon.Link, text: remote }] : []),
    { tag: { value: repo.kind, color: repo.kind === "git" ? Color.Green : Color.SecondaryText } },
  ];
}
