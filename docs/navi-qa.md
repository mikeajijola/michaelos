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

Run `npm test`, `npx tsc --noEmit`, and `npm run build` before release. Record the tested commit here after the final release commit.

## Manual route matrix

Test homepage-to-CV, project search then open, writing search, latest experience, follow-up references, clarification, unsupported requests, and forced invalid references. Confirm every accepted action appears in shared history and Inspector with caller `navigator` and is displayed as “Invoked by Navi.”

At 1440×900, 1024×768, and 390×844 verify the Landing Prompt, example wrapping, Bubble reachability, compact Panel, expanded trace scrolling, copy controls, Agent Console, lack of horizontal overflow, and virtual-keyboard behavior. Repeat primary flows with reduced motion.

For Bubble input, verify drag/click separation, safe-edge snapping, reload persistence, resize clamping, keyboard/menu repositioning, and reset. Verify Escape closes the Panel, focus returns to the Bubble, and opening moves focus to the Navi input.

## Static caret regression

Source inspection found no static `contentEditable`, typing-cursor pseudo-element, heading autofocus, or static `caret-color` rule. The removed duplicate deterministic console/launcher path no longer creates an overlapping focus surface. Manually verify homepage copy, headings, project cards, modal text, Navi inputs, and Agent CLI: carets must appear only in editable controls.

## Known deployment condition

Navi uses eve's backend runtime. A live conversation requires a correctly deployed eve runtime and model access configured outside the repository. Browser capability execution remains local and cannot be performed by the agent service.
