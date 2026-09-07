# Orca

Control [Orca](https://onorca.dev) from Raycast. Orca is an agentic development environment: it
organises work into worktrees, each with its own terminals, AI agents and embedded browser tabs.

This extension is both a set of command palette commands and a Raycast AI extension, so you can
either browse your worktrees in a list or just ask `@orca` what your agents are up to.

## Requirements

- The Orca app installed at `/Applications/Orca.app` and running.
- The `orca` CLI on disk. The installer symlinks it to `/usr/local/bin/orca`; if yours lives
  elsewhere, point the **Orca CLI Path** preference at it. The extension falls back to
  `/Applications/Orca.app/Contents/Resources/bin/orca`.
- Optional: the [GitHub CLI](https://cli.github.com) (`gh`), authenticated, for repo search in
  Clone Project from GitHub. Without it you can still clone by pasting a URL.

## Commands

| Command | What it does |
| --- | --- |
| Search Worktrees | Every worktree grouped by repo, with live agent status, terminal counts and last activity. Open in Orca, start terminals, send prompts, set workspace status, create or remove worktrees. |
| Create Worktree | Create a worktree in a project and optionally start an agent on a prompt. |
| Search Terminals | Every live terminal grouped by worktree. Switch to one, read its screen, send it text, rename or close it. |
| Search Projects | The repos registered with Orca. Create a worktree in one, add or clone a project, open one in Finder. |
| Add Project from Folder | Register an existing folder with Orca, optionally running `git init` first. |
| Clone Project from GitHub | Search your GitHub repos or all of GitHub, then clone and register in one step. Falls back to entering a clone URL when the `gh` CLI is missing. |
| Search Browser Tabs | The tabs open in Orca's embedded browser. Switch, copy the URL or close. |
| Open Browser Tab | Open a URL in a worktree's embedded browser. |
| Open File in Orca | Open a worktree file in the Orca editor, as an editor or as a diff. |
| Open Orca | Launch Orca and wait for its runtime. |

## Preferences

- **Orca CLI Path** - path to the `orca` binary, default `/usr/local/bin/orca`.
- **Default Agent** - agent preselected in the Create Worktree form, default Claude.
- **Default Clone Directory** - parent directory preselected when cloning, default `~/Development`.

## AI tools

Mention `@orca` in AI Chat or Quick AI and the model can reach 24 tools:

| Area | Tools |
| --- | --- |
| Status | `get-orca-status`, `open-orca` |
| Projects | `list-projects`, `add-project`, `clone-project`, `search-github-repos`, `list-hosts` |
| Worktrees | `list-worktrees`, `get-worktree`, `create-worktree`, `update-worktree`, `remove-worktree` |
| Terminals | `list-terminals`, `read-terminal`, `create-terminal`, `send-to-terminal`, `switch-to-terminal`, `close-terminal` |
| Files | `open-file`, `open-changed-files` |
| Browser | `list-browser-tabs`, `open-browser-tab`, `navigate-browser-tab`, `close-browser-tab` |

Things to try:

- `@orca what are my agents doing?`
- `@orca create a worktree in web-app called fix-links and have claude tidy the broken links`
- `@orca what is the terminal in docs-site showing?`
- `@orca tell the claude in billing-service to run the tests`
- `@orca open package.json in the design-system worktree`
- `@orca open onorca.dev in the browser of the docs-site worktree`
- `@orca mark mobile-app as in review`
- `@orca remove the fix-links worktree`
- `@orca is orca running?`
- `@orca clone raycast/extensions into my dev folder`
- `@orca add ~/Projects/foo as a project and init git if needed`

Anything that changes state - creating or removing a worktree, starting a terminal, sending text
to an agent - asks you to confirm first.

## Development

```sh
npm install
npm run dev    # ray develop, with hot reload into Raycast
npm run lint   # ray lint
npm run build  # ray build -e dist
```

`npm run evals` (`npx ray evals`) runs the AI evals in `ai.yaml`. It talks to Raycast's servers, so
run `npx ray login` once first.
