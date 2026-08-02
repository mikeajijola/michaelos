# Hermes QA baseline

This table records only what the supplied Hermes report established. “Proven” is preserved as historical report evidence; it is not a substitute for new regression testing on this branch.

| Area | Current status | Evidence boundary |
| --- | --- | --- |
| Main routes | PASS | Report exercised `/`, `/projects/`, `/experience/`, `/blog/`, `/cv/`, and `/capabilities/`. |
| Console open/minimise/restore/close | PASS | Demonstrated in the deployed application. |
| CLI discovery | PASS | Capability listing was demonstrated. |
| CLI describe | PASS | `describe <capability>` was demonstrated. |
| CLI execution | PASS | Shared execution through `run` was demonstrated. |
| CLI errors | PASS | Valid and invalid parameter handling was demonstrated. |
| CLI history and clear | PASS | Both behaviours were demonstrated. |
| One information control | PASS | One capability information control was exercised. |
| Zero-result deterministic routing | PASS | The deterministic AI Console handled one zero-result prompt. This does not prove agent parity or Navi. |
| Full Gateway sequence | NOT TESTED | Hermes could not generate trusted function-key events. |
| Action Key execution | NOT TESTED | Gateway activation was not established. |
| Hotkey caller parity | NOT TESTED | No end-to-end Gateway and Action Key execution occurred. |
| Mobile console | NOT TESTED | A homepage load is not full console coverage. |
| Mobile CLI | NOT TESTED | No full mobile CLI workflow evidence. |
| Mobile capability execution | NOT TESTED | No full mobile execution evidence. |
| Mobile Inspector | NOT TESTED | No full mobile Inspector evidence. |
| Full AI/agent parity | NOT TESTED | One deterministic zero-result prompt is insufficient. |
| Capability audit | ISSUE | `run system.auditCapabilities` returned capability-not-registered. |
| Capability delta | ISSUE | No delta capability or accepted manifest existed. |
| FunctionGemma | ISSUE | No model runtime existed. |
| Navi | ISSUE | Existing keyword routing is not Navi. |

Future QA reports must use `PASS`, `ISSUE`, `NOT TESTED`, or `BLOCKED`, state the tested client and viewport, and distinguish a fallback from the original feature. Architecture should remain “partially proven” until the untested clients and browser-agent path have direct evidence.
