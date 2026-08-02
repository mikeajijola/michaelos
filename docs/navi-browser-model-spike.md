# Navi browser-model spike

## Outcome

**Status: BLOCKED — browser execution was not available in the recovery environment.**

The repository now contains an isolated static-page spike for a real browser-local
model, but this environment could not launch Chromium and therefore could not
produce model-inference evidence. Production Navi has not been implemented. This
is deliberately not recorded as a successful model spike.

## Candidate and implementation

| Item | Value |
| --- | --- |
| Model | `onnx-community/Qwen2.5-0.5B-Instruct` |
| Pinned revision | `cc5cc01a65cc3ff17bdb73a7de33d879f62599b0` |
| Runtime | `@huggingface/transformers` 4.2.0 |
| Quantisation | q4 |
| Intended backend | WebGPU |
| Execution boundary | Web Worker |
| Static route | `/spikes/navi-model/` |
| Test device | Pixel 9 Pro Fold, Android 16 |
| Browser version | NOT TESTED |

The worker loads the pinned model with `dtype: "q4"` and `device: "webgpu"`.
It receives six tool definitions generated from the live capability registry,
builds the strict JSON-only prompt, runs generation, and passes output through a
bounded decision parser. The worker cannot navigate, access SQLite, execute a
capability, or modify application state.

The parser accepts one JSON object, with an optional single surrounding JSON code
fence. It validates the decision type, offered tool, declared arguments, required
arguments, and primitive parameter types. Invalid output can be returned to the
model for at most two correction attempts. It does not evaluate code or perform
broad heuristic repair.

## Artifact inventory

The public model repository reported these files for the selected q4 path at the
time of the spike:

| Artifact | Size (bytes) |
| --- | ---: |
| `onnx/model_q4.onnx` | 786,156,820 |
| `tokenizer.json` | 7,031,673 |
| `tokenizer_config.json` | 7,306 |
| `config.json` | 678 |
| `generation_config.json` | 242 |
| **Known total** | **793,196,719** |

The source is publicly readable without a runtime token. No remote inference API
or API key is present in the spike. The model's source and converted-artifact
licence metadata must still be reviewed before MichaelOS republishes any weights;
this branch does not publish model artifacts.

## Storage design and evidence

Transformers.js uses browser Cache Storage for fetched model artifacts. The spike
checks the runtime cache state and writes versioned installation metadata to OPFS
at:

`michaelos-models/qwen2.5-0.5b-instruct.json`

This is a Cache Storage plus OPFS-metadata design. The model bytes are not claimed
to live in OPFS, and OPFS reuse is not claimed as proven. A successful second
browser session and its network trace are required before the reuse gate can pass.

## Representative prompt matrix

| Prompt | Expected decision | Actual result |
| --- | --- | --- |
| Open my CV. | `navigation.goCv` | NOT TESTED |
| Take me to the homepage. | `navigation.goHome` | NOT TESTED |
| Find Mike's platform engineering projects. | `project.search` | NOT TESTED |
| Open the Atlas Platform project. | `project.view` | NOT TESTED |
| What is Mike's most recent role? | `experience.list` | NOT TESTED |
| Find articles about local-first software. | `article.search` | NOT TESTED |
| Find Mike's quantum agriculture project. | `project.search` | NOT TESTED |
| Delete all of the data. | clarification/final answer; no tool execution | NOT TESTED |

## Evidence table

| Requirement | Status | Evidence |
| --- | --- | --- |
| Real browser-local inference | BLOCKED | No Chromium session could be started. |
| No remote inference API | PASS (implementation) | Worker uses the browser Transformers.js runtime only. |
| No runtime secret | PASS (implementation) | No token or inference credential is configured. |
| Static hosting | PASS (build) | Next.js static export includes the spike route. Browser execution remains untested. |
| Parseable structured decisions | NOT TESTED (model) | Parser unit tests pass; no raw model output exists. |
| At least 7/8 correct tools | NOT TESTED | No browser inference results exist. |
| No unavailable capability executed | PASS (boundary) | The spike never executes capabilities; parser rejects unoffered tools. |
| Schema-valid arguments or safe rejection | PASS (parser tests) | Unit tests cover valid and rejected decisions. Model argument quality is untested. |
| Artifact reuse after installation | NOT TESTED | No first or second browser model load completed. |
| CPU/WASM fallback | NOT TESTED | No fallback claim is made. |

Initialisation time, first-decision latency, subsequent-decision latency, memory
observations, raw output, parsed output, correct-tool rate, valid-JSON rate,
valid-argument rate, and zero-result behaviour are all **NOT TESTED**.

## Browser and network attempt

The static export was served locally with cross-origin isolation headers. Both an
Android VIEW intent and `termux-open-url` returned without opening a reachable
browser session. The server received no page request. A later `curl` diagnostic
produced one `HEAD /spikes/navi-model/?autorun=1` request, confirming the server
was reachable but providing no browser or model evidence.

Consequently:

- First-load model network requests: NOT TESTED.
- Second-load model network requests: NOT TESTED.
- OPFS restoration: NOT TESTED.
- Raw and parsed decisions: unavailable.

The Android/Termux package installation also required npm's `--force` option
because the optional native Node runtime does not advertise Android support. The
browser bundle excludes `onnxruntime-node`; the static build succeeds. This npm
constraint is not evidence that the WebGPU browser runtime works or fails.

## Reproduction

On a workstation with Chromium and WebGPU:

1. Install dependencies and run `npm run build`.
2. Run `node scripts/navi-spike-server.mjs`.
3. Open `http://127.0.0.1:8788/spikes/navi-model/?autorun=1` in Chromium.
4. Preserve `/tmp/michaelos-navi-spike-result.json` and the first-load request log.
5. Close the browser, restart it, repeat the run, and compare the second request
   log to prove whether the full artifact is reused.

Production Navi may proceed only after the missing browser evidence satisfies the
quality gate. Until then, the Agent CLI remains the truthful supported agent
interface.
