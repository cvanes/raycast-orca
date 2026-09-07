# CLAUDE.md

Raycast extension for [Orca ADE](https://onorca.dev). It is both a set of command palette
commands and a Raycast AI extension (`tools` plus `ai.yaml`), all built on top of the `orca` CLI.

## Commands

```
npm install
npm run dev        # ray develop, hot reloads inside the installed Raycast app
npm run lint       # ray lint (ESLint, Prettier, manifest and icon checks)
npm run fix-lint
npm run build      # ray build -e dist
npx ray evals      # needs `npx ray login` first
```

`ray lint` currently fails on one item only: `Invalid author "cvanes"`, because that handle is
not registered on raycast.com. Treat every other lint or type error as a real failure.

## Architecture

```
src/lib/          the only layer that talks to the outside world
  orca.ts         orca() runs the CLI with --json and unwraps the envelope, OrcaError
  api.ts          one typed function per CLI command, options objects for optional flags
  types.ts        CLI payload types
  selectors.ts    id and selector helpers (worktreeSelector, branchName, folderName)
  format.ts       relative time, icons and colours, slim* mappers for model-facing output
  app.ts          focusOrca, openOrca, revealWorktree
  git.ts / github.ts / projects.ts / hosts.ts   project creation (git init, gh, clone)
  preferences.ts  the only lib file that may import getPreferenceValues
src/*.tsx         command entry points, one per manifest command
src/components/   shared UI (forms, list items, actions, feedback helpers)
src/hooks/        useOrcaList / useOrcaValue wrappers around useCachedPromise
src/tools/        AI tools, one file per manifest tool, shared helpers in tools/shared
ai.yaml           model instructions and evals
```

Rules:

- Commands and tools never call `execFile`, `child_process` or `orca` directly. Everything goes
  through `src/lib/api.ts` (or `git.ts` / `github.ts` / `projects.ts`).
- `src/lib` must not import Raycast UI. `preferences.ts` and `format.ts` are the exceptions
  (`getPreferenceValues`, `Icon`, `Color`).
- Tools return the `slim*` shapes from `format.ts`, never raw CLI payloads. Raw `repo list`
  output carries base64 icons that can reach 100 KB per repo.
- Every tool `Input` field needs a precise JSDoc comment. Raycast derives the tool schema from
  it and the model reads it.
- Side-effecting tools export `confirmation: Tool.Confirmation<Input>`. Destructive ones use
  `Action.Style.Destructive`.
- Any UI action that hands off to Orca (switch terminal, open file, reveal worktree) goes through
  `handOffToOrca` in `src/components/feedback.ts`, which closes the Raycast window, pops to root
  and then brings Orca forward. Do not leave Raycast open after a hand-off.
- Small functions, no dead code, delete what a refactor replaces.

## Orca CLI facts the code depends on

- Binary: preference `orcaPath` (default `/usr/local/bin/orca`), falling back to
  `/Applications/Orca.app/Contents/Resources/bin/orca`. Raycast has a minimal PATH, so never rely
  on `orca` being resolvable by name.
- Every call passes `--json` and gets `{ok, result}` or `{ok: false, error: {code, message}}`.
  Errors exit with status 0, so `ok` is the only signal. `orca()` throws `OrcaError` on `ok: false`.
- Worktree ids are `<repoId>::<absolutePath>`. Selectors are `id:`, `name:`, `path:`, `branch:`
  or `active`. Raycast has no cwd context, so `--repo` and `--worktree` are always explicit and
  `worktree create` always passes `--no-parent`.
- `worktree ps` is the dashboard call. `status` is `working | active | inactive`, agent `state`
  is `working | waiting | done`, and `agents[]` can be empty while `status` is `working`.
- There is no "reveal worktree" command. `revealWorktree` switches to one of the worktree's
  terminals, or creates one with `--focus`, then runs `open -a Orca`.
- Payload quirks: `terminal read` returns `result.terminal.tail` (string cursors); mutating
  terminal commands wrap their payload (`{send}`, `{focus}`, `{rename}`, `{close}`);
  `project setup-clone` is double nested (`result.result.*`); `tab create` returns only
  `{browserPageId}`.
- `project setup-clone --project github:<owner>/<repo> --host local --url <clone-url>
--destination <parentDir>` clones and registers project, host setup and repo in one step.
  SSH hosts cannot be cloned to from the CLI. Non-GitHub URLs use `git clone` then `repo add`.
- `orca agent-context --json` dumps the full command schema without the app running. Use it to
  verify flags before adding a wrapper.

## ai.yaml

Eval mocks pin tool return shapes and `callsTool` assertions pin Input field names. When you
change a tool's Input or return shape, update the matching evals in the same change.

## Public repo hygiene

This repo is public. Examples in `ai.yaml`, tool JSDoc and the README use `/Users/me`, the
GitHub owner `acme` and fictional project names (web-app, docs-site, billing-service,
mobile-app, design-system) with invented ids. Never paste real paths, repo ids, terminal
handles, employer or colleague names from a live Orca into the repo.

## Testing against a live Orca

Read-only calls (`status`, `worktree ps`, `terminal list`, `tab list`) are safe to run at any
time. Do not create or remove worktrees, register projects or send text to existing terminals
while testing. Creating and then closing a throwaway terminal or browser tab in this repo's own
worktree is acceptable.

## Style

UK spelling in all user-facing text and comments. No Oxford commas. No em dashes (use hyphens).
