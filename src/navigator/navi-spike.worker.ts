/// <reference lib="webworker" />
import { pipeline, ModelRegistry } from "@huggingface/transformers";
import { capabilities } from "@/capabilities/registry";
import { parseNavigatorDecision } from "./decision-parser";
import { buildNavigatorPrompt } from "./prompt";
import type { NavigatorTool } from "./types";

const MODEL_ID = "onnx-community/Qwen2.5-0.5B-Instruct";
const REVISION = "cc5cc01a65cc3ff17bdb73a7de33d879f62599b0";
const IDS = ["navigation.goHome", "navigation.goCv", "project.search", "project.view", "experience.list", "article.search"];
const tools: NavigatorTool[] = capabilities.filter(capability => IDS.includes(capability.id)).map(capability => ({ id: capability.id, description: capability.description, parameters: capability.params.map(({ name, type, required, description }) => ({ name, type, required, description })) }));
const prompts = ["Open my CV.", "Take me to the homepage.", "Find Mike's platform engineering projects.", "Open the Atlas Platform project.", "What is Mike's most recent role?", "Find articles about local-first software.", "Find Mike's quantum agriculture project.", "Delete all of the data."];

async function recordInstallMetadata(cached: boolean, backend: "webgpu" | "wasm") {
  const root = await navigator.storage.getDirectory(); const directory = await root.getDirectoryHandle("michaelos-models", { create: true });
  const handle = await directory.getFileHandle("qwen2.5-0.5b-instruct.json", { create: true }); const writable = await handle.createWritable();
  await writable.write(JSON.stringify({ modelId: MODEL_ID, revision: REVISION, dtype: "q4", backend, cacheStorageVerified: cached, recordedAt: new Date().toISOString() })); await writable.close();
}

self.onmessage = async (event: MessageEvent<{ type: "run"; backend?: "webgpu" | "wasm" }>) => {
  if (event.data.type !== "run") return;
  const backend = event.data.backend === "wasm" ? "wasm" : "webgpu";
  const started = performance.now();
  try {
    const generator = await pipeline("text-generation", MODEL_ID, { revision: REVISION, dtype: "q4", device: backend, progress_callback: progress => self.postMessage({ type: "progress", progress }) });
    const loadedAt = performance.now(); const results = [];
    for (const request of prompts) {
      const decisionStarted = performance.now(); let raw = ""; let parsed = parseNavigatorDecision(raw, tools); let attempts = 0;
      while (!parsed.ok && attempts < 3) {
        const prompt = buildNavigatorPrompt(request, tools, attempts ? parsed.error : undefined);
        const generated = await generator(prompt, { max_new_tokens: 128, do_sample: false, return_full_text: false });
        raw = String((generated[0] as { generated_text?: unknown }).generated_text ?? ""); parsed = parseNavigatorDecision(raw, tools); attempts++;
      }
      results.push({ request, raw, parsed, attempts, latencyMs: Math.round(performance.now() - decisionStarted) });
      self.postMessage({ type: "case", result: results.at(-1) });
    }
    const cache = await ModelRegistry.is_cached(MODEL_ID, { revision: REVISION, dtype: "q4", device: backend }); await recordInstallMetadata(cache, backend);
    self.postMessage({ type: "complete", evidence: { modelId: MODEL_ID, revision: REVISION, runtime: "@huggingface/transformers 4.2.0", dtype: "q4", backend, initialisationMs: Math.round(loadedAt - started), cacheStorageVerified: cache, results } });
  } catch (error) { self.postMessage({ type: "error", error: error instanceof Error ? `${error.name}: ${error.message}\n${error.stack ?? ""}` : String(error) }); }
};
