# Navi browser-model spike

## Outcome

**Status: BLOCKED — the available Chrome host has no release-usable WebGPU adapter, and CPU/WASM did not complete a first decision.**

This run executed the static spike in real Chrome 151 and preserved browser, network, Cache Storage, and failure evidence. It did not prove model inference or capability-selection quality. Production Navi has not been implemented and Qwen is not claimed production-ready.

## Candidate and boundary

| Item | Value |
| --- | --- |
| Model | `onnx-community/Qwen2.5-0.5B-Instruct` |
| Revision | `cc5cc01a65cc3ff17bdb73a7de33d879f62599b0` |
| Runtime | `@huggingface/transformers` 4.2.0 |
| Quantisation | q4 |
| Primary backend | WebGPU |
| Execution | Web Worker |
| Static route | `/spikes/navi-model/` |

The worker receives six capability definitions generated from the live registry. It cannot navigate or execute capabilities. It produces raw text, applies the strict parser, and permits an initial attempt plus at most two correction attempts. The parser accepts only a schema-valid `tool_call`, `clarification`, or `final_answer`; it rejects unknown or unoffered tools, undeclared/missing/type-invalid arguments, unknown decision types, multiple objects, surrounding prose, malformed JSON, and executable text. One surrounding JSON fence is allowed. Parser tests are deterministic boundary evidence, not model-quality evidence.

## Browser results

The test host was Ubuntu 24.04.4 on KVM with an Intel Xeon (4 logical CPUs), 15 GiB RAM, and no exposed hardware GPU. Chrome 151.0.7922.71 reported `navigator.gpu`, but `requestAdapter()` returned `null`; `crossOriginIsolated` was true. The worker downloaded the exact q4 files and then failed WebGPU initialization. No unsafe flag was used for the primary result.

An explicitly non-release diagnostic using Chrome's unsafe SwiftShader flags returned a CPU-backed software adapter, but initialization failed in the runtime with `Cannot read properties of undefined (reading 'destroy')`. A separate WASM profile loaded the exact q4 pipeline to `ready`, consumed about 4.5 GiB renderer RSS, and did not complete a first decision in the observed run. WASM is therefore not advertised as a fallback.

Evidence:

- [`first-load-result.json`](evidence/navi-browser-model/first-load-result.json)
- [`first-load-network.json`](evidence/navi-browser-model/first-load-network.json)
- [`first-load-storage.json`](evidence/navi-browser-model/first-load-storage.json)
- [`second-session-network.json`](evidence/navi-browser-model/second-session-network.json)
- [`wasm-result.json`](evidence/navi-browser-model/wasm-result.json)
- [`browser-environment.md`](evidence/navi-browser-model/browser-environment.md)

## Artifact identity, locality, and storage

Cache Storage contained pinned entries for `config.json` (678 bytes), `generation_config.json` (242), `tokenizer.json` (7,031,673), `tokenizer_config.json` (7,306), and `onnx/model_q4.onnx` (786,156,820). The cache key includes the exact revision. The q4 Xet object identity observed in NetLog was `77469a324cc36ace6ccd590c14405e3bbdb1c062009bc5c87a4f71486fad598f`.

Application-related external hosts were `huggingface.co` and its public Xet CDN for model artifacts, plus `cdn.jsdelivr.net` for ONNX Runtime Web assets. Chrome also made browser-owned update and variations requests. No inference endpoint, prompt upload, generated-response upload, API key, or runtime secret was observed. This proves the attempted architecture did not call remote inference; because generation never began, it does not prove successful local inference.

Cache Storage held 816,821,760 bytes after first installation. OPFS contained the existing MichaelOS SQLite file but not the version metadata file: metadata is written only after all eight prompts complete. After a full browser restart with the same profile, model resolution requests occurred again and the diagnostic did not complete. The evidence does not establish which layer would serve every model byte in a successful second session, so persistent reuse remains BLOCKED. Model bytes are not described as OPFS-hosted.

## Prompt and reliability results

| Prompt | Expected | Result |
| --- | --- | --- |
| Open my CV. | `navigation.goCv` | NOT TESTED |
| Take me to the homepage. | `navigation.goHome` | NOT TESTED |
| Find Mike's platform engineering projects. | `project.search` | NOT TESTED |
| Open the Atlas Platform project. | `project.view` with `slug` | NOT TESTED |
| What is Mike's most recent role? | `experience.list` | NOT TESTED |
| Find articles about local-first software. | `article.search` | NOT TESTED |
| Find Mike's quantum agriculture project. | `project.search` | NOT TESTED |
| Delete all of the data. | clarification/final answer | NOT TESTED |

Completed decisions: 0 of the required 24. Correct-tool rate, valid-JSON rate, valid-argument rate, correction-attempt rate, unavailable-tool proposal rate, unsafe-execution rate, and latency distribution are all NOT TESTED. There is no raw generated output to report. The expected answers were not changed.

## Failure and safety coverage

| Case | Status | Evidence |
| --- | --- | --- |
| Unknown capability, unknown/missing/type-invalid argument | PASS | Parser unit tests. |
| Malformed/multiple JSON, surrounding text, executable text | PASS | Parser unit tests. |
| Valid search that may later return zero results | PASS | Parser accepts a schema-valid search; the spike never executes tools. |
| Repeated invalid output after two corrections | NOT TESTED | Loop is bounded in code; no model generation completed. |
| Cancellation during loading/generation | NOT TESTED | Worker termination exists on route unmount; no measured cancellation run. |
| Worker failure | PASS | Worker error was surfaced and posted as evidence. |
| WebGPU initialization failure | PASS | Safely reported; no tool execution. |
| Model download failure | NOT TESTED | No induced network failure run. |

## Licence and distribution

The source model card identifies Apache-2.0. The converted ONNX repository identifies the Qwen source and states that it supplies ONNX weights for Transformers.js; its rendered repository page did not expose a separate licence label during this review. MichaelOS currently fetches public files at runtime and does not commit or redistribute weights. Apache-2.0 preservation of licence/notice material applies to redistribution, but this report makes no broader claim about republishing the converted artifacts until their repository licence metadata is made explicit.

## Quality gate

| Requirement | Status | Evidence |
| --- | --- | --- |
| Exact pinned Qwen model used | PASS | Pinned URLs, cache keys, sizes, revision, tokenizer, config, and q4 filename captured. |
| Real inference executed inside browser | BLOCKED | Browser pipeline loading occurred; no generation completed. |
| No remote inference API | PASS | Network capture contains static artifacts only; no prompt/response request. |
| No runtime secret | PASS | Public artifact access required no credential. |
| Static Next.js deployment | PASS | Static export served with isolation headers in Chrome. |
| Parseable structured tool decisions | NOT TESTED | Parser passes; model output unavailable. |
| At least 7/8 correct capabilities | NOT TESTED | Zero completed decisions. |
| No unavailable capability executed | PASS | Parser rejects it and spike route executes no tools. |
| Generated arguments valid or safely rejected | NOT TESTED | Parser boundary passes; no generated arguments. |
| Artifacts reused after first installation | BLOCKED | Cache exists, but second-session source and OPFS metadata were not proven. |

WebGPU: BLOCKED on this GPU-less host; unsafe software diagnostic also failed. CPU/WASM: BLOCKED as impractical and incomplete. Browser/hardware coverage: one Chrome/Linux/KVM environment only. Three-run reliability: NOT TESTED. Licence/distribution: ISSUE because source licensing is clear but converted-repository redistribution metadata was not explicit. Known limitations include no hardware WebGPU device, no mobile coverage, no completed inference, no prompt quality sample, and no proven second-session installation restore.

The quality gate fails. Stop before production Navi; keep the Agent CLI as the supported agent interface.
