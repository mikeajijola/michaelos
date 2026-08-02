# FunctionGemma alternative browser-runtime spike

Status: **BLOCKED**  
Date: 2026-08-02  
Branch: `feature/navi-runtime-spike-2`

This spike investigated the exact FunctionGemma lineage through browser runtimes other than LiteRT-LM JS. It did not pass every required gate. No Navi UI, agent loop, remote inference, browser secret, or model weights were added.

## Model identity and licence

| Field | Finding |
| --- | --- |
| Required source | `google/functiongemma-270m-it` |
| Official source revision | **BLOCKED** — official weights are gated and the conversion does not identify its immutable source commit |
| Converted repository | `onnx-community/functiongemma-270m-it-ONNX` |
| Converted revision tested | `ba3c872ede162a5c4ab753f509b2260af5587143` |
| Access | Public and ungated |
| Declared lineage/licence | `google/functiongemma-270m-it`; Gemma |
| Redistribution compliance | **BLOCKED** — public availability and a licence tag do not independently establish MichaelOS redistribution rights |

The official distribution requires per-user licence acceptance and authentication. The ONNX conversion shows a possible distribution path, but no weights may be republished until its provenance and the Gemma licence are reviewed.

## Transformers.js investigation

Runtime: `@huggingface/transformers` 4.2.0.

| Check | Result |
| --- | --- |
| Architecture | PASS — resolved as `Gemma3ForCausalLM` |
| Tokenizer | PASS — `GemmaTokenizer` loaded |
| Specialized chat template | PASS — 13,792-character FunctionGemma template loaded |
| Function-call tokens | PASS — FunctionGemma call/response markers were retained |
| Two tools | PASS — `navigation__goCv` and `project__search` rendered into the prompt |
| CPU/WASM inference | BLOCKED — model loading failed before inference |
| WebGPU inference | NOT TESTED — CPU/WASM was required first |
| Chromium execution | NOT TESTED — no Chromium executable exists in this environment |

The generated prompt included both declarations in FunctionGemma’s native format:

```text
<start_function_declaration>declaration:navigation__goCv{description:<escape>Open Mike’s CV.<escape>,parameters:{type:<escape>OBJECT<escape>}}<end_function_declaration>
<start_function_declaration>declaration:project__search{description:<escape>Search Mike’s projects.<escape>,parameters:{properties:{query:{description:<escape>Words to search for.<escape>,type:<escape>STRING<escape>}},required:[<escape>query<escape>],type:<escape>OBJECT<escape>}}<end_function_declaration>
```

This is tokenizer evidence, not model output.

### Probe failures

1. Transformers.js 4.2 names its browser CPU/WASM device `cpu`; `wasm` is rejected as an unsupported device name.
2. With `device: "cpu"` and `dtype: "q4"`, tokenizer/config and the small ONNX graph were fetched, but external data loading ended with `Error: Unable to get model file path or buffer.`
3. Running the web bundle under Node would not qualify as real-browser evidence even if it completed.
4. Normal package installation on Android/Termux failed because the direct `onnxruntime-node` dependency excludes Android. A forced temporary installation was used only for investigation and then removed.

Raw generated output and parsed function call are both **NOT TESTED** because inference never began. No example output was substituted for real evidence.

## ONNX artifacts and conversion

The immutable converted revision contains:

| Variant | Graph bytes | External data | Approximate total |
| --- | ---: | ---: | ---: |
| FP32 | 502,654 | 1,139,501,568 | 1.14 GB |
| FP16 | 619,409 | 569,862,656 | 570 MB |
| Q4 | 430,147 | 801,090,048 | 802 MB |
| Q4F16 | 518,626 | 425,724,416 | 426 MB |

Tokenizer data adds 20,316,979 bytes.

Conversion commands are **BLOCKED**. The conversion repository does not document the exact exporter command/version, official source revision, calibration inputs, or quantization process. A generic Optimum command would not reproduce this artifact’s provenance and is therefore not presented as the actual conversion.

## Remaining runtime order

Transformers.js already uses ONNX Runtime Web in browsers and preserves the generation/tokenizer layer. A lower-level ONNX Runtime implementation would not resolve the provenance, Chromium, OPFS, or licence blockers, so it was not pursued after the higher-level failure.

Public GGUF conversions exist, but a compliant artifact with proven source revision, browser execution, OPFS restore, and redistribution rights was not established. GGUF inference is **NOT TESTED**; no GGUF artifact was downloaded.

## OPFS, hosting, and network evidence

Static hosting compatibility, OPFS installation, OPFS restore, and a second load without network are all **NOT TESTED**. Browser cache behaviour would not substitute for explicit OPFS evidence.

No inference API was called. One confirmed public artifact request was:

```text
HEAD https://huggingface.co/onnx-community/functiongemma-270m-it-ONNX/resolve/ba3c872ede162a5c4ab753f509b2260af5587143/onnx/model_q4.onnx_data
HTTP 200
Content-Length: 801090048
Access-Control-Allow-Origin: *
```

A complete Chromium network trace is **NOT TESTED**.

## Success gate

| Requirement | Status |
| --- | --- |
| Exact FunctionGemma used | BLOCKED — declared lineage exists; immutable source provenance is missing |
| Browser-local inference | NOT TESTED |
| Real function call | NOT TESTED |
| No remote inference | PASS |
| No runtime secret | PASS for the converted public endpoint |
| Static hosting | NOT TESTED |
| OPFS restore | NOT TESTED |
| Licence-compliant redistribution | BLOCKED |

## Stop decision

The spike is **BLOCKED**, not PASS. Production Navi must not proceed. A retry requires a controlled Chromium environment, reproducible conversion from an identified official revision, real CPU/WASM inference, raw and parsed two-tool output, OPFS second-session evidence, a full network trace, and confirmed redistribution rights before any model publication.
