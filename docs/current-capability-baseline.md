# Current capability baseline

Captured on 2026-08-02 before recovery implementation.

## Repository identity

- Commit: `537a987c279c608f0712955500bc18bccfde483d`
- Recovery branch: `feature/navi-capability-recovery`
- Registered capabilities: 43
- Registry source: `src/capabilities/registry.ts`
- Generated baseline: `capabilities/baseline-manifest.json`

The generated manifest is the exhaustive record of descriptions, parameters, CLI commands, Action Key templates, accessibility labels, risks, and Navi exposure. Regenerate it with `npm run capabilities:baseline`; it imports the registry rather than duplicating definitions.

## Capability inventory

| Namespace | Capability IDs |
| --- | --- |
| system | `system.openCommandSurface`, `system.closeCommandSurface`, `system.minimiseCommandSurface`, `system.restoreCommandSurface`, `system.toggleCommandSurface`, `system.openTerminal`, `system.openAiConsole`, `system.openInspector`, `system.getApplicationInfo` |
| navigation | `navigation.goHome`, `navigation.goProjects`, `navigation.goExperience`, `navigation.goBlog`, `navigation.goCv`, `navigation.goCapabilities`, `navigation.goBack` |
| project | `project.list`, `project.search`, `project.view`, `project.filter`, `project.openExternal` |
| experience | `experience.list`, `experience.view`, `experience.filter` |
| article | `article.list`, `article.search`, `article.view`, `article.filterByTag`, `article.openExternal` |
| skill | `skill.list`, `skill.search`, `skill.filterByCategory` |
| cv | `cv.view`, `cv.navigateSection`, `cv.exportJson`, `cv.print` |
| inspector | `inspector.getLastExecution`, `inspector.listHistory`, `inspector.filterHistory` |
| accessibility | `accessibility.describeElement`, `accessibility.listPageActions`, `accessibility.moveFocus`, `accessibility.activateFocused` |

### Parameters

| Capability | Parameters |
| --- | --- |
| `project.list` | `featured: boolean` (optional) |
| `project.search` | `query: string` (required) |
| `project.view` | `slug: string` (required) |
| `project.filter` | `value: string` (required) |
| `project.openExternal` | `slug: string` (required) |
| `experience.view` | `id: string` (required) |
| `experience.filter` | `query: string` (required) |
| `article.search` | `query: string` (required) |
| `article.view` | `slug: string` (required) |
| `article.filterByTag` | `tag: string` (required) |
| `article.openExternal` | `slug: string` (required) |
| `skill.search` | `query: string` (required) |
| `skill.filterByCategory` | `category: string` (required) |
| `cv.navigateSection` | `section: string` (required) |
| `inspector.filterHistory` | `query: string` (required) |
| `accessibility.moveFocus` | `direction: enum(next, previous)` (required) |

All other baseline capabilities have no parameters. No current parameter uses a default value or an array type.

## Clients and invocation mappings

Existing caller values are `ui`, `terminal`, `agent`, `hotkey`, and `accessibility`. There is no `navigator` caller.

Agent CLI commands are:

- `help`
- `capabilities [--search text] [--category namespace] [--json]`
- `describe <capability-id> [--json]`
- `run <capability-id> [--name value] [--json '{"name":"value"}']`
- `history [--caller caller] [--capability id] [--json]`
- `clear`

Every capability has a CLI command and keyboard sequence. The exact sequence for every capability is recorded in `actionKeyTemplate` in the generated manifest. Parameter placeholders use `<name>` and sequences end in `ENTER`.

The Gateway implementation is in `src/capabilities/protocol.ts`. It requires these ordered chords, each with Control+Alt+Shift: `F9`, `F10`, `F11`, `F12`, `Home`, `End`. Each step has a 3-second timeout; Action Key capture has a 10-second timeout. Repeats do not advance the Gateway. Unit tests cover the pure Gateway state machine, not trusted browser function-key delivery.

## Routes and surfaces

Routes present in `src/app` are `/`, `/projects/`, `/experience/`, `/blog/`, `/cv/`, and `/capabilities/`. Next.js uses static export and trailing slashes.

The global Agent Console has three tabs:

- Agent CLI
- AI Console
- Inspector

The AI Console is a deterministic keyword router. It uses string `includes()` checks for projects, articles/writing, and CV. It is not FunctionGemma, does not perform model-generated tool selection, and is not Navi.

## Local persistence

- Capability history: localStorage key `michaelos.capability-history.v2`, capped at 250 events.
- CLI transcript: localStorage key `michaelos.terminal-transcript.v2`, capped at 200 entries.
- SQLite: `@sqlite.org/sqlite-wasm` in a dedicated worker.
- Durable database: OPFS `/michaelos.sqlite3` when `OpfsDb` is available.
- Degraded database mode: in-memory SQLite when OPFS is unavailable.
- `capability_history` is written to SQLite as well as localStorage.
- No remote persistence or telemetry is present.

## Tests and dependencies

The baseline has one test file, `src/capabilities/protocol.test.ts`, with three tests: registry completeness, shared CLI/keyboard resolution, exact Gateway activation, and reset/timeout/repeat behaviour (the last three Gateway behaviours share one test).

Runtime dependencies: Next.js 15.1, React 19, React DOM 19, SQLite WASM 3.49.1, xterm 6, xterm fit addon 0.11, and lucide-react 0.468. Development dependencies include TypeScript 5.7, Vitest 4.1, Tailwind 3.4, PostCSS, Autoprefixer, React/Node type packages, and `tsx` for deterministic manifest generation. Exact resolved versions are in `package-lock.json`.

## Browser-runtime assumptions

- Client-side navigation, DOM APIs, `window`, `document`, `localStorage`, workers, Blob URLs, and Web Crypto UUIDs are available where their capabilities execute.
- OPFS is preferred but optional; SQLite falls back to memory.
- External links and downloads require browser permission and user-agent support.
- No WebGPU, WebNN, model storage, model worker, model integrity verification, or browser-local inference exists.

## Missing intended capabilities

The registry does not contain `system.auditCapabilities`, `system.getCapabilityDelta`, `system.reportCapabilityIssue`, or `system.exportCapabilityReports`. It also lacks governance metadata, a versioned current manifest, breaking-change detection, report persistence/UI, the `navigator` caller, FunctionGemma runtime/storage, registry-generated Navi tools, candidate retrieval, validation, agent loop, Navi UI, and real-model browser tests.
