import { addRepo, setupClone } from "./api";
import { gitClone, gitInit, isGitRepo, repoNameFromUrl } from "./git";
import { githubProjectId, GitHubRepo } from "./github";
import { ProjectSetup, Repo } from "./types";

export interface AddProjectFromFolderOptions {
  path: string;
  initGit?: boolean;
}

export interface AddedProject {
  path: string;
  initialisedGit: boolean;
  repo?: Repo;
}

export async function addProjectFromFolder(options: AddProjectFromFolderOptions): Promise<AddedProject> {
  const alreadyGit = await isGitRepo(options.path);
  const initialisedGit = Boolean(options.initGit) && !alreadyGit;
  if (initialisedGit) {
    await gitInit(options.path);
  }
  return { path: options.path, initialisedGit, repo: await addRepo(options.path) };
}

export interface CloneProjectOptions {
  source: GitHubRepo | { url: string };
  hostId?: string;
  destination: string;
  displayName?: string;
}

export interface ClonedProject {
  path: string;
  projectId?: string;
  setup?: ProjectSetup;
  repo?: Repo;
  clonedByOrca: boolean;
}

export async function cloneProject(options: CloneProjectOptions): Promise<ClonedProject> {
  const url = cloneUrlOf(options.source);
  const projectId = githubProjectId(url);
  if (projectId) {
    const result = await setupClone({
      projectId,
      hostId: options.hostId,
      url,
      destination: options.destination,
      displayName: options.displayName,
    });
    return {
      path: result.setup.path,
      projectId: result.project.id,
      setup: result.setup,
      repo: result.repo,
      clonedByOrca: true,
    };
  }

  const path = await gitClone(url, options.destination, repoNameFromUrl(url));
  return { path, repo: await addRepo(path), clonedByOrca: false };
}

function cloneUrlOf(source: GitHubRepo | { url: string }): string {
  return "cloneUrl" in source ? source.cloneUrl : source.url;
}
