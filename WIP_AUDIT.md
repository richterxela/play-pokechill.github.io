# WIP and refactor audit

This is a starting inventory for `codex/refactor-wip-audit`. A marker or disabled file is a review candidate, not proof that the feature should be enabled. Keep original-branch saves compatible while working through this list.

| Area | Evidence | Status and next check |
| --- | --- | --- |
| Fork update banner | `scripts/PR/updateCheck.js` queried the creators' `main` branch and assigned a CSS class through `classList`. | Fixed in this branch: query the fork's `main` and use `className`. Verify the notification in an isolated browser session when the fork receives a new commit. |
| Custom and main challenges | The UI block in `index.html` and both `scripts/PR/challenges*.js` script tags are commented out. `challengesDictionary.js` has two sample main challenges. | Inactive. Review gameplay hooks and the proposed `saved.customChallenges` field before enabling it. Test imports from the creators' branch; do not enable this as a cosmetic cleanup. |
| Hidden ability display | `scripts/tooltip.js` shows `WIP` when a Pokémon has no `hiddenAbility` entry. | Determine whether the data is missing by design or still being authored before changing the label or ability behavior. |
| Ability balancing notes | `scripts/moveDictionary.js` has a TODO about hidden ability balance and Protean crosspower. | Needs game design decisions and combat checks; avoid changing balance during structural cleanup. |
| Legacy team preview file | `scripts/teamPreviews.js` initializes an older `saved.preview1` shape and is not loaded by `index.html`; active teams use `saved.previewTeams` in `scripts/teams.js`. | Confirm no external use before removing. Keep older save migrations in `scripts/script.js` intact. |

For each follow-up, keep a focused diff, document the observed behavior, and verify affected flows. Any change to persisted state needs an explicit compatibility check with an exported creators' save.
