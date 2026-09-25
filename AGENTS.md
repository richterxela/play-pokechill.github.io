# Repository workflow for agents

## Project and remotes

- This is a static browser game. `index.html` loads `styles.css` and the JavaScript files in `scripts/` directly. Preserve script load order and browser globals when editing them.
- `origin` is `richterxela/play-pokechill.github.io` (the fork). `upstream` is `play-pokechill/play-pokechill.github.io` (the parent). Both default branches are `main`.
- Unless the task explicitly calls for contributing to the parent project, prepare pull requests against the fork's `main` branch. For a parent project PR, use `upstream/main` as the base and `richterxela:<branch>` as the head.

## Before changing code

1. Run `git status --short --branch` and preserve any existing user changes. Do not discard or overwrite them.
2. Run `git fetch origin` and, when a parent PR or sync is relevant, `git fetch upstream`.
3. Check the intended PR base and compare the branches before starting. Do not force sync or reset the fork's `main`; resolve divergence deliberately.
4. Create a focused branch from the chosen base, using `codex/<short-description>` unless the user specifies another branch name. Keep `main` free of task commits.

## Implement and verify

- Keep the change scoped to the request. Avoid unrelated formatting, generated files, and dependency changes.
- Review the diff with `git diff --check` and `git diff` before committing.
- For changed JavaScript files, run `node --check <path>` on each file. This checks syntax only.
- For behavior or styling changes, serve the repository locally (for example, `python -m http.server 8000`) and check the affected flow in a browser. Check both a fresh game and an existing save when save data or game state is involved. Report any checks that could not be run.
- There is no package manifest or automated test suite in this repository. Do not claim that syntax checks or a page load prove game behavior.

## Save compatibility

- Preserve compatibility with save files exported from the creators' branch. Treat `scripts/save.js`, the `gameData` localStorage key, the structure of `saved` and `team`, and dictionary IDs referenced by saves as compatibility boundaries.
- Do not edit save, load, import, or export behavior unless a requested change absolutely requires it. Prefer changes that leave the persisted format intact.
- If a change must affect persisted data, keep old fields and IDs readable, supply safe defaults or a migration for older exports, and test import, reload, and export with a copy of an original-branch save. Use an isolated browser origin or profile and never overwrite a user's real save during testing.

## Pull request process

1. Commit only the intended files on the feature branch with a clear commit message. Never commit credentials, local save data, or unrelated assets.
2. When the task calls for publishing a PR, push the feature branch to `origin` and open the PR against the agreed base. Use a draft PR if required behavior or verification remains incomplete.
3. In the PR description, explain the change and why it is needed, identify the target repository and base branch, list verification performed and any gaps, and include screenshots for visible UI changes. Link the relevant issue when one exists.
4. Inspect the PR diff and check results after opening it. Address review feedback on the same branch, rerun relevant checks, and update the PR description if the scope changes.
5. Give the user the PR URL and its review status. Merge only when the user requests it or the task already authorizes it.

If repository access or a protected action is blocked, finish the local work that is possible and request the specific missing permission with the reason it is needed.
