export function worktreeSelector(idOrSelector: string): string {
  return hasSelectorPrefix(idOrSelector) ? idOrSelector : `id:${idOrSelector}`;
}

export function repoSelector(idOrSelector: string): string {
  return hasSelectorPrefix(idOrSelector) ? idOrSelector : `id:${idOrSelector}`;
}

export function pathSelector(absolutePath: string): string {
  return `path:${absolutePath}`;
}

export function branchName(ref: string): string {
  return ref.replace(/^refs\/heads\//, "");
}

export function worktreePath(worktreeId: string): string {
  return worktreeId.slice(worktreeId.indexOf("::") + 2);
}

export function shortenWorktreeId(worktreeId: string): string {
  return worktreePath(worktreeId).split("/").slice(-2).join("/");
}

export function folderName(path: string): string {
  return path.split("/").filter(Boolean).slice(-1)[0] ?? path;
}

function hasSelectorPrefix(value: string): boolean {
  return value === "active" || /^(id|name|path|branch):/.test(value);
}
