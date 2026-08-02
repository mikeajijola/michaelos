# FunctionGemma browser spike results

Status: **BLOCKED**

Date: 2026-08-02

The hard gate did not pass. No production Navi implementation may proceed from this result.

## Target and environment

| Field | Result |
| --- | --- |
| Exact model ID | `google/functiongemma-270m-it` |
| Exact repository | `https://huggingface.co/google/functiongemma-270m-it` |
| Exact weight URL investigated | `https://huggingface.co/google/functiongemma-270m-it/resolve/main/model.safetensors` |
| Artifact format in target repository | Safetensors plus tokenizer/config files |
| Artifact version | Repository `main`; no immutable public browser artifact was identified |
| Target weight size | 536 MB as listed by the repository |
| Candidate runtime | `@litert-lm/core` 0.15.0 (latest npm release observed during spike) |
| Runtime support status | LiteRT-LM Web API early preview; WebGPU text input/output only |
| Browser version | NOT TESTED — no Chromium/Chrome executable is installed in this recovery environment |
| Operating system | Android 16, Linux 6.1.145, aarch64, Termux environment |
| Device | Google Pixel 9 Pro Fold |
| Backend selected | BLOCKED — no compatible exact-model web artifact |

## Investigation results

### 1. LiteRT-LM / LiteRT.js

BLOCKED. The current official [LiteRT-LM Web API documentation](https://developers.google.com/edge/litert-lm/js) says the JavaScript API is an early preview that runs in WebGPU. Its supported-model list contains only:

- `gemma-4-E2B-it-web.litertlm`
- `gemma-4-E4B-it-web.litertlm`

The documentation says support for general `.litertlm` files is still being expanded. It does not list FunctionGemma, WebNN, or a CPU/WASM LLM backend.

### 2. Exact FunctionGemma artifact

BLOCKED. The official [FunctionGemma repository](https://huggingface.co/google/functiongemma-270m-it/tree/main) lists `model.safetensors` (536 MB), tokenizer/config files, and `tiny_garden.litertlm` (288 MB). `tiny_garden.litertlm` is a specialized fine-tune/demo artifact and is not the exact `google/functiongemma-270m-it` instruction-tuned model required by the specification.

The repository is gated by license acceptance. A direct unauthenticated request to the exact safetensors URL returned:

```text
HTTP 401
Access to model google/functiongemma-270m-it is restricted. You must have access to it and be authenticated to access it
```

This prevents using that URL as the required public, token-free browser installation source. Embedding a Hugging Face token in browser code is explicitly prohibited.

### 3. MediaPipe browser inference

BLOCKED. MediaPipe release material indicates preparation for FunctionGemma in its web LLM API, but no official exact-model browser artifact and documented CPU/WASM fallback were identified. The available converted FunctionGemma community artifacts found during investigation are fine-tuned variants, which the stop condition forbids substituting without approval.

## Required spike evidence

| Evidence item | Status | Result |
| --- | --- | --- |
| Exact model loads in Chromium | BLOCKED | No supported public web artifact; Chromium unavailable locally. |
| Browser-local inference | NOT TESTED | Model could not be loaded. |
| No remote inference API | PASS (design only) | No remote inference was added or called. |
| No inference-time API key | BLOCKED | Official exact weights require authenticated license access. |
| WebGPU backend | BLOCKED | Runtime supports WebGPU, but not the exact target artifact. |
| WebNN backend | NOT TESTED | Not documented for the candidate LLM Web API. |
| CPU/WASM backend | BLOCKED | Candidate LLM Web API documents WebGPU only. |
| Two tools supplied | NOT TESTED | Inference could not start. |
| Model-generated valid tool call | NOT TESTED | Inference could not start. |
| Structured call parsing | NOT TESTED | No real output exists to parse. |
| Static Next.js deployment | NOT TESTED | No compatible runtime/model pair exists to integrate. |
| OPFS installation | NOT TESTED | No valid distributable artifact exists. |
| OPFS restore | NOT TESTED | Installation did not occur. |
| Second session avoids download | NOT TESTED | Installation did not occur. |

## Measurements

Download size, initial load time, first inference latency, subsequent inference latency, raw model output, parsed call, OPFS path, restore result, and first/second-load network traces are all **NOT TESTED** because the artifact/runtime gate failed before model download. Invented or non-model values are intentionally omitted.

The only direct target-artifact network request made was the unauthenticated safetensors request above; it returned HTTP 401 without downloading model weights.

## Errors encountered

1. The exact model’s weights are gated and require authenticated license acceptance.
2. The target repository has no exact-model web-compatible `.litertlm` artifact.
3. LiteRT-LM’s documented Web API supports only two Gemma 4 web models and WebGPU.
4. The required non-GPU fallback is not documented by the candidate web LLM runtime.
5. This recovery environment has no Chromium executable for real browser evidence.

## Stop decision

The spike is **BLOCKED**, not PASS. Per the recovery specification:

- Do not build the production Navi runtime, model storage, agent loop, or Navi UI.
- Do not use a different or fine-tuned model without approval.
- Do not add cloud inference.
- Do not relabel deterministic search as Navi.

The gate can be retried when a public, versioned, exact FunctionGemma browser artifact and a supported browser runtime/backend are available, or when the owner approves a materially different distribution or model strategy.
