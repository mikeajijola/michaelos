# Lily navigation architecture

Lily is the conversational navigation agent for MichaelOS. She is built with Vercel's eve framework and uses registered capabilities to help visitors move through the website. Every action is validated and executed by MichaelOS in the browser.

## Surfaces and session

The application-shell `LilyProvider` owns one bounded Lily Session shared by the Lily Landing Prompt, Lily Bubble, Lily Panel, and Lily tab in the Agent Console. The browser persists the latest messages, compact structured result references, presentation state, and eve `SessionState` cursor. Route changes do not remount the provider.

The presentation states are landing idle/resolving/navigating, morphing to the Bubble, Bubble collapsed/open, and Agent Console open. Reduced-motion users skip the travelling morph while preserving the route update and live status.

## Proposal and execution boundary

1. The browser derives a safe capability shortlist from `navigator.enabled` registry metadata.
2. The Lily Controller sends the visitor request, current route, compact prior references, and shortlist to the eve agent.
3. eve returns schema-constrained output: one capability proposal, a clarification, or a final response.
4. The browser validates the proposal's ID, parameters, risk, and any entity reference.
5. The shared executor runs an accepted action with stored caller `navigator`.
6. When another turn is needed, the browser sends the confirmed structured execution result back to Lily.
7. The UI constructs Capability Trace entries from the resulting executor events.

The eve agent has no MichaelOS execution tools. It cannot access the DOM, client-side SQLite, portfolio components, browser navigation, Action Key formatting, or Agent CLI formatting. Entity-view proposals are accepted only when their slug or ID came from a preceding browser capability result.

## Filesystem-first eve definition

Lily's always-on definition is in `agent/instructions.md`; the public same-origin HTTP channel is in `agent/channels/eve.ts`. `withEve()` mounts the agent runtime beside Next.js. The browser uses `eve/client` with a per-turn JSON output schema and persists the framework continuation cursor.

No provider secret is stored in the repository. eve owns model runtime configuration and deployment authentication. This integration requires a server runtime and therefore replaces the former pure static-export build.

## Capability exposure

The registry remains the single list. Lily receives only entries whose registry definition has `navigator.enabled`, excluding write and destructive risks. The browser validates again immediately before execution. Lily never treats a proposal as a completed action.
