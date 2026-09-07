import { orca } from "./orca";
import { repoSelector, worktreeSelector } from "./selectors";
import {
  AgentId,
  BrowserTab,
  CreatedTerminal,
  FileOpenChangedResult,
  FileOpenResult,
  GotoResult,
  Host,
  OrcaStatus,
  ProjectSetupResult,
  Repo,
  TabCloseResult,
  TabCreateResult,
  Terminal,
  TerminalCloseResult,
  TerminalRead,
  TerminalRenameResult,
  TerminalFocus,
  TerminalSendResult,
  TerminalSwitchResult,
  Worktree,
  WorktreeCreateResult,
  WorktreeRemoveResult,
  WorktreeSummary,
} from "./types";

const CREATE_WORKTREE_TIMEOUT_MS = 120_000;
const OPEN_TIMEOUT_MS = 90_000;
const CLONE_TIMEOUT_MS = 10 * 60_000;

type Flags = Record<string, string | number | boolean | null | undefined>;

function flagArgs(flags: Flags): string[] {
  return Object.entries(flags).flatMap(([name, value]) => {
    if (value === undefined || value === null || value === false) {
      return [];
    }
    return value === true ? [`--${name}`] : [`--${name}`, String(value)];
  });
}

export async function status(): Promise<OrcaStatus> {
  return orca<OrcaStatus>(["status"]);
}

export async function open(): Promise<OrcaStatus> {
  return orca<OrcaStatus>(["open"], { timeoutMs: OPEN_TIMEOUT_MS });
}

export async function listRepos(): Promise<Repo[]> {
  const result = await orca<{ repos: Repo[] }>(["repo", "list"]);
  return result.repos;
}

export async function addRepo(path: string): Promise<Repo | undefined> {
  const result = await orca<{ repo?: Repo }>(["repo", "add", "--path", path]);
  return result.repo;
}

export async function listHosts(): Promise<Host[]> {
  const result = await orca<{ hosts: Host[] }>(["host", "list"]);
  return result.hosts;
}

export interface SetupCloneOptions {
  projectId: string;
  hostId?: string;
  url: string;
  destination: string;
  displayName?: string;
}

export async function setupClone(options: SetupCloneOptions): Promise<ProjectSetupResult> {
  const args = [
    "project",
    "setup-clone",
    ...flagArgs({
      project: options.projectId,
      host: options.hostId ?? "local",
      url: options.url,
      destination: options.destination,
      "display-name": options.displayName,
    }),
  ];
  const result = await orca<{ result: ProjectSetupResult }>(args, { timeoutMs: CLONE_TIMEOUT_MS });
  return result.result;
}

export async function psWorktrees(options: { limit?: number } = {}): Promise<WorktreeSummary[]> {
  const result = await orca<{ worktrees: WorktreeSummary[] }>([
    "worktree",
    "ps",
    ...flagArgs({ limit: options.limit }),
  ]);
  return result.worktrees;
}

export async function showWorktree(worktree: string): Promise<Worktree> {
  const result = await orca<{ worktree: Worktree }>(["worktree", "show", "--worktree", worktreeSelector(worktree)]);
  return result.worktree;
}

export interface CreateWorktreeOptions {
  name: string;
  repo?: string;
  agent?: AgentId;
  prompt?: string;
  setup?: "run" | "skip" | "inherit";
  baseBranch?: string;
  issue?: number;
  linearIssue?: string;
  comment?: string;
  parentWorktree?: string;
  noParent?: boolean;
  activate?: boolean;
}

export async function createWorktree(options: CreateWorktreeOptions): Promise<WorktreeCreateResult> {
  const args = [
    "worktree",
    "create",
    ...flagArgs({
      name: options.name,
      repo: options.repo && repoSelector(options.repo),
      agent: options.agent,
      prompt: options.prompt,
      setup: options.setup,
      "base-branch": options.baseBranch,
      issue: options.issue,
      "linear-issue": options.linearIssue,
      comment: options.comment,
      "parent-worktree": options.parentWorktree && worktreeSelector(options.parentWorktree),
      "no-parent": options.noParent,
      activate: options.activate,
    }),
  ];
  return orca<WorktreeCreateResult>(args, { timeoutMs: CREATE_WORKTREE_TIMEOUT_MS });
}

export interface SetWorktreeOptions {
  displayName?: string;
  comment?: string;
  workspaceStatus?: string;
  issue?: number | "null";
  linearIssue?: string | "null";
}

export async function setWorktree(worktree: string, options: SetWorktreeOptions): Promise<Worktree> {
  const args = [
    "worktree",
    "set",
    "--worktree",
    worktreeSelector(worktree),
    ...flagArgs({
      "display-name": options.displayName,
      comment: options.comment,
      "workspace-status": options.workspaceStatus,
      issue: options.issue,
      "linear-issue": options.linearIssue,
    }),
  ];
  const result = await orca<{ worktree: Worktree }>(args);
  return result.worktree;
}

export async function removeWorktree(
  worktree: string,
  options: { force?: boolean } = {},
): Promise<WorktreeRemoveResult> {
  const args = ["worktree", "rm", "--worktree", worktreeSelector(worktree), ...flagArgs({ force: options.force })];
  return orca<WorktreeRemoveResult>(args);
}

export async function listTerminals(options: { worktree?: string; limit?: number } = {}): Promise<Terminal[]> {
  const args = [
    "terminal",
    "list",
    ...flagArgs({ worktree: options.worktree && worktreeSelector(options.worktree), limit: options.limit }),
  ];
  const result = await orca<{ terminals: Terminal[] }>(args);
  return result.terminals;
}

export async function showTerminal(handle: string): Promise<Terminal> {
  const result = await orca<{ terminal: Terminal }>(["terminal", "show", "--terminal", handle]);
  return result.terminal;
}

export interface CreateTerminalOptions {
  worktree?: string;
  title?: string;
  command?: string;
  focus?: boolean;
}

export async function createTerminal(options: CreateTerminalOptions = {}): Promise<CreatedTerminal> {
  const args = [
    "terminal",
    "create",
    ...flagArgs({
      worktree: options.worktree && worktreeSelector(options.worktree),
      title: options.title,
      command: options.command,
      focus: options.focus,
    }),
  ];
  const result = await orca<{ terminal: CreatedTerminal }>(args);
  return result.terminal;
}

export interface ReadTerminalOptions {
  screen?: boolean;
  cursor?: string;
  limit?: number;
}

export async function readTerminal(handle: string, options: ReadTerminalOptions = {}): Promise<TerminalRead> {
  const args = [
    "terminal",
    "read",
    "--terminal",
    handle,
    ...flagArgs({ screen: options.screen, cursor: options.cursor, limit: options.limit }),
  ];
  const result = await orca<{ terminal: TerminalRead }>(args);
  return result.terminal;
}

export interface SendToTerminalOptions {
  enter?: boolean;
  interrupt?: boolean;
}

export async function sendToTerminal(
  handle: string,
  text: string,
  options: SendToTerminalOptions = {},
): Promise<TerminalSendResult["send"]> {
  const args = [
    "terminal",
    "send",
    "--terminal",
    handle,
    "--text",
    text,
    ...flagArgs({ enter: options.enter, interrupt: options.interrupt }),
  ];
  const result = await orca<TerminalSendResult>(args);
  return result.send;
}

export async function switchTerminal(handle: string): Promise<TerminalFocus> {
  const result = await orca<TerminalSwitchResult>(["terminal", "switch", "--terminal", handle]);
  return result.focus ?? { handle };
}

export async function renameTerminal(handle: string, title: string): Promise<TerminalRenameResult["rename"]> {
  const result = await orca<TerminalRenameResult>(["terminal", "rename", "--terminal", handle, "--title", title]);
  return result.rename;
}

export async function closeTerminal(handle: string): Promise<TerminalCloseResult["close"]> {
  const result = await orca<TerminalCloseResult>(["terminal", "close", "--terminal", handle]);
  return result.close;
}

export async function openFile(worktree: string, path: string): Promise<FileOpenResult> {
  return orca<FileOpenResult>(["file", "open", path, "--worktree", worktreeSelector(worktree)]);
}

export async function diffFile(
  worktree: string,
  path: string,
  options: { staged?: boolean } = {},
): Promise<FileOpenResult> {
  const args = [
    "file",
    "diff",
    path,
    "--worktree",
    worktreeSelector(worktree),
    ...flagArgs({ staged: options.staged }),
  ];
  return orca<FileOpenResult>(args);
}

export async function openChangedFiles(
  worktree: string,
  options: { mode?: "edit" | "diff" | "both" } = {},
): Promise<FileOpenChangedResult> {
  const args = ["file", "open-changed", "--worktree", worktreeSelector(worktree), ...flagArgs({ mode: options.mode })];
  return orca<FileOpenChangedResult>(args);
}

export async function listTabs(worktree = "all"): Promise<BrowserTab[]> {
  const selector = worktree === "all" ? "all" : worktreeSelector(worktree);
  const result = await orca<{ tabs: BrowserTab[] }>(["tab", "list", "--worktree", selector, "--show-profile"]);
  return result.tabs;
}

export async function createTab(worktree: string, options: { url?: string } = {}): Promise<TabCreateResult> {
  const args = ["tab", "create", "--worktree", worktreeSelector(worktree), ...flagArgs({ url: options.url })];
  return orca<TabCreateResult>(args);
}

export interface SwitchTabOptions {
  index?: number;
  page?: string;
  focus?: boolean;
}

export async function switchTab(worktree: string, options: SwitchTabOptions): Promise<void> {
  const args = [
    "tab",
    "switch",
    "--worktree",
    worktreeSelector(worktree),
    ...flagArgs({ index: options.index, page: options.page, focus: options.focus }),
  ];
  await orca<unknown>(args);
}

export async function closeTab(worktree: string, options: { index?: number; page?: string }): Promise<TabCloseResult> {
  const args = [
    "tab",
    "close",
    "--worktree",
    worktreeSelector(worktree),
    ...flagArgs({ index: options.index, page: options.page }),
  ];
  return orca<TabCloseResult>(args);
}

export async function gotoUrl(worktree: string, url: string, options: { page?: string } = {}): Promise<GotoResult> {
  const args = ["goto", "--url", url, "--worktree", worktreeSelector(worktree), ...flagArgs({ page: options.page })];
  return orca<GotoResult>(args);
}
