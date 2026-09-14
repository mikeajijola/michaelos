# Navi QA

## Automated coverage

- Registry audit and manifest generation
- Registry-derived safe Navi shortlist
- Rejection of unknown capability IDs
- Rejection of entity slugs not returned by browser capabilities
- Acceptance of grounded project references
- Canonical CLI quoting and Action Key parity
- Capability Trace success and error construction
- Bubble ratio clamping and six-pixel drag threshold
- Legacy Action Key history compatibility

Run `npm test`, `npx tsc --noEmit`, `npm run capabilities:check`, and `npm run build` before release. In CI, the build's manifest check requires `MIKEOS_REVISION`, `GITHUB_SHA`, or `VERCEL_GIT_COMMIT_SHA`, rejects a revision that differs from checked-out HEAD, and emits `capabilities/conformance.json` for publication. `npm run capabilities:ci` provides the same enforcement explicitly. The artifact is generated after checkout and ignored by Git because a committed artifact cannot contain the hash of the commit that contains it without becoming self-referential and stale.

Local and deployed builds bind the runtime projection to `MIKEOS_REVISION`, `GITHUB_SHA`, or `VERCEL_GIT_COMMIT_SHA`, falling back to a clean checked-out Git HEAD at build time. The manifest check writes the separately evaluated `capabilities/conformance.json` build artifact. A dirty local worktree cannot truthfully name HEAD as the exact source and reports `indeterminate` with `WORKTREE_DIRTY`; a browser artifact without revision evidence reports `indeterminate` with `SUBJECT_REVISION_UNAVAILABLE`. A revision or generated-manifest digest mismatch reports `stale`. `testedAt` remains `null` unless the producer supplies both a tested timestamp and an evidence reference. `capabilities/baseline-manifest.json` remains historical and is used only by the delta capability.

## Manual route matrix

Test homepage-to-CV, project search then open, writing search, latest experience, follow-up references, clarification, unsupported requests, and forced invalid references. Confirm every accepted action appears in shared history and Inspector with caller `navigator` and is displayed as “Invoked by Navi.”

At 1440×900, 1024×768, and 390×844 verify the Landing Prompt, example wrapping, Bubble reachability, compact Panel, expanded trace scrolling, copy controls, Agent Console, lack of horizontal overflow, and virtual-keyboard behavior. Repeat primary flows with reduced motion.

For Bubble input, verify drag/click separation, safe-edge snapping, reload persistence, resize clamping, keyboard/menu repositioning, and reset. Verify Escape closes the Panel, focus returns to the Bubble, and opening moves focus to the Navi input.

## Static caret regression

Source inspection found no static `contentEditable`, typing-cursor pseudo-element, heading autofocus, or static `caret-color` rule. The removed duplicate deterministic console/launcher path no longer creates an overlapping focus surface. Manually verify homepage copy, headings, project cards, modal text, Navi inputs, and Agent CLI: carets must appear only in editable controls.

## Known deployment condition

Navi uses eve's backend runtime. A live conversation requires a correctly deployed eve runtime and model access configured outside the repository. Browser capability execution remains local and cannot be performed by the agent service.
