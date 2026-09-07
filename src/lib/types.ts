export interface OrcaErrorPayload {
  code: string;
  message: string;
  data?: unknown;
}

export interface OrcaEnvelope<T> {
  id: string;
  ok: boolean;
  result?: T;
  error?: OrcaErrorPayload;
  _meta?: { runtimeId: string | null };
}

export type AgentId = "claude" | "codex" | "omp" | "pi" | "grok";

export const AGENT_IDS: AgentId[] = ["claude", "codex", "omp", "pi", "grok"];

export const WORKSPACE_STATUSES = ["todo", "in-progress", "in-review", "completed"];

export interface OrcaStatus {
  target: { kind: string };
  app: { running: boolean; pid?: number; desktopWindowStatus?: string };
  runtime: {
    state: string;
    reachable: boolean;
    connectionState?: string;
    runtimeId?: string | null;
    appVersion?: string;
    capabilities?: string[];
  };
}

export interface Host {
  kind: "local" | "ssh" | "runtime";
  name: string;
  id: string;
  selector: string;
}

export interface ProjectSetup {
  id: string;
  path: string;
  setupState: string;
  setupMethod: string;
  displayName?: string;
  kind?: string;
}

export interface RepoIcon {
  type: string;
  src: string;
  source?: string;
  label?: string;
}

export interface GitRemoteIdentity {
  canonicalKey: string;
  remoteName?: string;
  remoteUrl?: string;
}

export interface Repo {
  id: string;
  path: string;
  displayName: string;
  badgeColor?: string;
  addedAt?: number;
  kind: string;
  gitUsername?: string;
  repoIcon?: RepoIcon | null;
  upstream?: unknown;
  gitRemoteIdentity?: GitRemoteIdentity | null;
}

export interface Project {
  id: string;
  displayName: string;
  badgeColor?: string;
  repoIcon?: RepoIcon | null;
  kind: string;
  providerIdentity?: { provider: string; owner: string; repo: string } | null;
  gitRemoteIdentity?: GitRemoteIdentity | null;
  sourceRepoIds: string[];
  createdAt?: number;
  updatedAt?: number;
}

export interface GitInfo {
  path: string;
  head: string;
  branch: string;
  isBare: boolean;
  isMainWorktree: boolean;
}

export interface Worktree {
  id: string;
  repoId: string;
  projectId: string;
  hostId?: string;
  path: string;
  head: string;
  branch: string;
  isBare?: boolean;
  isMainWorktree: boolean;
  displayName: string;
  comment: string;
  isArchived: boolean;
  isUnread?: boolean;
  isPinned?: boolean;
  lastActivityAt?: number;
  createdAt?: number;
  createdWithAgent?: string;
  baseRef?: string;
  workspaceStatus: string;
  linkedIssue?: number | null;
  linkedPR?: number | null;
  linkedLinearIssue?: string | null;
  parentWorktreeId?: string | null;
  childWorktreeIds: string[];
  git?: GitInfo;
}

export interface WorktreeAgent {
  paneKey: string;
  parentPaneKey?: string | null;
  state: string;
  agentType: string;
  prompt?: string | null;
  taskTitle?: string | null;
  displayName?: string | null;
  lastAssistantMessage?: string | null;
  toolName?: string | null;
  toolInput?: string | null;
  interrupted?: boolean;
  stateStartedAt?: number;
  updatedAt?: number;
}

export interface WorktreeSummary {
  workspaceKind: string;
  worktreeId: string;
  repoId: string;
  hostId?: string;
  repo: string;
  path: string;
  branch: string;
  displayName: string;
  isArchived: boolean;
  isMainWorktree: boolean;
  workspaceStatus: string;
  comment: string;
  isPinned: boolean;
  isActive: boolean;
  unread: boolean;
  liveTerminalCount: number;
  hasAttachedPty?: boolean;
  lastActivityAt?: number;
  lastOutputAt?: number | null;
  preview: string;
  status: string;
  agents: WorktreeAgent[];
  parentWorktreeId?: string | null;
  childWorktreeIds: string[];
  linkedIssue?: number | null;
  linkedPR?: number | null;
}

export interface Terminal {
  handle: string;
  ptyId?: string;
  incarnationId?: string;
  orphaned?: boolean;
  worktreeId: string;
  worktreePath: string;
  branch: string;
  tabId: string;
  leafId?: string;
  title: string;
  connected: boolean;
  writable: boolean;
  lastOutputAt?: number;
  preview: string;
  executionHostId?: string;
  agentIdentity: string | null;
}

export interface CreatedTerminal {
  handle: string;
  tabId: string;
  paneKey?: string;
  ptyId?: string;
  worktreeId: string;
  title: string;
  executionHostId?: string;
  incarnationId?: string;
  hostPlatform?: string;
  surface?: string;
}

export interface TerminalRead {
  handle: string;
  status: string;
  tail: string[];
  truncated: boolean;
  limited: boolean;
  oldestCursor: string;
  nextCursor: string;
  latestCursor: string;
  returnedLineCount: number;
  source: string;
}

export interface BrowserTab {
  browserPageId: string;
  index: number;
  url: string;
  title: string;
  active: boolean;
  loadError?: string | null;
  certificateFailure?: string | null;
  worktreeId: string;
  profileId?: string;
  profileLabel?: string;
}

export interface TerminalHandleRef {
  handle: string;
  tabId?: string;
  worktreeId?: string;
}

export type WorktreeCreateResult = {
  worktree: Worktree;
  agentTerminalHandle?: string | null;
  startupTerminal?: { handle: string } | null;
};
export type WorktreeRemoveResult = { removed?: boolean; worktreeId?: string; branchDeleted?: boolean };
export type TerminalSendResult = { send: { handle: string; accepted: boolean; bytesWritten: number } };
export type TerminalFocus = TerminalHandleRef & { navigated?: boolean };
export type TerminalSwitchResult = { focus?: TerminalFocus };
export type TerminalRenameResult = { rename: TerminalHandleRef & { title: string | null } };
export type TerminalCloseResult = { close: TerminalHandleRef & { ptyKilled?: boolean } };
export type FileOpenResult = { worktree?: string; relativePath?: string; kind?: string; opened?: boolean };
export type FileOpenChangedResult = {
  worktree?: string;
  mode?: string;
  opened?: { path: string; mode?: string; opened?: boolean; kind?: string }[];
};
export type ProjectSetupResult = { project: Project; setup: ProjectSetup; repo?: Repo };
export type TabCreateResult = { browserPageId: string };
export type TabCloseResult = { closed?: boolean };
export type GotoResult = { url?: string; title?: string };
