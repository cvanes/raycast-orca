import { Color, Icon } from "@raycast/api";
import { branchName } from "./selectors";
import {
  BrowserTab,
  OrcaStatus,
  Repo,
  Terminal,
  TerminalRead,
  Worktree,
  WorktreeAgent,
  WorktreeSummary,
} from "./types";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function relativeTime(timestamp?: number | null): string {
  if (!timestamp) {
    return "never";
  }
  const elapsed = Date.now() - timestamp;
  if (elapsed < MINUTE) {
    return "just now";
  }
  if (elapsed < HOUR) {
    return `${Math.round(elapsed / MINUTE)}m ago`;
  }
  if (elapsed < DAY) {
    return `${Math.round(elapsed / HOUR)}h ago`;
  }
  return `${Math.round(elapsed / DAY)}d ago`;
}

export function truncate(text: string | null | undefined, limit: number): string | undefined {
  if (!text) {
    return undefined;
  }
  const collapsed = text.replace(/\s+/g, " ").trim();
  return collapsed.length > limit ? `${collapsed.slice(0, limit - 1)}…` : collapsed;
}

export function workspaceStatusIcon(status: string): Icon {
  switch (status) {
    case "todo":
      return Icon.Circle;
    case "in-progress":
      return Icon.CircleProgress50;
    case "in-review":
      return Icon.Eye;
    case "completed":
      return Icon.CheckCircle;
    default:
      return Icon.Dot;
  }
}

export function agentIcon(agentIdentity: string | null | undefined): Icon {
  return agentIdentity ? Icon.Stars : Icon.Terminal;
}

export type AgentActivity = "working" | "waiting" | "done" | "idle";

export function agentActivity(worktree: WorktreeSummary): AgentActivity {
  const states = worktree.agents.map((agent) => agent.state);
  if (states.includes("working") || (worktree.agents.length === 0 && worktree.status === "working")) {
    return "working";
  }
  if (states.includes("waiting")) {
    return "waiting";
  }
  if (states.includes("done")) {
    return "done";
  }
  return "idle";
}

export function activityColour(activity: AgentActivity): Color {
  switch (activity) {
    case "working":
      return Color.Green;
    case "waiting":
      return Color.Orange;
    case "done":
      return Color.Blue;
    default:
      return Color.SecondaryText;
  }
}

export function groupBy<T>(items: T[], key: (item: T) => string): [string, T[]][] {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const group = groups.get(key(item));
    if (group) {
      group.push(item);
    } else {
      groups.set(key(item), [item]);
    }
  }
  return [...groups.entries()];
}

export interface SlimAgent {
  agentType: string;
  state: string;
  task?: string;
  toolName?: string;
  lastAssistantMessage?: string;
}

function slimAgent(agent: WorktreeAgent): SlimAgent {
  return {
    agentType: agent.agentType,
    state: agent.state,
    task: truncate(agent.taskTitle ?? agent.prompt, 200),
    toolName: agent.toolName ?? undefined,
    lastAssistantMessage: truncate(agent.lastAssistantMessage, 300),
  };
}

export interface SlimWorktreeSummary {
  id: string;
  displayName: string;
  repo: string;
  branch: string;
  path: string;
  workspaceStatus: string;
  agentStatus: string;
  liveTerminalCount: number;
  lastActivityAt?: string;
  comment?: string;
  isArchived: boolean;
  isMainWorktree: boolean;
  agents: SlimAgent[];
}

export function slimWorktreeSummary(worktree: WorktreeSummary): SlimWorktreeSummary {
  return {
    id: worktree.worktreeId,
    displayName: worktree.displayName,
    repo: worktree.repo,
    branch: branchName(worktree.branch),
    path: worktree.path,
    workspaceStatus: worktree.workspaceStatus,
    agentStatus: worktree.status,
    liveTerminalCount: worktree.liveTerminalCount,
    lastActivityAt: isoTime(worktree.lastActivityAt),
    comment: worktree.comment || undefined,
    isArchived: worktree.isArchived,
    isMainWorktree: worktree.isMainWorktree,
    agents: worktree.agents.map(slimAgent),
  };
}

export interface SlimWorktree {
  id: string;
  displayName: string;
  repoId: string;
  projectId: string;
  branch: string;
  path: string;
  head: string;
  workspaceStatus: string;
  comment?: string;
  isArchived: boolean;
  isMainWorktree: boolean;
  lastActivityAt?: string;
  baseRef?: string;
  createdWithAgent?: string;
  linkedIssue?: number;
  linkedPR?: number;
  parentWorktreeId?: string;
  childWorktreeIds: string[];
}

export function slimWorktree(worktree: Worktree): SlimWorktree {
  return {
    id: worktree.id,
    displayName: worktree.displayName,
    repoId: worktree.repoId,
    projectId: worktree.projectId,
    branch: branchName(worktree.branch),
    path: worktree.path,
    head: worktree.head,
    workspaceStatus: worktree.workspaceStatus,
    comment: worktree.comment || undefined,
    isArchived: worktree.isArchived,
    isMainWorktree: worktree.isMainWorktree,
    lastActivityAt: isoTime(worktree.lastActivityAt),
    baseRef: worktree.baseRef ? branchName(worktree.baseRef) : undefined,
    createdWithAgent: worktree.createdWithAgent,
    linkedIssue: worktree.linkedIssue ?? undefined,
    linkedPR: worktree.linkedPR ?? undefined,
    parentWorktreeId: worktree.parentWorktreeId ?? undefined,
    childWorktreeIds: worktree.childWorktreeIds,
  };
}

export interface SlimRepo {
  id: string;
  displayName: string;
  path: string;
  kind: string;
  remote?: string;
}

export function slimRepo(repo: Repo): SlimRepo {
  return {
    id: repo.id,
    displayName: repo.displayName,
    path: repo.path,
    kind: repo.kind,
    remote: repo.gitRemoteIdentity?.canonicalKey,
  };
}

export interface SlimTerminal {
  handle: string;
  title: string;
  worktreeId: string;
  worktreePath: string;
  branch: string;
  agentIdentity?: string;
  connected: boolean;
  writable: boolean;
  lastOutputAt?: string;
  preview?: string;
}

export function slimTerminal(terminal: Terminal): SlimTerminal {
  return {
    handle: terminal.handle,
    title: terminal.title,
    worktreeId: terminal.worktreeId,
    worktreePath: terminal.worktreePath,
    branch: branchName(terminal.branch),
    agentIdentity: terminal.agentIdentity ?? undefined,
    connected: terminal.connected,
    writable: terminal.writable,
    lastOutputAt: isoTime(terminal.lastOutputAt),
    preview: truncate(terminal.preview, 200),
  };
}

export interface SlimTerminalRead {
  handle: string;
  status: string;
  source: string;
  lines: string[];
  truncated: boolean;
  nextCursor: string;
}

export function slimTerminalRead(read: TerminalRead, maxLines = 200): SlimTerminalRead {
  const lines = read.tail.slice(-maxLines);
  return {
    handle: read.handle,
    status: read.status,
    source: read.source,
    lines,
    truncated: read.truncated || lines.length < read.tail.length,
    nextCursor: read.nextCursor,
  };
}

export interface SlimStatus {
  appRunning: boolean;
  runtimeState: string;
  runtimeReachable: boolean;
  appVersion?: string;
}

export function slimStatus(status: OrcaStatus): SlimStatus {
  return {
    appRunning: status.app.running,
    runtimeState: status.runtime.state,
    runtimeReachable: status.runtime.reachable,
    appVersion: status.runtime.appVersion,
  };
}

export interface SlimBrowserTab {
  browserPageId: string;
  index: number;
  url: string;
  title: string;
  active: boolean;
  worktreeId: string;
  loadError?: string;
}

export function slimBrowserTab(tab: BrowserTab): SlimBrowserTab {
  return {
    browserPageId: tab.browserPageId,
    index: tab.index,
    url: tab.url,
    title: tab.title,
    active: tab.active,
    worktreeId: tab.worktreeId,
    loadError: tab.loadError ?? undefined,
  };
}

function isoTime(timestamp?: number | null): string | undefined {
  return timestamp ? new Date(timestamp).toISOString() : undefined;
}
