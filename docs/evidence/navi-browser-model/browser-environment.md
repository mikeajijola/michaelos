# Browser environment

- Chrome: 151.0.7922.71, stable amd64 package, headless desktop mode.
- Host: Ubuntu 24.04.4 LTS on KVM; device model unavailable (cloud VM).
- CPU: Intel Xeon at 2.20 GHz, 2 cores / 4 logical CPUs.
- Memory: 15 GiB installed, no swap.
- GPU: no PCI GPU exposed. Chrome reported ANGLE SwiftShader and normal-release WebGPU as `unavailable_software`.
- Page: `crossOriginIsolated === true`; `navigator.gpu` present; normal `requestAdapter()` returned `null`.
- No experimental flags: worker failed with `Failed to get GPU adapter` after artifact download.
- Unsafe diagnostic: `--enable-unsafe-webgpu --use-webgpu-adapter=swiftshader --use-gpu-in-tests` returned a software adapter, but model initialization failed with `Cannot read properties of undefined (reading 'destroy')`. This is not release-suitable evidence.
- WASM: exact pinned q4 pipeline reached `ready`, used about 4.5 GiB renderer RSS, and did not complete its first decision in the observed run.

No prompt suite, correction attempt, generation latency, raw model output, or parsed model decision exists because neither browser backend completed a first generation. Static application requests, model/runtime artifact requests, and browser-owned Chrome update traffic were observed; no inference API or request containing a prompt/response was observed.
