import { psWorktrees } from "../lib/api";
import { WorktreeSummary } from "../lib/types";
import { useOrcaList } from "./use-orca-data";

export function useWorktrees() {
  const { data, isLoading, revalidate } = useOrcaList<WorktreeSummary>(() => psWorktrees());
  return { worktrees: data, isLoading, revalidate };
}

export function useActiveWorktrees() {
  const { worktrees, isLoading, revalidate } = useWorktrees();
  return { worktrees: worktrees.filter((worktree) => !worktree.isArchived), isLoading, revalidate };
}
