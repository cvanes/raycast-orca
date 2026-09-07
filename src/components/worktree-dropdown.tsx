import { Form } from "@raycast/api";
import { ComponentProps } from "react";
import { groupBy, workspaceStatusIcon } from "../lib/format";
import { branchName } from "../lib/selectors";
import { WorktreeSummary } from "../lib/types";

type Props = ComponentProps<typeof Form.Dropdown> & { worktrees: WorktreeSummary[] };

export function WorktreeDropdown({ worktrees, ...props }: Props) {
  return (
    <Form.Dropdown title="Worktree" {...props}>
      {groupBy(worktrees, (worktree) => worktree.repo).map(([repo, items]) => (
        <Form.Dropdown.Section key={repo} title={repo}>
          {items.map((worktree) => (
            <Form.Dropdown.Item
              key={worktree.worktreeId}
              value={worktree.worktreeId}
              title={`${worktree.displayName} · ${branchName(worktree.branch)}`}
              icon={workspaceStatusIcon(worktree.workspaceStatus)}
            />
          ))}
        </Form.Dropdown.Section>
      ))}
    </Form.Dropdown>
  );
}
